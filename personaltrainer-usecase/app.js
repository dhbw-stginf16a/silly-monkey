const axios = require("axios")
const express = require('express')
const app = express()
const router = express.Router();

const port = 5011

const dbConnectionViaTriggerRouter = "http://trigger-router:5000/database";
const feinstaubAdapter = "http://feinstaub-adapter:5001/isAlarm";
const calenderAdapter = "http://calendar-adapter:5002/calendar/getMockCalendar";
const pollenAdapter = "http://pollen-adapter:5003/getPollen";
const weatherAdapter = "http://wetter-adapter:5004/getWeather";

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

  var calendarResponse;
  try {
    calendarResponse = await axios(calenderAdapter);
  } catch (error) {
    console.log(error.message)
    res.send({
      "error": error.message
    })
  } 

/* var weatherResponse;
  try {
    weatherResponse = await axios(weatherAdapter, {params:{
      "time":1552700000,
      "location":"stuttgart",
      "country":"de"
    }});
  } catch (error) {
    console.log(error.message)
    res.send({
      "error": error.message
    })
  }  */

  var feinstaubResponse;
  try {
    feinstaubResponse = await axios(feinstaubAdapter + "?location=" + location);
  } catch (error) {
    console.log(error.message)
    res.send({
      "error": error.message
    })
  }

  var pollenErleResponse;
  try {
    pollenErleResponse = await axios(pollenAdapter, {params:{
      "pollen": "Erle",
      "place": "Hohenlohe/mittlerer Neckar/Oberschwaben"
    }});
  } catch (error) {
    console.log(error.message)
    res.send({
      "error": error.message
    })
  }

  var pollenGraeserResponse;
  try {
    pollenGraeserResponse = await axios(pollenAdapter, {params:{
      "pollen": "Graeser",
      "place": "Hohenlohe/mittlerer Neckar/Oberschwaben"
    }});
  } catch (error) {
    console.log(error.message)
    res.send({
      "error": error.message
    })
  }


let answer = "I'm not quite sure";
let isErlenPollen = pollenErleResponse.data.Erle.today ;
let isGraeserPollen = pollenGraeserResponse.data.Graeser.today ;
let isFeinstaubAlarm = feinstaubResponse.data.isAlarm;
let calendar = calendarResponse.data.events;
let startFrom = new Date(new Date().getTime());
let endTime = new Date(new Date().setHours(23,59,59));
let freeTime = 3600000;
let a; 

let controlObject = {
  'erle' : isErlenPollen,
  'graeser' : isGraeserPollen,
  'feinstaub' : isFeinstaubAlarm,
  'calender' : checkCalendar
  //'weather': checkWeather
};

// freeTime in mili secs
function calenderCheck(startFrom, calendar, freeTime, endTime) {
  // sort calendar by start time
  calendar.sort(function (a, b){ return a.start - b.start});
  let a = -1;

  // search for calendar entry that ends after startTime
  for (var i = 0; i < calendar.lenght; i++) {
    if (calendar.end > startFrom) {
      a = i; 
      console.log('Found Entry, set a and check for free timeslot...')
      break;
    } 
  }

  // if no entry was found -> free day 
  if (a < 0) {
    console.log('No appointments after this startTime.')
    return startFrom;
  } 

  // search timeslot from found calendar entry 
  for (var i = a; i < calendar.lenght; i++) {
    if (calendar[i].start - calendar[a].end >= freeTime) {
      // found entry
      console.log('...There is a timeslot after this appointment.')
      return calendar[a].end;
    } 
    // if entry overlapping, take the end from the longer entry 
    if (calendar[i].end > calendar[a].end) {
      a = i;
      console.log('...There is a timeslot after your longer appointment.')
    } 
  }
  
  // last calendar element
  if (endTime - calendar[a].end >= freeTime){
    console.log('...you had your last meeting today. There is still time available for a workout.')
    return calendar[a].end;
  }
} 


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


  
  res.send({'answer': answer});

})

app.listen(port, () => console.log(`Personal Trainer Use Case listening on port ${port}!`))
