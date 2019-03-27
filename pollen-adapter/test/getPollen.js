const chai = require('chai');
const chaiHttp = require('chai-http');
const axios = require('axios');

const app = require('../app');

const should = chai.should();
chai.use(chaiHttp);

describe('Pollen Adapter', () => {
    describe('/GET pollen info', () => {
        let pollenPref = [];
        let regionPref = '';
        before(async () => {
            const pollenPrefPromise = axios('http://trigger-router:5000/database/pollen');
            const regionPrefPromise = axios('http://trigger-router:5000/database/region');
            pollenPref = (await pollenPrefPromise).data.value.pollen;
            regionPref = (await regionPrefPromise).data.value.region;
        });

        it('should have status code 200', (done) => {
            chai.request(app)
                .get(`/getPollen?pollen=${pollenPref.join(', ')}&place=${regionPref}`)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    }

                    res.should.have.status(200);

                    done();
                });
        });

        it('should return an object', (done) => {
            chai.request(app)
                .get(`/getPollen?pollen=${pollenPref.join(', ')}&place=${regionPref}`)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    }

                    res.body.should.be.an('object');

                    done();
                });
        });

        it('should return an object with keys corresponding to the user preferences', (done) => {
            chai.request(app)
                .get(`/getPollen?pollen=${pollenPref.join(', ')}&place=${regionPref}`)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    }

                    for (let i = 0; i < pollenPref.length; i++) {
                        res.body.should.have.property(pollenPref[i]);
                    }

                    done();
                });
        });

        it('should return an object with the necessary keys on the second level', (done) => {
            chai.request(app)
                .get(`/getPollen?pollen=${pollenPref.join(', ')}&place=${regionPref}`)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    }

                    Object.keys(res.body).forEach((key) => {
                        res.body[key].should.have.all.keys('today', 'tomorrow', 'dayafter_to');
                    });

                    done();
                });
        });
    });
});
