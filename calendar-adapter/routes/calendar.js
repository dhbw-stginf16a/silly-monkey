var express = require('express');
var router = express.Router();
var authHelper = require('../helper/auth');
var graph = require('@microsoft/microsoft-graph-client');

/* GET /calendar */
router.get('/getMockCalendar', async function(req, res, next) {
  let parms = { title: 'Calendar', active: { calendar: true } };

  parms.user = "John Smith";


    // Set start of the calendar view to today at midnight
    const start1 = new Date(new Date().setHours(9,0,0));
    const start2 = new Date(new Date().setHours(13,0,0));
    // Set end of the calendar view to 7 days from start
    const end1 = new Date(new Date().setHours(10,0,0));
    const end2 = new Date(new Date().setHours(13,30,0));

  parms.events = 
    [{
      subject: "Dentist",
      start: start1,
      end: end1,
      location: "Danny Dentist"
    },
    {subject: "Call Boss",
    start: start2,
    end: end2,
    location: "Office"
    }];

    res.render('error', parms);
});

/* GET /calendar */
router.get('/todaysAppointments', async function(req, res, next) {
  let parms = { title: 'Calendar', active: { calendar: true } };
  var accessToken = "";
  var userName = "";

  const sessionToken = await authHelper.getAccessToken(res);
  if(sessionToken) {
    accessToken = sessionToken.access_token;
    userName = sessionToken.user.name;
  }

  if (accessToken && userName) {
    parms.user = userName;

    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    // Set start of the calendar view to today at midnight
    const start = new Date(new Date().setHours(0,0,0));
    // Set end of the calendar view to 7 days from start
    const end = new Date(new Date(start).setDate(start.getDate() + 1));

    try {
      // Get the first 10 events for the coming week
      const result = await client
      .api(`/me/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
      .top(10)
      .select('subject,start,end,location')
      .orderby('start/dateTime DESC')
      .get();

      var calenderEvents = result.value;
      var events = [];

      for (let calenderEvent of calenderEvents) {
        var event = {};
        event.subject = calenderEvent.subject;
        event.start = calenderEvent.start.dateTime;
        event.end = calenderEvent.end.dateTime;
        event.location = calenderEvent.location.displayName;
        console.log(event);
        events.push(event);
      }

      console.log(events);

      parms.events = events;
      res.send(parms);
    } catch (err) {
      parms.message = 'Error retrieving events';
      parms.error = { status: `${err.code}: ${err.message}` };
      parms.debug = JSON.stringify(err.body, null, 2);
      res.render('error', parms);
    }

  } else {
    // Redirect to home
    res.redirect('/');
  }
});

module.exports = router;
