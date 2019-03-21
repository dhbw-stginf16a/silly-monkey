const axios = require("axios")
const express = require('express')
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
    //Get location from db
    var locationResponse;
    var trainResponse;
    var raodResponse;
    var trainHomeStation;
    var homeLocation;
    var favRoads;
    try {
      locationResponse = await axios(dbConnectionViaTriggerRouter + "/location");
      trainResponse = await axios(dbConnectionViaTriggerRouter + "/homeStation");
      raodResponse = await axios(dbConnectionViaTriggerRouter + "/favRoads");
      homeLocation = locationResponse.data.value.location;
      trainHomeStation = trainResponse.data.value.homeStation;
      favRoads = raodResponse.data.value.favRoads;
      //console.log(favRoads);
    } catch (error) {
      console.log(error.message);
      res.send({
        "error": error.message
      });
    }

    //Get calendar meetings
    var calenderMeetingsResponse;
    try {
      calenderMeetingsResponse = await axios(calenderMeetings);
    } catch (error) {
      console.log(error.message);
      res.send({
        "error": error.message
      });
    }    
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
        "location":homeLocation,
        "country":"de"
      });
      weatherHomeNow = weatherHomeNowResponse.data;
    } catch (error) {
      console.log(error.message)
      res.send({
        "error": error.message
      })
    }    

    greeting += "the weather at your home location " + homeLocation + " is currently ";
    greeting += weatherHomeNow.weather[0].description + ". ";

    //Add deplays on train route
    greeting += "As for the current train situation from your preferred station " + trainHomeStation + ". ";
    var vvsResponse;
    var vvsDepartures;
    var trainInfo = "";
    try {
      vvsResponse = await axios(vvsAdapter + "?stationname=" + trainHomeStation);
      vvsDepartures = vvsResponse.data;
      //console.log(vvsDepartures);

      for (let dep of vvsDepartures) {
        if(dep.delay != "0") {
          trainInfo += "The following train is delayed by " + dep.delay + " minutes ";
          trainInfo += dep.number + " in direction " + dep.direction + ". ";
        }
      }

      if(trainInfo === "") {
        trainInfo += "There are no delays from your home train station. ";
      }
      //console.log(trainInfo);
    } catch (error) {
      console.log(error.message)
      res.send({
        "error": error.message
      })
    }   

    greeting += trainInfo;

    //Add deplays on fav roads
    favRoads = favRoads.replace("[", "");
    favRoads = favRoads.replace("]", "");
    console.log(favRoads);
    greeting += "As for the current traffic situation ov your preferred roads " + favRoads + ". ";
    var trafficResponse;
    var trafficData;
    var trafficInfo = "";
    try {
      trafficResponse = await axios(trafficAdapter + "?streets=" + favRoads);
      trafficData = trafficResponse.data;
      console.log(trafficData);

      for (let traffic of trafficData) {
        trafficInfo += traffic.message + ". ";
      }

      if(trafficInfo === "") {
        trafficInfo += "There are no delays on your usual roads. ";
      }
      console.log(trafficInfo);
    } catch (error) {
      console.log(error.message)
      res.send({
        "error": error.message
      })
    }   

    greeting += trafficInfo;

    //Add today meetings to greeting
    greeting += "You have the following meetings scheduled for today: ";
    for (let meeting of scheduledMeetings.events) {
      var meetingStart = new Date(meeting.start);
      var meetingEnd = new Date(meeting.end);

      var startTime = meetingStart.getHours() + ":" + meetingStart.getMinutes();
      if(meetingStart.getMinutes() == 0) {
        startTime += "0";
      }
      var endTime = meetingEnd.getHours() + ":" + meetingEnd.getMinutes();
      if(meetingEnd.getMinutes() == 0) {
        endTime += "0";
      }

      var meetingOverview = meeting.subject;

      meetingOverview += " at " + startTime;
      meetingOverview += "";
      meetingOverview += " at location ";
      meetingOverview += meeting.location;
      meetingOverview += ". ";
      meetingOverview += "This meeting ends at " + endTime + ". ";
      greeting += meetingOverview;

    }

    // Return greeting
    res.send({ "answer": greeting })
  } catch (error) {
    console.log(error)
    res.send({
      "error": error
    })
  }
})

module.exports = app;