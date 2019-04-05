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
  var calendarString; 
  var weatherString;
  var allergyString;
  var feinstaubString = "";

  console.log(req.query.date);

  function calenderCheck(startFrom, calendar, freeTime, endTime) {
    // sort calendar by start time
    calendar.sort(function (a, b){ return a.start - b.start});
    let a = -1;
    var i = 0;

    // search for calendar entry that ends after startTime
    for (var i = 0; i < calendar.length; i++) {
      // console.log("Number of appointments today:" + [i+1]);
      if (calendar[i].end > startFrom.valueOf()) {
        a = i; 
        // console.log('Found Entry, set a and check for free timeslot... ')
        break;
      } 
    } 

    // if no entry was found -> free day 
    if (a < 0) {
      // console.log('entered 0');
      calendarString = "Today you have no appointments. Let me check the weather... ";
      return startFrom.valueOf();
    } 

    // search timeslot from found calendar entry 
    for (var i = a; i < calendar.length; i++) {
      if (calendar[i].start - calendar[a].end >= freeTime) {
          // found entry
          // console.log('entered 1');
          calendarString = "After your appointment " + calendar[a].subject + " there is a timeslot of about an hour before the next meeting starts. Let me check the weather... "
          return calendar[a].end;
      } 
      // if entry overlapping, take the end from the longer entry 
      if (calendar[i].end > calendar[a].end) {
        // console.log('entered 2');
        a = i;
        calendarString = "There is a timeslot of about an hour after your appointment " + calendar[a].subject +  " Let me check the weather... "
      } 
    }
    
    // last calendar element
      if (endTime - calendar[a].end >= freeTime){
        // console.log('entered 3');
        calendarString = "After your last appointment " + calendar[a].subject + " you will have enough time to workout. Let me check the weather... ";
        return calendar[a].end;
    } 
  } 

  function weatherCheck(desc, temp) {
    let lookupValue = "rain";
    if(desc.toLowerCase().indexOf(lookupValue) === -1) {
      weatherString = "It does not rain and the temperature at the moment is " + (temp - 273.15).toFixed(2) + "°C." + " ";
      return weatherString;
    } else {
      weatherString = "Oh, it rains and the temperature at the moment is " + (temp - 273.15).toFixed(2) + "°C." + " ";
      return weatherString;
    }
  }

  function allergyCheck(isFeinstaubAlarm) {
    var i = 0;
    var a = -1;
    var allergy;
    for (var i=0; i < pollenActivity.data.value.pollen.length; i++) {
      // get density of each pollen which are stored in database
      allergy = pollenActivityOfThatRegion.data[pollenActivity.data.value.pollen[i]]
      if (allergy.today >= 2) {
        a = i;
        allergyString = "You should consider to stay inside due to the high density of " + pollenActivity.data.value.pollen[a];
        break;
      } else {
        allergyString = "You need not to be afraid of sensitive pollen in the air. "
      }

      if (isFeinstaubAlarm) {
        feinstaubString = "But be aware that there is a high density of particulates outside. "
        break;
      }
    } 
  } 

  if(req.query.type === undefined || req.query.type == "today") {
  var region;
  var pollenActivity;
  var locationResponse;
  var regionResponse;
  let timeNow = new Date(new Date().getTime());
  try {
    //get region of pollen
    region = await axios(dbConnectionViaTriggerRouter + "/region");
    //get Pollen of that region
    pollenActivity = await axios(dbConnectionViaTriggerRouter + "/pollen");
    // for Wetter Adapter - "Stuttgart"
    locationResponse = await axios(dbConnectionViaTriggerRouter + "/location");
    // for Feinstaub Adapter - "Oberrhein und unteres Neckartal"
    regionResponse = await axios(dbConnectionViaTriggerRouter + "/partRegion");
    calendarResponse = await axios(calenderAdapter);
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

  // Pollen API request according database entries of region and allergies 
  const pollenActivityString = (await pollenActivity).data.value.pollen.join(', ');
  const regionOfPollen = (await region).data.value.region;
  var pollenActivityOfThatRegion;
  try {
    pollenActivityOfThatRegion = await axios (pollenAdapter, {params: {
      "pollen": pollenActivityString,
      "place":regionOfPollen
    }});
  } catch (error) {
    console.log(error.message)
    res.send({
      "error": error.message
    })
  } 

  var weatherDescription;
  var weatherTemp; 
  var todayNow = new Date(new Date().getTime())
  try {
    weatherHomeNowResponse = await axios.post(weatherAdapter, {
      "time": todayNow,
      "location":locationResponse.data.value.location,
      "country":"de"
    });
    weatherDescription = weatherHomeNowResponse.data.weather[0].description;
    weatherTemp =  weatherHomeNowResponse.data.main.temp;
  } catch (error) {
    console.log(error.message)
    res.send({
      "error": error.message
    })
  }     

  var feinstaubResponse;
  try {
    feinstaubResponse = await axios(feinstaubAdapter, {params: {"location": regionResponse.data.value.partRegion}});
  } catch (error) {
    console.log(error.message)
    res.status(500).send({
      "error": error.message
    })
  }

  /////// Check calendar for timeslots ///////
  let endTime = new Date(new Date().setHours(23,59,59));
  let freeTime = 3600000;
  //let calendarString;
  let checkCalendar = calendarResponse.data.events;

  calenderCheck(timeNow, checkCalendar, freeTime, endTime);

  /////// Check weather for rain ///////
  weatherCheck(weatherDescription, weatherTemp);
  

  /////// Air check (Pollen and Feinstaub)///////
  allergyCheck(feinstaubResponse.data.isAlarm);

  answerObj = "Alright I will check the conditions of today for you. " + calendarString + weatherString + allergyString + feinstaubString;
  
  /* let controlObject = {
    'pollen' : pollenActivityOfThatRegion.data ,
    'feinstaub' : isFeinstaubAlarm,
    'calender' : checkCalendar , 
    'location' : locationResponse.data.value.location, 
    'Temperature' : weatherTemp,
    'Weather Description' : weatherDescription,
    'time' : todayNow,
    'allergies' : allergies
  };  */
  //console.log(controlObject);

  res.send({"answer": answerObj});

  } else if(req.query.type == "tomorrow"){

    console.log("He asked for tomorrow.");
    var answerObj = "";
    res.send({"answer": answerObj});

  } else if(req.query.type == "next week"){
    console.log("He asked for next week");
    var answerObj = "";
    res.send({"answer": answerObj});

  } else {
    res.send({"answer": "Sorry I don't understand."});
  }
  
})

app.listen(port, () => console.log(`Personal Trainer Use Case listening on port ${port}!`))
