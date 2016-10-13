const express = require('express');
const app = express();
const auth = require('./auth.js')();
const bodyParser = require('body-parser');
const cfg = require('./config.js');
const users = require('./user.js');
const jwt = require('jwt-simple');
const mongooseUser = require('./model/user.js');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');


app.use(bodyParser.json());
app.use(auth.initialize());

app.get('/', function(req,res){
	res.send('hello world');
});

app.get('/user',auth.authenticate(), function(req,res){
	console.log('we authenticated');
	res.json(users[req.user.id])
});

app.post("/token", (req, res) => {
	console.log('email is ', req.body);
	if (req.body.email && req.body.password) {
		var email = req.body.email;
		var password = req.body.password;
		console.log('email ' + email);
		console.log('password '+ password);
		var user = users.find(function(u) {
			return u.email === email && u.password === password;
		});
		if (user) {
			var payload = {id: user.id};
			var token = jwt.encode(payload, cfg.jwtSecret);
			res.json({token: token});
		} else {
			res.sendStatus(401);
		}
	} else {
		res.sendStatus(401);
	}
});
require('./routes/user-routes.js')(app);
require('./routes/post-routes.js')(app);

app.listen(process.env.PORT || 8080);

