var expect = require('chai').expect;
var util = require('../helper/util');
const axios = require("axios");

describe('Goodmorning Use Case - Adapter Output Logic', function () {
    it('meetingOverviewString', function () {

        // 1. ARRANGE
        let meetings = {};
        meetings.events = [{
                subject: "Call Boss",
                start: new Date(new Date().setHours(13, 0, 0)).valueOf(),
                end: new Date(new Date().setHours(13, 30, 0)).valueOf(),
                location: "Office"
            },
            {
                subject: "Coffee with Melanie",
                start: new Date(new Date().setHours(15, 0, 0)).valueOf(),
                end: new Date(new Date().setHours(18, 0, 0)).valueOf(),
                location: "Central Perk Coffee Shop"
            }
        ];

        var expectedOverview = "You have the following meetings scheduled for today: ";
        expectedOverview += "Call Boss at 13:00 at location Office. ";
        expectedOverview += "This meeting ends at 13:30. ";
        expectedOverview += "Coffee with Melanie at 15:00 at location Central Perk Coffee Shop. ";
        expectedOverview += "This meeting ends at 18:00. ";

        // 2. ACT
        var functionResponse = util.meetingOverviewString(meetings);

        // 3. ASSERT
        expect(functionResponse).to.equal(expectedOverview);
    });

    it('trainOverviewString', function () {

        // 1. ARRANGE
        var newDateObj = new Date();
        newDateObj.setMinutes(newDateObj.getMinutes() + 5);

        let vvsDepartures = [{

                "direction": "Tannenberg",
                "delay": 0,
                "number": "S1",
                "departureTime": {
                    "minute": "50",
                    "hour": "22"
                }
            },
            {
                "direction": "Tannenberg",
                "delay": 4,
                "number": "S1",
                "departureTime": {
                    "minute": newDateObj.getMinutes(),
                    "hour": newDateObj.getHours + 1
                }

            }
        ];

        var expectedOverview = "The following train is delayed by 4 minutes ";
        expectedOverview += "S1 in direction Tannenberg. ";

        // 2. ACT
        var functionResponse = util.trainOverviewString(vvsDepartures);

        // 3. ASSERT
        expect(functionResponse).to.equal(expectedOverview);
    });

    it('trafficOverviewString', function () {

        // 1. ARRANGE
        let traffic = [{
                "street": "A81",
                "direction": "Heilbronn - Stuttgart"
            },
            {
                "street": "A81",
                "direction": "Heilbronn - Stuttgart"
            }, {
                "street": "A81",
                "direction": "Heilbronn - Würzburg",
            }
        ];

        var expectedOverview = "There is a problem on the A81 in direction Heilbronn - Stuttgart. ";
        expectedOverview += "There is a problem on the A81 in direction Heilbronn - Würzburg. ";

        // 2. ACT
        var functionResponse = util.trafficOverviewString(traffic);

        // 3. ASSERT
        expect(functionResponse).to.equal(expectedOverview);
    });
});