const express = require('express');
const app = express();
const auth = require('./auth.js')();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');


app.use(bodyParser.json());
app.use(auth.initialize());

app.get('/', function(req,res){
	res.send('hello world');
});

app.get('/user',auth.authenticate(), function(req,res){
	console.log('we authenticated');
});

require('./routes/user-routes.js')(app);
require('./routes/post-routes.js')(app);

app.listen(process.env.PORT || 8080);

