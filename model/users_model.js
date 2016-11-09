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
	}],
	logged_in: Boolean
});

var user = mongoose.model('user', userSchema);



module.exports.register = (user_name,un_hashed_password,callback) => {
	bcrypt.hash(un_hashed_password,saltRounds,(err,password) => {
		user.create({user_name, password},(err, docs) => {
			callback(err, "Successfully added an user!");
		});
	})
};

module.exports.findUser = (user_name, callback) => {
	user.findOne({user_name},(err,docs) => {
		callback(err,docs);
	});
};

module.exports.findAllUsers = (callback) => {
	user.find({},(err,docs) => {
		callback(err,docs);
	});
};

module.exports.authenticate = (_id,user_name,callback) => {
	user.findOne({_id,user_name},(err,docs) => {
		callback(err,docs);
	})
}

module.exports.findUserWithCreds = (user_name, password, callback) => {
	user.findOne({user_name},
		{user_name:1, password:1},
		(err, docs) => {
		bcrypt.compare(password,docs.password,(err,ok) => {
			if(ok)
			{
				user.update({user_name}, {logged_in: true},(err,ok) => {
					if(err)
						return callback(true,"Please log in again")
				})
				callback(err,docs)
			}
			else
				callback(true)
		})
	})
}

module.exports.changePassword = (user_name,password,new_password,callback) =>{
	user.findOne({user_name},(err,docs) => {
		bcrypt.compare(password,docs.password,(err,ok) => {
			if(ok){
				bcrypt.hash(new_password,saltRounds,(err,hashedPassword) => {
					user.update({user_name},{password: hashedPassword},(err,docs) => {
						callback(err,docs)
					})
				})
			}
			else
				callback(true,"Password Was Incorrect")
		})
	})
}

module.exports.globalLogOff = (callback) =>{
	user.update({},{logged_in: false},(err,ok) => {
		callback(err,ok);
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