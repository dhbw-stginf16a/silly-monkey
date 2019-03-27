const chai = require('chai');
const chaiHttp = require('chai-http');
const axios = require('axios');

const app = require('../app');

const should = chai.should();
chai.use(chaiHttp);

describe('Traffic Adapter', () => {
    describe('/GET correct and usable traffic info', () => {
        let roadsPref = [];
        before(async () => {
            const roadsPrefPromise = axios('http://localhost:5000/database/favRoads');
            roadsPref = (await roadsPrefPromise).data.value.favRoads;
        });

        it('should have status code 200', (done) => {
            chai.request(app)
                .get(`/getTrafficInfo?streets=${roadsPref.join(', ')}`)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    }

                    res.should.have.status(200);
                    
                    done();
                });
        });

        it('should return an array', (done) => {
            chai.request(app)
                .get(`/getTrafficInfo?streets=${roadsPref.join(', ')}`)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    }

                    res.body.should.be.an('array');

                    done();
                });
        });

        it('should return an array of objects containing all necessary keys', (done) => {
            chai.request(app)
                .get(`/getTrafficInfo?streets=${roadsPref.join(', ')}`)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    }

                    for (let i = 0; i < res.body.length; i++) {
                        res.body[i].should.have.all.keys('street', 'direction', 'message');
                        roadsPref.should.include(res.body[i].street);
                    }

                    done();
                });
        });
    });
});