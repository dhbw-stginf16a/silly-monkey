const express = require('express');

const getHORecommendation = require('./routes/getHORecommendation');

const app = express();
const routre = express.Router();

const port = 5014;

app.use('/getHORecommendation', getHORecommendation)

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(port, () => {
    console.log(`app listening on port ${port}!`);
});

module.exports = app;
