const express = require('express');
const https = require('https');
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

const router = express.Router();
const trafficUrl = 'https://www.verkehrsinfo.de/httpsmobil';

router.get('/', async (req, response) => {
    const streets = req.query.streets.split(', ');
    let result = [];

<<<<<<< HEAD
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
=======
    streets.forEach(async (street) => {
        const tempResult = [];
        await https.get(`${trafficUrl}/?c=staulist&street=${street}`, (res) => {
            let trafficData = '';

            res.on('data', (chunk) => {
                trafficData += chunk;
            });

            res.on('end', () => {
                const dom = new JSDOM(trafficData);
                const document = dom.window.document;

                //c onsole.log(document.querySelector('div.message span.message_heading').innerHTML);
                // console.log(document.querySelector('div.message').childNodes[4].innerHTML);

                const directions = document.querySelectorAll('div.messsage span.message_heading');
                const messages = document.querySelectorAll('div.message');

                
                directions.forEach((direction, index) => {
                    tempResult.push({
                        street: street,
                        direction: direction.innerHTML,
                        message: messages[index].childNodes[4].innerHTML
                    });

                    console.log(tempResult);
                });
            });

            res.on('error', (err) => {
                console.log('failed to retrieve traffic data');
                console.log(err);
            });
        });+

        console.log(tempResult);
    });

    console.log(result);

    response.send(result);
});
>>>>>>> complete logic

module.exports = router;