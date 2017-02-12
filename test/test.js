const assert = require('assert')
const request = require('request')
const URL = `http://127.0.0.1:${process.env.PORT || 8080}`

describe('Array', function() {
    describe('#ping', () => {
        it('should return pong always', (done) => {
            request(`${URL}/ping`, (err, res, body) => {
                assert.equal('pong', JSON.parse(body).message)
                done()
            })
        })
    })
});