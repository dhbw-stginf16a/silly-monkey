const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const axios = require("axios");

var getVvsInfo = require('../routes/getVvsInfo');
const app = require('../index');

chai.use(chaiHttp);
describe('VVS Adapter Functionality Testing', function () {
    it('vvs events return 200 (test case: station Böblingen', (done) => {
        chai.request(app)
            .get('/getVvsDepartures?stationname=Böblingen')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                }
                
                res.should.have.status(200);
                
                done();
            });

    });

    it('vvs events return error (test case: station Böbl', (done) => {
        chai.request(app)
            .get('/getVvsDepartures?stationname=Böbl')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                }
                var expectedError = "Error. Stationname not available.";

                res.should.have.status(200);
                res.text.should.be.eql(expectedError);
                
                done();
            });
    });

    it('vvs events return correct array', (done) => {
        chai.request(app)
            .get('/getVvsDepartures?stationname=Böblingen')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                }
                
                res.body.should.be.a('array');
                //res.body.should.have.all.keys('title', 'active', 'user', 'events');
                
                done();
            });
    });

    /*it('vvs all stations helper returns correct array', async function () {

        // 1. ARRANGE
        // 2. ACT
        var functionResponse = await getVvsInfo.getStationIdByName("Böblingen");

        // 3. ASSERT
        functionResponse.should.be.a('array');
    });*/
});