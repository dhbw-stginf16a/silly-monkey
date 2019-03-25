const express = require('express');
const axios = require("axios");

const router = express.Router();
const allStationsUrl = 'https://efa-api.asw.io/api/v1/station/';

router.get('/', async (req, res) => {
    const stationName = req.query.stationname;
    //console.log(stationName);

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

    //
    var stationDepartures = stationDep.data;
    var returnDep = [];

    //return only trains running in next 20 min
    var dateTemp = new Date();
    var dateNow = new Date();

    for (let dep of stationDepartures) {
        //console.log(dep);
        dateTemp.setHours(dep.departureTime.hour-1);
        dateTemp.setMinutes(dep.departureTime.minute);

        var minuteDifference =  parseInt((dateTemp.getTime() - dateNow.getTime())/1000/60);
        //console.log(minuteDifference);
  
        if(minuteDifference < 21) {
          returnDep.push(dep);
        }
    }

    //console.log(returnDep);

    res.send(returnDep);
});

async function getStationIdByName(stationName) {
    //return new Promise(async (resolve, reject) => {
        var allStationsJson = await axios(allStationsUrl);
        allStationsJson = allStationsJson.data;
        //console.log(allStationsJson);
       
        for (let station of allStationsJson) {
            if(station.fullName == stationName) {
                //console.log(station.stationId);
                return (station.stationId);
            }
        };

        return(0);
    //});
}

module.exports = router;