let express = require('express');
let getWeather = require('./routes/getWeather');
let bodyParser = require('body-parser');

let app = express();

const port = 5004;
app.use(bodyParser.json());
app.use('/getWeather', getWeather);

app.get('/', (req, res) => {
    res.send('Hello World!3');
});


app.listen(port, () => {
    console.log('app listening on port 5004!');
});

module.exports = app; 