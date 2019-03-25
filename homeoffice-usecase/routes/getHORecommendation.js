const express = require('express');
const axios = require('axios');

const router = express.Router();

const vvsAdapter = 'http://localhost:5006/getVvsDepartures';
const trafficAdapter = 'http://localhost:5005/getTrafficInfo';
const feinstaubAdapter = 'http://localhost:5001/isAlarm';
const pollenAdapter = 'http://localhost:5003/getPollen';
const dbConnectionViaTriggerRouter = 'http://localhost:5000/database';

router.get('/', async (req, res) => {
    // get preferences
    console.log('about to fetch preferences');
    const locationPref = await axios(`${dbConnectionViaTriggerRouter}/location`).data.value.location;
    console.log('got location preferences');
    const trainPref = await axios(`${dbConnectionViaTriggerRouter}/homeStation`).data.value.homeStation;
    console.log('got train preferences');
    const roadPref = await axios(`${dbConnectionViaTriggerRouter}/favRoads`).data.value.favRoads;
    console.log('got road preferences');
    const pollenPref = await axios(`${dbConnectionViaTriggerRouter}/pollen`);
    console.log('got pollen preferences');

    // get info from adapters
    const feinstaub = await axios(feinstaubAdapter, {params: {'location': locationPref}}).data.value.isAlarm;
    const pollen = await axios(`${pollenAdapter}/getPollen?pollen=${pollenPref.join(', ')}`).data.value;
    const traffic = await axios(`${trafficAdapter}/getTrafficInfo`).data.value;
    const vvs = await axios(`${vvsAdapter}/getVvsDepartures`).data.value;
    res.send('You should go to your office today.');
});

module.exports = router;