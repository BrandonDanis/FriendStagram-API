const mongoose = require('mongoose')
var Schema = mongoose.Schema
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))


var postSchema = new Schema({
    description: String,
    url: {
        type: String,
        require: [true, "Must Enter an URL"]
    },
    timeStamp: Date,
    tags: [String],
    owner: Schema.Types.ObjectId
})

var post = mongoose.model('post', postSchema)

module.exports.addPosts = (description, url, tags, owner, callback) => {
    post.create({
        description,
        url,
        timeStamp : new Date(),
        tags,
        owner
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

module.exports.getPostByID = (id, callback) => {
    post.findById(id, {url: 1, description: 1, tags: 1, owner: 1, timestamp: 1}, callback)
}

module.exports.search = (queryParams, callback) => {
    var {tags, offset = 0, limit = 15, sort, description} = queryParams

    var findParams = {}
    if(tags)
        findParams["tags"] = tags
    if(description)
        findParams["description"] = {$regex: new RegExp(description, "i")}

    post.aggregate([
        { $sort : { timeStamp : -1 } },
        { $limit : limit },
        { $skip : offset },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                "_id" : 1,
                "username" : "$user.username",
                "user_id" : "$user._id",
                "url" : 1,
                "timeStamp" : 1,
                "description" : 1
            }
        }
    ], callback)

}

module.exports.delete = (_id, callback) => {
    post.remove({_id} , callback)
}

module.exports.batchDelete = (postsToDelete, callback) => {
    post.remove({_id: { $in: postsToDelete}}, callback)
}
