let express = require('express');

let router = express.Router();

router.get('/', (req, res) => {
    const pollen = req.pollen;
    const place = req.place;

    // send mock-up answer
    result = {
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

    res.send(result);
});

module.exports = router;