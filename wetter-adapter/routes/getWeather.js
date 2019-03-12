let express = require('express');

let router = express.Router();

router.get('/getWeather', (req, res) => {
    const time = req.time;
    const location = req.location;

    // send mock-up answer
    result = {      
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

    res.send(result);
});

module.exports = router;
