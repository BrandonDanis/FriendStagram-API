var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var userSchema = new Schema({
	//user_id: 		Schema.Types.ObjectID,
	user_name: {
		type: 		String,
		unique: 	true,
		require: 	[true, 'Must Enter a User Name']
	},
	password: {
		type: 		String,
		require: 	[true, 'Must Enter a Password']
	},
	email: 			String,
	pictures: [
	{
		description: String,
		url: String
	}]
});

var user = mongoose.model('user', userSchema);



module.exports.register = (user_name,un_hashed_password,callback) => {
	bcrypt.hash(un_hashed_password,saltRounds,function(err,password){
		user.create({user_name, password}, function (err, docs) {
			callback(err, "Successfully added an user!");
		});
	})
};

module.exports.findUser = (user_name, callback) => {
	user.findOne({user_name},function(err,docs){
		callback(err,docs);
	});
};

module.exports.findAllUsers = (callback) => {
	user.find({},function(err,docs){
		callback(err,docs);
	});
};

module.exports.authenticate = (_id,user_name,callback) => {
	user.findOne({_id,user_name},function (err,docs){
		callback(err,docs);
	})
}

module.exports.findUserWithCreds = (user_name, password, callback) => {
	user.findOne({user_name},
		{id:1, user_name:1, password:1},
		(err, docs) => {
		bcrypt.compare(password,docs.password,(err,ok) => {
			ok?
				callback(err,docs):
				callback(true)
		})
	})
}

module.exports.changePassword = (user_name,password,new_password,callback) =>{
	user.findOne({user_name},function(err,docs){
		bcrypt.compare(password,docs.password,function(err,ok){
			if(ok){
				bcrypt.hash(new_password,saltRounds,function(err,hashedPassword){
					user.update({user_name},{password: hashedPassword},function(err,docs){
						callback(err,docs)
					})
				})
			}
			else
				callback(true,"Password Was Incorrect")
		})
	})
}

//POST METHODS

module.exports.addPosts = (_id,description,url,callback) => {
	user.findByIdAndUpdate(
		_id,
		{$push: {"pictures": {description,url}}},
		callback
	)
}