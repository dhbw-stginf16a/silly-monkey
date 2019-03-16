const express = require('express');
const request = require('request-promise');

let router = express.Router();

router.get('/', (req, response) => {
    const time = req.headers.time;
    const location = req.headers.location;
    const country = req.headers.country;

    let status = "";

    /* send mock-up answer
    result = {
                {
                    "dt": 1551884400,
                    "main": {
                    "temp": 285.96,
                    "temp_min": 285.54,
                    "temp_max": 285.96,
                    "pressure": 1004.7,
                    "sea_level": 1004.7,
                    "grnd_level": 942.09,
                    "humidity": 72,
                    "temp_kf": 0.42
                    },

                    "weather": [
                        {
                            "id": 801,
                            "main": "Clouds",
                            "description": "few clouds",
                            "icon": "02d"
                        }
                    ],

                    "clouds": {
                        "all": 12
                    },

                    "wind": {
                        "speed": 2.87,
                        "deg": 131.002
                    },

                    "sys": {
                        "pod": "d"
                    },

                    "dt_txt": "2019-03-06 15:00:00"
                }
            }
               */

    var options = {
        method: 'GET',
        uri: "https://api.openweathermap.org/data/2.5/forecast?q=" + location + "," +
            country + "&appid=ae1433b863e8574363b6be3e00a9d807",

        json: true // Automatically stringifies the body to JSON
    };

    let stringToGet = "https://api.openweathermap.org/data/2.5/forecast?q=" + location + "," +
                        country + "&appid=ae1433b863e8574363b6be3e00a9d807";


    request
        .get(options)
        .then(function (res) {
            let result = res.list[0];
            for (i = 0; i < res.list.length; i++){
                if(res.list[i].dt < time){
                    result = res.list[i];
                }
            }
            response.send(result);
        })
        .catch(function (err) {
            console.log(err);
        });

});


module.exports = router;