let express = require('express');
let getOverview = require('./routes/getOverview');
let bodyParser = require('body-parser');

let app = express();

const port = 5013;
app.use(bodyParser.json());
app.use('/getOverview', getOverview);

app.get('/', (req, res) => {
    res.send('Hello World!3');
});


app.listen(port, () => {
    console.log('app listening on port 5013!');
});

module.exports = app; 