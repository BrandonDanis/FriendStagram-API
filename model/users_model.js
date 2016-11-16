var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const uuid = require('uuid');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        require: [true, 'Must Enter a User Name']
    },
    password: {
        type: String,
        require: [true, 'Must Enter a Password']
    },
    email: String,
    posts: [Schema.Types.ObjectId],
    openSessions: [String],
    followers: [Schema.Types.ObjectId],
    following: [Schema.Types.ObjectId]
})

var user = mongoose.model('user', userSchema)

module.exports.register = (username, unHashedPassword, callback) => {
    bcrypt.hash(unHashedPassword, saltRounds, (err, password) => {
        user.create({username, password}, (err, docs) => {
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

module.exports.authenticate = (_id, username, callback) => {
    user.findOne({_id, username}, (err, docs) => {
        callback(err, docs)
    })
}

module.exports.login = (username, password, callback) => {
    user.findOne({username},
        {username: 1, password: 1},
        (err, docs) => {
            if (err || !docs)
                return callback(true)
            else {
                bcrypt.compare(password, docs.password, (err, ok) => {
                    if (ok) {
                        docs.uuid = uuid.v4()
                        user.update({username}, {$push: {"openSessions": docs.uuid}}, (err, ok) => {
                            if (err)
                                return callback(true, "Please log in again")
                        })
                        callback(err, docs)
                    } else
                        callback(true)
                })
            }
        })
}

module.exports.changePassword = (username, password, newPassword, callback) => {
    user.findOne({username}, (err, docs) => {
        bcrypt.compare(password, docs.password, (err, ok) => {
            if (ok) {
                bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
                    user.update({username}, {password: hashedPassword}, (err, docs) => {
                        callback(err, docs)
                    })
                })
            }
            else
                callback(true, "Password Was Incorrect")
        })
    })
}

module.exports.logOff = (username, requestedSession, callback) => {
    user.update({username}, {$pull: {openSessions: requestedSession}}, (err, ok) => {
        callback(err, ok);
    })
}

module.exports.logOffAllOtherSessions = (username, requestedSession, callback) => {
    user.update({username}, {openSessions: [requestedSession]}, (err, ok) => {
        callback(err, ok);
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

module.exports.findUserPosts = (username, callback) => {
    user.findOne({username}, {posts:1}, callback)
}