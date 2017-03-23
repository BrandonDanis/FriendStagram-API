var db = require('pg-bricks').configure(process.env.DB_URL);

module.exports.addPosts = (description, url, tags, owner, callback) => {
    db.raw('INSERT INTO posts (description, image_url, owner) VALUES ($1,$2,$3)',[description,url,owner]).row(callback)
}

module.exports.getPostByID = (id, callback) => {
    db.raw('SELECT * FROM posts WHERE posts.id = $1', [id]).row(callback)
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
    db.raw('DELETE FROM posts WHERE posts.id = $1', [_id]).row(callback)
}

module.exports.batchDelete = (postsToDelete, callback) => {
    post.remove({_id: { $in: postsToDelete}}, callback)
}
