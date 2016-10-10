var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new Schema({
	user_id: Schema.Types.ObjectID,
	user_name: String,
	password: String,
})