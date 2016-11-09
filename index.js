const express = require('express');
const app = express();
const auth = require('./auth');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

app.use(bodyParser.json());

require('./routes/user-routes')(app);
require('./routes/post-routes')(app);

app.listen(process.env.PORT || 8080);