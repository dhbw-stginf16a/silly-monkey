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
      res.status(500).send({
        "error": "Location Eintrag nicht in der Datenbank"
      })
    } else 
    res.status(500).send({
      "error": error.message
    })
  }

  var feinstaubResponse;
  try {
    feinstaubResponse = await axios(feinstaubAdapter + "?location=" + location);
  } catch (error) {
    console.log(error.message)
    res.status(500).send({
      "error": error.message
    })
  }

  var pollenErleResponse;
  try {
    pollenErleResponse = await axios(pollenAdapter, {params: {
      "pollen": "Erle",
      "place": "Hohenlohe/mittlerer Neckar/Oberschwaben"
    }});
  } catch (error) {
    console.log(error.message)
    res.status(500).send({
      "error": error.message
    })
  }

  var pollenGraeserResponse;
  try {
    pollenGraeserResponse = await axios(pollenAdapter, {params: {
      "pollen": "Graeser",
      "place": "Hohenlohe/mittlerer Neckar/Oberschwaben"
    }});
  } catch (error) {
    console.log(error.message)
    res.status(500).send({
      "error": error.message
    })
  }

let isErlenPollen = pollenErleResponse.data.Erle.today ;
let isGraeserPollen = pollenGraeserResponse.data.Graeser.today ;
let isFeinstaubAlarm = feinstaubResponse.data.isAlarm;

console.log(pollenGraeserResponse);
let answer = "I'm not quite sure";

if (isErlenPollen >= 2 && isGraeserPollen >= 2){
    answer = "Today is not a good day to go outside due to the extreme high density of Pollen.";
} else if (isErlenPollen < 2 && isGraeserPollen >= 2) {
    answer = "Today is not a good day to go outside due to the extrem high density of Graeser.";
} else if (isErlenPollen >= 2 && isGraeserPollen < 2) {
  answer = "Today is not a good day to go outside due to the extrem high density of Erle.";
} else {
  if(isFeinstaubAlarm) {
    answer = "The density of pollen is low today, but there is a high density of particulates. You better decide yourself.";
  } else {
    answer = "Today there are perfect conditions to go out for a run.";
  }
} 

console.log(answer);
res.send({ "answer": answer});

})

app.listen(port, () => console.log(`Personal Trainer Use Case listening on port ${port}!`))
