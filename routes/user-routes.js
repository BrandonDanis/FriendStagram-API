const mongooseUser = require('../model/user.js');

module.exports = function(app){
	app.get('/users', function(req,res){
		mongooseUser.findAllUsers(function(err,data){
			if(err)
				res.json(404,{'error':err, 'data': null})
			else
				res.json(200,{'error':null, 'data': data})
		});
	})

	app.post('/users', function(req,res){
		var user_name = req.body.user_name;
		var password = req.body.password;
		console.log('username: '+ user_name);
		console.log('password: ' +password);
		mongooseUser.register(user_name,password,function(err,success){
			if(err)
				res.json(400, {'error': err, 'data': null})
			else
				res.json(201, {'error':null, 'data': success})
		})
	})
};
