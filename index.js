const express = require('express')
const app = express()
const auth = require('./auth')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const logger = require('morgan')
mongoose.connect('mongodb://localhost/test')

app.use(bodyParser.json())
app.use(logger('dev'))

app.get('/ping', (req, res) => {
    res.json({
        message: 'pong'
    })
})
app.use('/users', require('./routes/user-routes'))
app.use('/posts', require('./routes/post-routes'))

app.listen(process.env.PORT || 8080)
