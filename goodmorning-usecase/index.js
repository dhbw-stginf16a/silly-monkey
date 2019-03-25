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
    //Get location from db
    var locationResponse = await getAdapterResponse(dbConnectionViaTriggerRouter + "/location");
    var trainResponse = await getAdapterResponse(dbConnectionViaTriggerRouter + "/homeStation");
    var raodResponse = await getAdapterResponse(dbConnectionViaTriggerRouter + "/favRoads");
    var trainHomeStation = trainResponse.data.value.homeStation;
    var homeLocation = locationResponse.data.value.location;
    var favRoads = raodResponse.data.value.favRoads;

    //Get calendar meetings
    var calenderMeetingsResponse = await getAdapterResponse(calenderMeetings);
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
    var vvsResponse = await getAdapterResponse(vvsAdapter + "?stationname=" + trainHomeStation);
    var vvsDepartures = vvsResponse.data;
    var trainOverview = trainOverviewString(vvsDepartures);
    greeting += trainOverview;

    //Add deplays on fav roads
    favRoads = favRoads.replace("[", "");
    favRoads = favRoads.replace("]", "");
    greeting += "As for the current traffic situation ov your preferred roads " + favRoads + ". ";
    var trafficResponse = await getAdapterResponse(trafficAdapter + "?streets=" + favRoads);
    var trafficData = trafficResponse.data;
    var trafficOverview = trafficOverviewString(trafficData);
    greeting += trafficOverview;

    //Add today meetings to greeting
    greeting += meetingOverviewString(scheduledMeetings);

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

//Generic async function to handle all get requests
async function getAdapterResponse(path) {
  let response;
  try {
    response = await axios(path);
  } catch (error) {
    console.log(error);
    response = {
      "error": error
    };
  }
  return response;
}

//Filters all meetings scheduled for today
//Returns overview string
function meetingOverviewString(scheduledMeetings) {
  var meetingOverview = "You have the following meetings scheduled for today: ";
  for (let meeting of scheduledMeetings.events) {
    var meetingStart = new Date(meeting.start);
    var meetingEnd = new Date(meeting.end);

    var startTime = meetingStart.getHours() + ":" + meetingStart.getMinutes();
    if (meetingStart.getMinutes() == 0) {
      startTime += "0";
    }
    var endTime = meetingEnd.getHours() + ":" + meetingEnd.getMinutes();
    if (meetingEnd.getMinutes() == 0) {
      endTime += "0";
    }

    var meetingSummary = meeting.subject;

    meetingSummary += " at " + startTime;
    meetingSummary += "";
    meetingSummary += " at location ";
    meetingSummary += meeting.location;
    meetingSummary += ". ";
    meetingSummary += "This meeting ends at " + endTime + ". ";
    meetingOverview += meetingSummary;
  }

  return meetingOverview;
}

//Filters all trains running in the next 20 min
//Returns overview string
function trainOverviewString(vvsDepartures) {
  var trainOverview = "";
  for (let dep of vvsDepartures) {

    if (dep.delay != "0") {
      //console.log(dep);
      trainOverview += "The following train is delayed by " + dep.delay + " minutes ";
      trainOverview += dep.number + " in direction " + dep.direction + ". ";
    }
  }

  if (trainOverview === "") {
    trainOverview += "There are no delays from your home train station in the next 20 minutes. ";
  }

  return trainOverview;
}

//Filters all current traffic and singles out unique feedback
//Returns overview string
function trafficOverviewString(trafficData) {
  var registeredTrafficJams = [];
  var trafficOverview = "";

  for (let traffic of trafficData) {
    if (registeredTrafficJams === undefined || registeredTrafficJams.length == 0) {
      registeredTrafficJams.push({
        street: traffic.street,
        direction: traffic.direction,
        counter: 1
      });
      trafficOverview += "There is a problem on the " + traffic.street + " in direction " + traffic.direction + ". ";
    }
    for (var i = 0; i < registeredTrafficJams.length; i++) {
      if (traffic.street == registeredTrafficJams[i].street && traffic.direction == registeredTrafficJams[i].direction) {
        registeredTrafficJams[i].counter++;
        break;
      } else if (i == registeredTrafficJams.length - 1) {
        registeredTrafficJams.push({
          street: traffic.street,
          direction: traffic.direction,
          counter: 1
        });
        trafficOverview += "There is a problem on the " + traffic.street + " in direction " + traffic.direction + ". ";
      }
    }
  }

  if (trafficOverview === "") {
    trafficOverview += "There are no delays on your usual roads. ";
  }

  return trafficOverview;
}

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