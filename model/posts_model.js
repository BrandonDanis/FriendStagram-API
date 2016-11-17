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
    timeStamp: Date,
    tags: [String]
})

var post = mongoose.model('post', postSchema)

module.exports.addPosts = (description, url, tags, callback) => {
    post.create({
        description, 
        url,
        timeStamp : new Date(),
        tags
    }, (err, docs) => {
        if (err)
            callback(true)
        else
            callback(null, docs._id)
    })
}

module.exports.getURLsByIDs = (idList, sort, callback) => {
    post.find({_id : {$in: idList}}, {url: 1}, callback)
        .sort(sort ? JSON.parse(sort):{})
}

module.exports.search = (queryParams, callback) => {
    var {tags, offset = 0, limit = 15, sort, description} = queryParams
    limit = parseInt(limit)
    var findParams = {}

    if(tags){
        findParams["tags"] = {$in: tags instanceof Array ?
            tags :
            [tags]}
    }

    if(description)
        findParams["description"] = {$regex: new RegExp(description, "i")}

    console.log(findParams)
    post.find(findParams, {url: 1}, callback)
        .sort(sort ? JSON.parse(sort):{})
        .skip(offset)
        .limit(limit)
}

module.exports.getLatestPosts = (numOfLatestPosts, sort, callback) => {
    post.find({}, {url: 1}, callback)
        .sort(sort ? Json.parse(sort):{timeStamp : -1})
        .limit(numOfLatestPosts)
}