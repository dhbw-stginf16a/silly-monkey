const express = require('express');
const axios = require("axios");

const router = express.Router();
const allStationsUrl = 'https://efa-api.asw.io/api/v1/station/';

router.get('/', async (req, res) => {
    const stationName = req.headers.stationname;
    console.log(stationName);

    if(typeof stationName == 'undefined') {
        res.send("Error. Stationname not available.");
        return;
    }

    const stationId = await getStationIdByName(stationName);

    if(stationId == 0) {
        res.send("Error. Stationname not available.");
        return;
    }

    const stationDepUrl = allStationsUrl + stationId + "/departures/";

    const stationDep = await axios(stationDepUrl);

    res.send(stationDep.data);
});

async function getStationIdByName(stationName) {
    //return new Promise(async (resolve, reject) => {
        var allStationsJson = await axios(allStationsUrl);
        allStationsJson = allStationsJson.data;
        console.log(allStationsJson);
        /*allStationsJson.replace('[', '{');
        allStationsJson.replace(']', '}');

        console.log(allStationsJson);*/

    

       // var allStations = JSON.stringify(allStationsJson.data);
        //var allStationsObj = JSON.parse(allStations.toString());

        //console.log(allStationsObj);

        for (let station of allStationsJson) {
            if(station.fullName == stationName) {
                console.log(station.stationId);
                return (station.stationId);
            }
        };

        return(0);
    //});
}

module.exports = router;