const express = require('express');
const app = express();
const auth = require('./auth');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const logger = require('morgan');
mongoose.connect('mongodb://localhost/test');

app.use(bodyParser.json());
app.use(logger('dev'));

require('./routes/user-routes')(app);
require('./routes/post-routes')(app);

app.listen(process.env.PORT || 8080);