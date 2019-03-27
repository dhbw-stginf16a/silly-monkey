const chai = require('chai');
const chaiHttp = require('chai-http');
const axios = require('axios');

const app = require('../app');

const should = chai.should();
chai.use(chaiHttp);

describe('Pollen Adapter', () => {
    describe('/GET pollen info', () => {
        it('should GET the pollen info', async () => {
            const pollenPrefPromise = axios('http://trigger-router:5000/database/pollen');
            const regionPrefPromise = axios('http://trigger-router:5000/database/region');
            const pollenPref = (await pollenPrefPromise).data.value.pollen;
            const regionPref = (await regionPrefPromise).data.value.region;

            chai.request(app)
                .get(`/getPollen?pollen=${pollenPref.join(', ')}&place=${regionPref}`)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    }

                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    for (let i = 0; i < pollenPref.length; i++) {
                        res.body.should.have.property(pollenPref[i]);
                    }

                    Object.keys(res.body).forEach((key) => {
                        res.body[key].should.have.property('today');
                        res.body[key].should.have.property('tomorrow');
                        res.body[key].should.have.property('dayafter_to');
                    });
                });
        });
    });
});