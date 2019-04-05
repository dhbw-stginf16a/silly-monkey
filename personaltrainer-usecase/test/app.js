const chai = require('chai');
const chaiHttp = require('chai-http');
const axios = require('axios');

const app = require('../app');

const should = chai.should();
chai.use(chaiHttp);

describe('Personal Trainer Use Case', () => {
    describe('/GET PT recommendation', () => {

        it('should have status code 200', (done) => {
            chai.request(app)
                .get(`/app`)
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
                .get(`/app`)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    }

                    res.body.should.be.an('object');

                    done();
                });
        });

        it('should return an object with key \'answer\'', (done) => {
            chai.request(app)
                .get(`/app`)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    }

                    res.body.should.have.property('answer');

                    done();
                });
        });

        it('should return an object with a string as the value for the one key', (done) => {
            chai.request(app)
                .get(`/app`)
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    }

                    res.body.answer.should.be.a('string');

                    done();
                });
        });
    });
});
