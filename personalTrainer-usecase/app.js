const axios = require("axios")
const express = require('express')
const app = express()
const router = express.Router();

const port = 5011

const dbConnectionViaTriggerRouter = "";
const calenderAdapter = "";
const feinstaubAdapter = "http://localhost:5001/isAlarm";
const weatherAdapter = "http://localhost:5004/getWeather";


app.get('/personalTrainer', async (req, res) => {
  try {
    // const dbResponse = await axios(dbConnectionViaTriggerRouter);
    // const calenderResponse = await axios(calenderAdapter);
    const feinstaubResponse = await axios(feinstaubAdapter);
     const weatherResponse = await axios(weatherAdapter);
    // dayTime aus DB
    
    //var userName = dbResponse.data.indexOf("userName");

    let isFeinstaubAlarm = feinstaubResponse.data.isAlarm;
    let temperature = weatherResponse.data.temp;

    let result = {
        isfeinstaub: isFeinstaubAlarm,
        temp: temperature
    };
    res.send(result);

  } catch (error) {
    console.log(error)
    res.send({
      "error": error
    })
  }
})

app.listen(port, () => console.log(`Personal Trainer Use Case listening on port ${port}!`))
