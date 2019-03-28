const express = require('express');
const axios = require('axios');

const router = express.Router();

const vvsAdapter = 'http://vvs-adapter:5006/getVvsDepartures';
const trafficAdapter = 'http://verkehr-adapter:5005/getTrafficInfo';
const feinstaubAdapter = 'http://feinstaub-adapter:5001/isAlarm';
const pollenAdapter = 'http://pollen-adapter:5003/getPollen';
const dbConnectionViaTriggerRouter = 'http://trigger-router:5000/database';

router.get('/', async (req, res) => {
    // get preferences
    const region = axios(`${dbConnectionViaTriggerRouter}/region`);
    const roads = axios(`${dbConnectionViaTriggerRouter}/favRoads`);
    const pollenPref = axios(`${dbConnectionViaTriggerRouter}/pollen`);
    const homeStation = axios(`${dbConnectionViaTriggerRouter}/homeStation`);

    const pollenPrefString = (await pollenPref).data.value.pollen.join(', ');
    const regionPref = (await region).data.value.region;
    const roadsPref = (await roads).data.value.roads;
    const homeStationPref = (await homeStation).data.value.homeStation;

    // get info from adapters
    const feinstaub = axios(feinstaubAdapter);
    const pollen = axios(`${pollenAdapter}?pollen=${pollenPrefString}&place=${regionPref}`);
    const traffic = axios(`${trafficAdapter}?streets=${roadsPref}`);
    const vvs = axios(`${vvsAdapter}?stationname=${homeStationPref}`);

    const feinstaubData = (await feinstaub).data.isAlarm;
    const pollenData = (await pollen).data;
    const trafficData = (await traffic).data;
    const vvsData = (await vvs).data;

    let decision = {};
    // for all things taken into account: true -> pro home office || false -> contra home office
    // check train delays
    const delays = vvsData.filter((departure) => departure.delay > 10);
    if (delays.length > 5) {
        decision.train = true;
    } else {
        decision.train = false;
    }

    // check feinstaub
    if (feinstaubData) {
        decision.feinstaub = true;
    } else {
        decision.feinstaub = false;
    }

    // check pollen count
    Object.keys(pollenData).forEach((key) => {
        if (pollenData[key].today >= 2) {
            decision.pollen = true;
        } else if (pollenData[key].today < 2 && !decision.pollen === true) {
            decision.pollen = false;
        }
    });

    const trafficMessages = trafficData.filter((element) => element.direction.indexOf('Richtung Stuttgart') > -1);
    if (trafficMessages > 1) {
        decision.traffic = true;
    } else {
        decision.traffic = false;
    }
    
    
    // feinstaub + delays => home office
    // feinstaub + pollen => home office
    // feinstaub only => no home office
    if (decision.feinstaub) {
        if (decision.train) {
            res.send({ answer: 'As there is an air quality warning active and there seem to be an awful lot of delayed trains today, I recommend that you stay at home today.' });
        } else if (decision.pollen) {
            res.send({ answer: 'As there is an air quality warning active and a rather high pollen count, I recommend that you stay inside today. If you do need to go outside, the trains do not seem to have a lot of delays today.' });
        } else {
            res.send({ answer: 'As there is an air quality warning active but the trains seem to be on time and the pollen count is rather low, I would recommend that you go to your office today.' }); 
        }
    } else {
        // bad traffic + delays => home office
        // bad traffic only => no home office, take train
        if (decision.traffic) {
            if (decision.train) {
                res.send({ answer: 'As there is a lot of traffic on your preferred roads and the trains seem to have a lot of delays today, I recommend that you stay at home today.' });
            } else {
                res.send({ answer: 'As there is a lot of traffic on your preferred roads today, I recommend that you go to your office by train today.' });
            }
        } else {
            // good traffic + pollen => home office, but warning about pollen
            // good traffic, no pollen, no feinstaub => enthusiastic response about going to work
            if (decision.pollen) {
                res.send({ answer: 'As there is not a lot of traffic on your preferred roads, I recommend that you go to your office today. Be mindful of the high pollen count, though!' });
            } else {
                res.send({ answer: 'There is nothing that could keep you from going to your office today!' });
            }
        }
    }
    
});

module.exports = router;
