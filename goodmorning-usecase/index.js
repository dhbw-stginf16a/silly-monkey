const axios = require("axios")
const express = require('express')
const app = express()
const router = express.Router();

const port = 5010;

const weatherAdapter = "http://wetter-adapter:5004/getWeather";
const dbConnectionViaTriggerRouter = "http://trigger-router:5000/database";
const calenderAdapter = "http://calendar-adapter:5002/calendar";
const calenderMeetings = "http://calendar-adapter:5002/calendar/getMockCalendar";


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
    var homeLocation;
    try {
      locationResponse = await axios(dbConnectionViaTriggerRouter + "/location");
      homeLocation = locationResponse.data.value.location;
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
      console.log(weatherHomeNow);
    } catch (error) {
      console.log(error.message)
      res.send({
        "error": error.message
      })
    }    

    greeting += "the weather at your home location " + homeLocation + " is currently ";
    greeting += weatherHomeNow.weather[0].description + ". ";

    //Add today meetings to greeting
    greeting += "You have the following meetings scheduled for today: ";
    for (let meeting of scheduledMeetings.events) {
      var meetingOverview = meeting.subject;
      meetingOverview += " at location ";
      meetingOverview += meeting.location;
      meetingOverview += ". ";
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