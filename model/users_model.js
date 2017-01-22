var mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const uuid = require('uuid')
var Schema = mongoose.Schema
mongoose.Promise = global.Promise
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

var userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        require: [true, 'Must Enter a User User Name']
    },
    password: {
        type: String,
        require: [true, 'Must Enter a Password']
    },
    email: {
        type: String,
        require: [true, 'Must Enter a Email']
    },
    name: {
        type: String,
        require: [true, 'Must Enter a Name']
    },
    posts: [Schema.Types.ObjectId],
    openSessions: [String],
    followers: [Schema.Types.ObjectId],
    following: [Schema.Types.ObjectId]
})

var user = mongoose.model('user', userSchema)

module.exports.register = (username, unHashedPassword, email, name, callback) => {
    bcrypt.hash(unHashedPassword, saltRounds, (err, password) => {
        user.create({username, password, email, name}, (err, docs) => {
            callback(err, docs)
        })
    })
}

module.exports.findUser = (username, callback) => {
    user.findOne({username}, (err, docs) => {
        callback(err, docs)
    })
}

module.exports.findAllUsers = (callback) => {
    user.find({}, (err, docs) => {
        callback(err, docs)
    })
}

module.exports.authenticate = (_id, callback) => {
    user.findOne({_id}, (err, docs) => {
        callback(err, docs)
    })
}

module.exports.comparePasswordbyID = (_id, password, callback) => {
    user.findOne({_id},
        {username: 1, password: 1},(err, docs) => {
            if (err || !docs)
                return callback(true)
            else
                bcrypt.compare(password, docs.password, callback)
        })
}

module.exports.login = (username, password, callback) => {
    user.findOne({username},
        {username: 1, password: 1},(err, docs) => {
            if (err || !docs)
                return callback(true)
            else
                bcrypt.compare(password, docs.password,  (username, password, (err, ok) => {
                    if (ok) {
                        var res = {}
                        res.id = docs._id
                        res.uuid = uuid.v4()
                        user.update({username}, {$push: {"openSessions": res.uuid}}, (err, ok) => {
                            if (err || !ok)
                                return callback(true, "Please log in again")
                            else {
                                return callback(err, res)
                            }
                        })
                    } else
                        callback(true)
                }))
        })

}

module.exports.changePassword = (_id, password, newPassword, callback) => {
    comparePasswordbyID(_id, password, (err, ok) => {
        if (ok) {
            bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
                user.update({_id}, {password: hashedPassword}, (err, docs) => {
                    callback(err, docs)
                })
            })
        }
        else
            callback(true, "Password Was Incorrect")
    })
}

module.exports.logOff = (_id, requestedSession, callback) => {
    user.update({_id}, {$pull: {openSessions: requestedSession}}, (err, ok) => {
        callback(err, ok)
    })
}

module.exports.logOffAllOtherSessions = (_id, requestedSession, callback) => {
    user.update({_id}, {openSessions: [requestedSession]}, (err, ok) => {
        callback(err, ok)
    })
}

//POST METHODS

module.exports.linkPosts = (userID, postID, callback) => {
    user.findByIdAndUpdate(
        userID,
        {$push: {"posts": postID}},
        callback
    )
}

module.exports.findUserPostsbyUsername = (username, callback) => {
    user.findOne({username}, {posts:1}, callback)
}

module.exports.findUserPostsbyID = (_id, callback) => {
    user.findOne({_id}, {posts:1}, callback)
}

module.exports.authorizedToDelete = (post, _id, callback) => {
    user.findOne({_id, posts: post}, callback)
}

module.exports.removePost = (post, _id, callback) => {
    user.update({_id}, {$pull: {posts: post}}, callback)
}

module.exports.delete = (_id, callback) => {
    console.log(_id)
    user.remove({_id}, callback)
}
