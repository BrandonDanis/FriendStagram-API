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
    open_sessions: [String],
    followers: [Schema.Types.ObjectId],
    following: [Schema.Types.ObjectId]
})

var user = mongoose.model('user', userSchema)

module.exports.register = (username, un_hashed_password, callback) => {
    bcrypt.hash(un_hashed_password, saltRounds, (err, password) => {
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

module.exports.findUserWithCreds = (username, password, callback) => {
    user.findOne({username},
        {username: 1, password: 1},
        (err, docs) => {
            if (err || !docs)
                return callback(true)
            else {
                bcrypt.compare(password, docs.password, (err, ok) => {
                    if (ok) {
                        docs.uuid = uuid.v4()
                        user.update({username}, {$push: {"open_sessions": docs.uuid}}, (err, ok) => {
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

module.exports.changePassword = (username, password, new_password, callback) => {
    user.findOne({username}, (err, docs) => {
        bcrypt.compare(password, docs.password, (err, ok) => {
            if (ok) {
                bcrypt.hash(new_password, saltRounds, (err, hashedPassword) => {
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

module.exports.logOff = (username, requested_session, callback) => {
    user.update({username}, {$pull: {open_sessions: requested_session}}, (err, ok) => {
        callback(err, ok);
    })
}

module.exports.logOffAllOtherSessions = (username, requested_session, callback) => {
    user.update({username}, {open_sessions: [requested_session]}, (err, ok) => {
        callback(err, ok);
    })
}

//POST METHODS

module.exports.linkPosts = (user_id, post_id, callback) => {
    user.findByIdAndUpdate(
        user_id,
        {$push: {"posts": post_id}},
        callback
    )
}

module.exports.findUserPosts = (username, callback) => {
    user.findOne({username}, {posts:1}, callback)
}