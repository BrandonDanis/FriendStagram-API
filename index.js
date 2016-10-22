const express = require('express');
const app = express();
const auth = require('./auth');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

app.use(bodyParser.json());

app.get('/', function(req,res){
	res.send('hello world');
});

app.get('/login',auth.authenticate, function(req,res){
	res.send('we authenticated');
});

require('./routes/user-routes')(app);
require('./routes/post-routes')(app);

app.listen(process.env.PORT || 8080);

