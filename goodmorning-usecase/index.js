const axios = require("axios")
const express = require('express');
var util = require('./helper/util');
const app = express()
const router = express.Router();

const port = 5010;

const weatherAdapter = "http://wetter-adapter:5004/getWeather";
const dbConnectionViaTriggerRouter = "http://trigger-router:5000/database";
const calenderAdapter = "http://calendar-adapter:5002/calendar";
const calenderMeetings = "http://calendar-adapter:5002/calendar/getMockCalendar";
const vvsAdapter = "http://vvs-adapter:5006/getVvsDepartures";
const trafficAdapter = "http://verkehr-adapter:5005/getTrafficInfo";

app.get('/userGreeting', async (req, res) => {
  try {
    //Get location from db
    var locationResponse = await util.getAdapterResponse(dbConnectionViaTriggerRouter + "/location");
    var trainResponse = await util.getAdapterResponse(dbConnectionViaTriggerRouter + "/homeStation");
    var raodResponse = await util.getAdapterResponse(dbConnectionViaTriggerRouter + "/favRoads");
    var trainHomeStation = trainResponse.data.value.homeStation;
    var homeLocation = locationResponse.data.value.location;
    var favRoads = raodResponse.data.value.favRoads;

    //Get calendar meetings
    var calenderMeetingsResponse = await util.getAdapterResponse(calenderMeetings);
    var scheduledMeetings = calenderMeetingsResponse.data;

    // Build greeting
    var greeting = "Hello " + scheduledMeetings.user + ". I hope you are having a good day. ";

    //Get weather for prefered home location
    //connect to weather adapter for weather
    var weatherHomeNowResponse;
    var weatherHomeNow;
    var todayNow = new Date().toLocaleTimeString().toString();
    todayNow = todayNow.replace(":/g", "");
    todayNow = todayNow + "0000";
    try {
      weatherHomeNowResponse = await axios.post(weatherAdapter, {
        "time": todayNow,
        "location": homeLocation,
        "country": "de"
      });
      weatherHomeNow = weatherHomeNowResponse.data;
    } catch (error) {
      onsole.log("Problem with weather conneciton.");
      console.log(error.message)
      res.send({
        "error": error.message
      })
    }

    greeting += "the weather at your home location " + homeLocation + " is currently ";
    greeting += weatherHomeNow.weather[0].description + ". ";

    //Add deplays on train route
    greeting += "As for the current train situation from your preferred station " + trainHomeStation + ". ";
    var vvsResponse = await util.getAdapterResponse(vvsAdapter + "?stationname=" + trainHomeStation);
    var vvsDepartures = vvsResponse.data;
    var trainOverview = util.trainOverviewString(vvsDepartures);
    greeting += trainOverview;

    //Add deplays on fav roads
    favRoads = favRoads.replace("[", "");
    favRoads = favRoads.replace("]", "");
    greeting += "As for the current traffic situation ov your preferred roads " + favRoads + ". ";
    var trafficResponse = await util.getAdapterResponse(trafficAdapter + "?streets=" + favRoads);
    var trafficData = trafficResponse.data;
    var trafficOverview = util.trafficOverviewString(trafficData);
    greeting += trafficOverview;

    //Add today meetings to greeting
    greeting += util.meetingOverviewString(scheduledMeetings);

    // Return greeting
    res.send({
      "answer": greeting
    })
  } catch (error) {
    console.log(error)
    res.send({
      "error": error
    })
  }
})



module.exports = app;

// Check if user is logged in
// 
/*const calenderInitResponse = await axios(calenderAdapter);

var calenderInitObj = calenderInitResponse.data;
var scheduledMeetings;

userName = "";

if(calenderInitObj.signInUrl) {
  throw "Current user is not signed in!"
} else {
  userName = calenderInitObj.user;

  const calenderMeetingsResponse = await axios(calenderMeetings);

  scheduledMeetings = calenderMeetingsResponse.data;
}*/