const express = require('express');
const https = require('https');
const util = require('../util/util.js')

let router = express.Router();

// example answer
    /* result = {
        'Hasel': {
            'today': 0,
            'tomorrow': 1,
            'dayafter_to': 1,
        },
        'Erle': {
            'today': 2,
            'tomorrow': 2.5,
            'dayafter-to': 1,
        },
    }
    */

router.get('/', (req, response) => {
    const pollen = req.query.pollen.split(', ');
    const place = req.query.place;

    https.get('https://opendata.dwd.de/climate_environment/health/alerts/s31fg.json', (res) => {
        let dwdData = '';

        // A chunk of data has been recieved.
        res.on('data', (chunk) => {
            dwdData += chunk;
        });

        // The whole response has been received. Print out the result.
        res.on('end', () => {
            let result = {};
            let dataJson = JSON.parse(dwdData).content;
            // console.dir(dataJson, { depth: null, colors: true });

            // keep only data for the place provided
            dataJson = dataJson.filter((json) => json.partregion_name === place);
            // console.dir(dataJson[0].Pollen, { depth: null, colors: true });

            // add the data for each allergy to the result object
            // if the allergy is not featured in the API, the object contains -1 only
            pollen.forEach(allergy => result[allergy] = dataJson[0].Pollen[allergy] || -1);

            // convert each string to a number 0 <= x <= 3
            Object.keys(result).forEach((keyPollen) => {
                Object.keys(result[keyPollen]).forEach((keyDegree) => {
                    let number = util.convertStringToNumber(result[keyPollen][keyDegree]);
                    result[keyPollen][keyDegree] = number;
                });
            });
            
            // console.dir(result, { depth: null, colors: true });
            response.send(result);
        });

        }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
});

module.exports = router;