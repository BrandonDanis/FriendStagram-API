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

module.exports.getURLsByIDs = (idList, sort, callback) => {
    post.find({_id : {$in: idList}}, {url: 1}, callback).sort(sort ? JSON.parse(sort):{})
}

module.exports.getURLsByTags = (tagList, sort, callback) => {
    post.find(tagList ?
            {tags : {$in: tagList instanceof Array ?
                tagList :
                [tagList]}} :
            {},
        {url: 1}, callback).sort(sort ? JSON.parse(sort):{})
}