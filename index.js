const express = require('express')
const app = express()
const auth = require('./auth')
const bodyParser = require('body-parser')
const logger = require('morgan')

app.use(bodyParser.json())

if(process.env.NODE_ENV != 'test'){
    app.use(logger('dev'))
}

app.get('/ping', (req, res) => {
    res.json({
        message: 'pong'
    })
})
app.use('/users', require('./routes/user-routes'))
app.use('/posts', require('./routes/post-routes'))

app.listen(process.env.PORT || 8080)

// For testing
module.exports = app;
