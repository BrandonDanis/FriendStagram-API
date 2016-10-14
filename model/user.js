var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
const utils = require('../util.js');

var userSchema = new Schema({
	// user_id: 		Schema.Types.ObjectID,
	user_name: {
		type: 		String,
		unique: 	true,
		require: 	[true, 'Must Enter a User Name']
	},
	password: {
		type: 		String,
		require: 	[true, 'Must Enter a Password']
	},
	email: 			String
});

var user = mongoose.model('User', userSchema);



module.exports.register = (username,password,callback) => {
	if(utils.isEmpty(username))
		callback("Username is Null", null)
	else if(utils.isEmpty(password))
		callback("Password is Null", null)
	else
	{
		user.create({'user_name': username, 'password': password}, function (err, small) {
			callback(err, "Successfully added an user!");
		});
	}
};

module.exports.findUser = (username, callback) => {
	user.find({'user_name':username},function(err,docs){
		callback(err,docs);
	});
};

module.exports.findAllUsers = (callback) => {
	user.find({},function(err,docs){
		callback(err,docs);
	});
};



