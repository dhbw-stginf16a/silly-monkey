const express = require('express');
const getTrafficInfo = require('./routes/getTrafficInfo');

const app = express();

const port = 5005;

app.use('/getTrafficInfo', getTrafficInfo);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`verkehr listening on port ${port}`);
});

module.exports = app;