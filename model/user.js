var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	// user_id: 		Schema.Types.ObjectID,
	user_name: {
		type: 		String,
		require: 	[true, 'Must Enter a User Name']
	},
	password: {
		type: 		String,
		require: 	[true, 'Must Enter a Password']
	},
	email: 			String
});

module.exports.user = mongoose.model('User', userSchema);