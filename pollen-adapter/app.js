let express = require('express');
let getPollen = require('./routes/getPollen');

let app = express();

const port = 5003;

app.use('/getPollen', getPollen);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log('app listening on port 5003!');
});

module.exports = app;