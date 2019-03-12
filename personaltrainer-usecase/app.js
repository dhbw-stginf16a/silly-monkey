const axios = require("axios")
const express = require('express')
const app = express()
const router = express.Router();

const port = 5011

const dbConnectionViaTriggerRouter = "http://trigger-router:5000/database";
const calenderAdapter = "http://calendar-adatper:5002/";
const feinstaubAdapter = "http://feinstaub-adapter:5001/isAlarm";
const weatherAdapter = "http://weather-adapter:5004/getWeather";

app.get('/whatTraining', async (req, res) => {
  try {
    // TODO: Check if returned nothing
    const location = await axios(dbConnectionViaTriggerRouter + "/location");
    console.log(location.data);
    // const calenderResponse = await axios(calenderAdapter);
    const feinstaubResponse = await axios(feinstaubAdapter + "?location=" + location);
    console.log(feinstaubResponse.data);
    //const weatherResponse = await axios(weatherAdapter);
    // let time = dayTimeDescription();

   /*  let date = new Date();
    let hour = date.getHours();
    function dayTimeDescription() {
        if(hour < 12) {
            time = "morning";
        } else time = "evening";
    }  */

    let isFeinstaubAlarm = feinstaubResponse.data.isAlarm;
    //let temperature = weatherResponse.data.main.temp;
    //let weather = weatherResponse.data.weather[0].main;

    //let result = {
    //    isfeinstaub: isFeinstaubAlarm,
    //    temp: temperature,
    //    weatherDescription: weather
    //    //dayTime: time
    //};
    
    let answer = "I'm not quite sure";
    if (isFeinstaubAlarm) {
        answer = "Better stay inside!";
    } else {
        answer = "Do something outside";
    }

    console.log(answer);
    res.send({ "answer": answer});

  } catch (error) {
    console.log(error)
    res.send({
      "error": error
    })
  }
})

app.listen(port, () => console.log(`Personal Trainer Use Case listening on port ${port}!`))
