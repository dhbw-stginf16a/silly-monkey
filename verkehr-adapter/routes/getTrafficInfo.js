const express = require('express');
const https = require('https');
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

const router = express.Router();
const trafficUrl = 'https://www.verkehrsinfo.de/httpsmobil';

router.get('/', (req, response) => {
    const streets = req.query.streets.split(', ');

    https.get(`${trafficUrl}/?c=staulist&street=A1`, (res) => {
        let trafficData = '';

        res.on('data', (chunk) => {
            trafficData += chunk;
        });

        res.on('end', () => {
            // console.dir(trafficData, { depth: null, colors: true });
            const dom = new JSDOM(trafficData);
            const document = dom.window.document;
            console.log(document.querySelector('div.message span.message_heading').innerHTML);
            console.log(document.querySelector('div.message').childNodes[4].innerHTML);

            result = [
                {
                    street: 'A1',
                    direction: 'Koeln Richtung Euskirchen',
                    message: 'zwischen Frechen und Gleuel (105) Fahrbahnausbesserung, Richtungsfahrbahn gesperrt, bis 11.03.2019 05:00 Uhr ',
                }
            ]

            response.send(result);
        });

        res.on('error', (err) => {
            console.log('failed to retrieve traffic data');
            console.log(err);
        });
    });
});

module.exports = router;