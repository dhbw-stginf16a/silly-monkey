const express = require('express');
const axios = require("axios");

let router = express.Router();

const weatherAdapter = "http://wetter-adapter:5004/getWeather";
const vvsAdapter = "http://vvs-adapter:5006/getVvsDepartures";
const trafficAdapter = "http://verkehr-adapter:5005/getTrafficInfo";
const feinstaubAdapter = "http://feinstaub-adapter:5001/isAlarm";
const dbConnectionViaTriggerRouter = "http://trigger-router:5000/database";
const calenderAdapter = "http://calendar-adapter:5002/calendar";
const calenderMeetings = "http://calendar-adapter:5002/calendar/getMockCalendar";
const pollenAdapter = "http://pollen-adapter:5003/getPollen";

router.get('/', async (req, response) => {

    var locationResponse;
    var trainResponse;
    var trainHomeStation;
    var homeLocation;
    var feinstaubResponse;
    var feinstaub;
    var weatherResponse;
    var weather;
    var vvsResponse;
    var vvsDepartures;
    var trainInfo = "";
    var feinstaubInfo = "";
    var calenderMeetingsResponse;
    var trafficResponse;
    var trafficData;
    var trafficInfo = "";
    var raodResponse;
    var favRoads;
    try {
        locationResponse = await axios(dbConnectionViaTriggerRouter + "/location");
        trainResponse = await axios(dbConnectionViaTriggerRouter + "/homeStation");
        raodResponse = await axios(dbConnectionViaTriggerRouter + "/favRoads");
        favRoads = raodResponse.data.value.favRoads;
        feinstaubResponse = await axios(feinstaubAdapter, {params: {"location": locationResponse.data.value.location}});
        trainHomeStation = trainResponse.data.value.homeStation;
        homeLocation = locationResponse.data.value.location;
        feinstaub = feinstaubResponse.data.isAlarm;
        vvsResponse = await axios(vvsAdapter + "?stationname=" + trainHomeStation);
        vvsDepartures = vvsResponse.data;
        trafficResponse = await axios(trafficAdapter + "?streets=" + favRoads);


        //vvs


        for (let dep of vvsDepartures) {
            if(dep.delay >= 4) {
                trainInfo += "The train " + dep.number + " in direction " + dep.direction +" is delayed by " + dep.delay + " minutes.";
            }
        }

        if(trainInfo === "") {
            trainInfo += "There are no delayed trains. What a surprise!";
        }

        //feinstaub
        if(feinstaub){
            feinstaubInfo = "Also, there is currently Feinstaubalarm at your location, so you should consider taking the Train to fight against pollution. "
        }else{
            feinstaubInfo = "Also, since there is no Feinstaubalarm at your location, feel free to take the car and pollute the hell out of this air. "
        }

        //weather
        var todayNow = new Date().toLocaleTimeString().toString();
        todayNow = todayNow.replace(":/g", "");
        todayNow = todayNow + "0000";

        weatherResponse = await axios.post(weatherAdapter, {
                "time":todayNow,
                "location":locationResponse.data.value.location,
                "country":"de"
            });

        weather = weatherResponse.data.weather[0].description + " at " + (weatherResponse.data.main.temp - 273.15).toFixed(2) + "°C" ;


        //verkehr
        trafficData = trafficResponse.data;
        console.log(trafficData);

        for (let traffic of trafficData) {
            trafficInfo += traffic.message + ". ";
        }

        if(trafficInfo === "") {
            trafficInfo += "There are no delays on your usual roads. ";
        }
        console.log(trafficInfo);


        //calendar
        try {
            calenderMeetingsResponse = await axios(calenderMeetings);
        } catch (error) {
            console.log(error.message);
            res.send({
                "error": error.message
            });
        }
        var scheduledMeetings = calenderMeetingsResponse.data;


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
            meetingOverview += " at ";
            meetingOverview += meeting.location;
            meetingOverview += ". ";
            meetingOverview += "This meeting ends at " + endTime + ". ";

        }


    } catch (error) {
        console.log(error.message);
        res.send({
            "error": error.message
        });
    }


    response.send("the weather at your location " + homeLocation +
        " is currently " + weather +
        ". At your preferred station " + trainHomeStation +
        " " + trainInfo +
        " " + trafficInfo +
        feinstaubInfo +
        "last but not least, today you've got the following meetings. " + meetingOverview);



});


router.get('/justMeetings', async (req, response) => {

        //calendar
    try {
        calenderMeetingsResponse = await axios(calenderMeetings);
    } catch (error) {
        console.log(error.message);
        res.send({
            "error": error.message
        });
    }
    var scheduledMeetings = calenderMeetingsResponse.data;


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
        meetingOverview += " at ";
        meetingOverview += meeting.location;
        meetingOverview += ". ";
        meetingOverview += "This meeting ends at " + endTime + ". ";

    }


    response.send("today you've got the following meetings. " + meetingOverview);



});

router.get('/justTraffic', async (req, response) => {

    var trainResponse;
    var trainHomeStation;
    var homeLocation;
    var vvsResponse;
    var vvsDepartures;
    var trainInfo = "";
    var trafficResponse;
    var trafficData;
    var trafficInfo = "";
    var raodResponse;
    var favRoads;
    try {
        trainResponse = await axios(dbConnectionViaTriggerRouter + "/homeStation");
        raodResponse = await axios(dbConnectionViaTriggerRouter + "/favRoads");
        favRoads = raodResponse.data.value.favRoads;
        trainHomeStation = trainResponse.data.value.homeStation;
        vvsResponse = await axios(vvsAdapter + "?stationname=" + trainHomeStation);
        vvsDepartures = vvsResponse.data;
        trafficResponse = await axios(trafficAdapter + "?streets=" + favRoads);


        //vvs


        for (let dep of vvsDepartures) {
            if(dep.delay >= 4) {
                trainInfo += "The train " + dep.number + " in direction " + dep.direction +" is delayed by " + dep.delay + " minutes.";
            }
        }

        if(trainInfo === "") {
            trainInfo += "There are no delayed trains. What a surprise!";
        }

        //verkehr
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
        console.log(error.message);
        res.send({
            "error": error.message
        });
    }


    response.send("At your preferred station " + trainHomeStation +
        " " + trainInfo +
        " " + trafficInfo);



});





module.exports = router;