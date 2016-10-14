const mongooseUser = require('../model/user.js');

module.exports = function(app){
	app.get('/users', function(req,res){
		mongooseUser.findAllUsers(function(err,data){
			if(err)
				res.status(404).json({'error':err, 'data': data})
			else
				res.status(200).json({'error':err, 'data': data})
		});
	})

	app.post('/users', ({body: {user_name = null, password = null}}, res) => {
		mongooseUser.register(user_name,password,function(err,data){
			if(err)
				res.status(500).json({'error':err, 'data': data})
			else
				res.status(201).json({'error':err, 'data': data})
		})
	})
};
