const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


var postSchema = new Schema({
    description: String,
    url: {
        type: String,
        require: [true, "Must Enter an URL"]
    },
    time_stamp: Date,
    tags: [String]
})

var post = mongoose.model('post', postSchema)

module.exports.addPosts = (description, url, tags, callback) => {
    post.create({
        description, 
        url, 
        time_stamp : new Date(), 
        tags
    }, (err, docs) => {
        if (err)
            callback(true)
        else
            callback(null, docs._id)
    })
}