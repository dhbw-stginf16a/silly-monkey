let express = require('express');
let getWeather = require('./routes/getWeather');

let app = express();

const port = 5004;

app.use('/getWeather', getWeather);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log('app listening on port 5004!');
});

module.exports = app;