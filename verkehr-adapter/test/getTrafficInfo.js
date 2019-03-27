const chai = require('chai');
const chaiHttp = require('chai-http');
const axios = require('axios');

const app = require('../app');

const should = chai.should();
chai.use(chaiHttp);

describe('Traffic Adapter', () => {
    describe('/GET traffic info', () => {
        it('should GET the traffic info', async () => {
            const roadsPrefPromise = axios('http://localhost:5000/database/favRoads');
            const roadsPref = (await roadsPrefPromise).data.value.favRoads;

            chai.request(app)
                .get(`/getTrafficInfo?streets=${roadsPref.join(', ')}`)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    }

                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    for (let i = 0; i < res.body.length; i++) {
                        res.body[i].should.have.all.keys('street', 'direction', 'message');
                        roadsPref.should.include(res.body[i].street);
                    }
                });
        });
    });
});