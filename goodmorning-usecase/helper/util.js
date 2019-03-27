const axios = require("axios")

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


exports.getAdapterResponse = getAdapterResponse;

exports.meetingOverviewString = meetingOverviewString;

exports.trainOverviewString = trainOverviewString;

exports.trafficOverviewString = trafficOverviewString;