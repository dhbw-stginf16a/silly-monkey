const express = require('express');
const https = require('https');
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

const router = express.Router();
const trafficUrl = 'https://www.verkehrsinfo.de/httpsmobil';

router.get('/', async (req, response) => {
    const streets = req.query.streets.split(', ');
    let result = [];

    for(let i = 0; i < streets.length; i++) {
        const content = await getContentFromApi(streets[i]);
        // console.log(content);
        result = result.concat(content);
    }

    // console.log(result);

    response.send(result);
});


function getContentFromApi(street) {
    return new Promise((resolve, reject) => {
        https.get(`${trafficUrl}/?c=staulist&street=${street}`, (res) => {
            let trafficData = '';
    
            res.on('data', (chunk) => {
                trafficData += chunk;
            });
    
            res.on('end', () => {
                // console.dir(trafficData, { depth: null, colors: true });
                const dom = new JSDOM(trafficData);
                const document = dom.window.document;
                const headings = Array.from(document.querySelectorAll('div.message span.message_heading'));
                const messages = Array.from(document.querySelectorAll('div.message'));

                const result = [];

                headings.forEach((el, index) => {
                    const heading = el.innerHTML;
                    const message = messages[index].childNodes[4].innerHTML;

                    result.push({
                        street: street,
                        direction: heading,
                        message: message
                    });
                });
    
                resolve(result);
            });
    
            res.on('error', (err) => {
                console.log(`failed to retrieve traffic data for street ${street}`);
                console.log(err);
            });
        });
    });
    
}

module.exports = router;