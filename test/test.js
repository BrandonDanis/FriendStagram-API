process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
let should = chai.should();

chai.use(chaiHttp);

describe("Heartbeat", () => {

    it("Checking if server is alive", (done) => {
        chai.request(server)
            .get('/ping')
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })

})
