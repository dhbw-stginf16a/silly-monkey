const express = require('express');
const getVvsInfo = require('./routes/getVvsInfo');

const app = express();

const port = 5006;

app.use('/getVvsDepartures', getVvsInfo);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`vvs listening on port ${port}`);
});

module.exports = app;