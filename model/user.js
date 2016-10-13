var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

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

module.exports.register = function(username,password,callback){
	user.create({'user_name':username, 'password':password},function(err,small){
		callback(err,"Successfully added an user!");
	});
};

module.exports.findUser = function(username, callback){
	user.find({'user_name':username},function(err,docs){
		callback(err,docs);
	});
};

module.exports.findAllUsers = function(callback){
	user.find({},function(err,docs){
		callback(err,docs);
	});
};



