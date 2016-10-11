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
	console.log('tryna register');
	console.log(username + ' '+ password)
	user.create({'user_name':username, 'password':password},function(err,small){
		console.log('creating user');
		if(err){
			callback();
			return console.log(err);
		}
		callback();
	});
};

module.exports.findUser = function(username, callback){
	console.log('tryna find');
	console.log(username);
	user.find({'user_name':username},function(err,docs){
		if(err){
			callback();
			return console.log(err);
		}
		console.log(docs);
		callback();
	});
};

