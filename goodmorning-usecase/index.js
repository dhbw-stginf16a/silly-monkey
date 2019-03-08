const axios = require("axios")
const express = require('express')
const app = express()
const router = express.Router();

const port = 5010;

const dbConnectionViaTriggerRouter = "";
const calenderAdapter = "http://localhost:5002/";
const calenderMeetings = "http://localhost:5002/calendar/todaysAppointments";


app.get('/userGreeting', async (req, res) => {
  try {
    //const dbResponse = await axios(dbConnectionViaTriggerRouter);
    const calenderInitResponse = await axios(calenderAdapter);

    var calenderInitObj = calenderInitResponse.data;
    var scheduledMeetings;

    userName = "";

    if(calenderInitObj.signInUrl) {
      throw "Current user is not signed in!"
    } else {
      userName = calenderInitObj.user;

      const calenderMeetingsResponse = await axios(calenderMeetings);

      scheduledMeetings = calenderMeetingsResponse.data;
    }

    var greeting = "Hello " + userName + ". I hope you are having a good day. ";
    greeting += "You have the following meetings scheduled for today : ";

    for (let meeting of scheduledMeetings.events) {
      var meetingOverview = meeting.subject;
      meetingOverview += " at location ";
      meetingOverview += meeting.location;
      meetingOverview += " . ";
      greeting += meetingOverview;
    }


    res.send({
      "greeting": greeting
    })
  } catch (error) {
    console.log(error)
    res.send({
      "error": error
    })
  }
})

//app.listen(port, () => console.log(`GoodMorning Use Case listening on port ${port}!`))

module.exports = app;