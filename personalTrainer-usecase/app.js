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
    // let time = dayTimeDescription();

   /*  let date = new Date();
    let hour = date.getHours();
    function dayTimeDescription() {
        if(hour < 12) {
            time = "morning";
        } else time = "evening";
    }  */

    let isFeinstaubAlarm = feinstaubResponse.data.isAlarm;
    let temperature = weatherResponse.data.main.temp;
    let weather = weatherResponse.data.weather[0].main;

    let result = {
        isfeinstaub: isFeinstaubAlarm,
        temp: temperature,
        weatherDescription: weather
        //dayTime: time
    };
    
    console.log(result);
    res.send(result);

  } catch (error) {
    console.log(error)
    res.send({
      "error": error
    })
  }
})

app.listen(port, () => console.log(`Personal Trainer Use Case listening on port ${port}!`))
