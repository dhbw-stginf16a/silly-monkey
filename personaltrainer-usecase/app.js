const axios = require("axios")
const express = require('express')
const app = express()
const router = express.Router();

const port = 5011

const dbConnectionViaTriggerRouter = "http://trigger-router:5000/database";
const calenderAdapter = "http://calendar-adatper:5002/";
const feinstaubAdapter = "http://feinstaub-adapter:5001/isAlarm";
const weatherAdapter = "http://weather-adapter:5004/getWeather";
const pollenAdapter = "http://pollen-adapter:5003/getPollen";

app.get('/whatTraining', async (req, res) => {
  var location;
  try {
    location = await axios(dbConnectionViaTriggerRouter + "/location");
  } catch (error) {
    console.log(error.message)
    if(error.response.status == 404) {
      res.send({
        "error": "Location Eintrag nicht in der Datenbank"
      })
    } else 
    res.send({
      "error": error.message
    })
  }

  var feinstaubResponse;
  try {
    feinstaubResponse = await axios(feinstaubAdapter + "?location=" + location);
  } catch (error) {
    console.log(error.message)
    res.send({
      "error": error.message
    })
  }

  var pollenResponse;
  try {
    pollenResponse = await axios(pollenAdapter, {params:{
      "pollen": "Erle",
      "place": "Hohenlohe/mittlerer Neckar/Oberschwaben"
    }});
  } catch (error) {
    console.log(error.message)
    res.send({
      "error": error.message
    })
  }

let isErlenPollen = pollenResponse.data.Erle.today ;

let isFeinstaubAlarm = feinstaubResponse.data.isAlarm;

let answer = "I'm not quite sure";

console.log(isErlenPollen);
if (isErlenPollen >= 1 && isFeinstaubAlarm) {
    answer = "Due to the high density of pollen and particulates you better stay inside";
} else if (isErlenPollen < 1 && isFeinstaubAlarm){
    answer = "Due to the low density of pollen, but the high density of particulates you better decide yourself.";
} else if (isErlenPollen >= 1 && !isFeinstaubAlarm){
  answer = "There is no particulates alarm today, but a high density of pollen. Better stay inside.";
} else {
  answer = "There are good conditions for a quick run today!"
}

// console.log(answer);
res.send({ "answer": answer});

})

app.listen(port, () => console.log(`Personal Trainer Use Case listening on port ${port}!`))
