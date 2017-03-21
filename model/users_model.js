const db = require('pg-bricks').configure(process.env.DB_URL)
const bcrypt = require('bcrypt-nodejs')
const saltRounds = 10
const uuid = require('uuid')
const Rx = require('rx')

module.exports.register = (username, unHashedPassword, email, name, callback) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    bcrypt.hash(unHashedPassword, salt, null, (err, password) => {
        db.insert('users', {username, password, email, name}).returning('*').row((err) => {
            callback(err)
        })
    })
}

module.exports.findUser = (username) => {
    const userObservable = Rx.Observable.create(observer => {
        db.select(['name', 'username', 'datecreated', 'description', 'profile_picture_url', 'profile_background_url']).from('users').where({'username': username}).row((err, row) => {
            if (err)
                observer.onError(err);
            else
                observer.onNext(row);
            observer.onCompleted();
        });
    });
    const postsObservable = Rx.Observable.create((observer => {
        db.raw('SELECT * FROM posts WHERE user_id = (SELECT id FROM users WHERE username  = $1);', [username]).rows((err, rows) => {
            if (err)
                observer.onError(err);
            else
                observer.onNext(rows);
            observer.onCompleted();
        })
    }))

    return Rx.Observable.forkJoin(userObservable, postsObservable);
}

module.exports.findAllUsers = (callback) => {
    db.raw('SELECT id,name,datecreated,email,description FROM users').rows(callback)
}

module.exports.authenticate = (_id, callback) => {
    user.findOne({_id}, (err, docs) => {
        callback(err, docs)
    })
}

module.exports.comparePasswordbyID = (id, password, callback) => {
    db.select(['password']).from('users').where({id}).row((err, row) => {
        if (err)
            callback(true);
        else
            bcrypt.compare(password, row.password, callback);
    });
    /*user.findOne({_id},
     {username: 1, password: 1}, (err, docs) => {
     if (err || !docs)
     return callback(true)
     else
     bcrypt.compare(password, docs.password, callback)
     })*/
}

module.exports.login = (username, password) => {
    return Rx.Observable.create((observer => {
        db.select(['username', 'password']).from('users').where({username}).row((err, row) => {
            if (err)
                observer.onError(err);
            else
                observer.onNext(row.password);
            observer.onCompleted();
        })
    })).flatMap(hashedPassword => {
        return Rx.Observable.create(observer => {
            bcrypt.compare(password, hashedPassword, (err, res) => {
                if (err || !res) {
                    console.error(err);
                    console.log(res);
                    observer.onError('An error occurred. Please log in again!');
                    observer.onCompleted();
                } else {
                    db.raw('INSERT INTO users_sessions VALUES($1, (SELECT id FROM users WHERE username = $2)) RETURNING *;', [uuid.v4(), username]).row((err, row) => {
                        if (err)
                            observer.onError(err);
                        else
                            observer.onNext(row);
                        observer.onCompleted();
                    });
                }
            });
        });
    });
}

module.exports.changePassword = (id, password, newPassword, callback) => {
    comparePasswordbyID(id, password, (err, ok) => {
        if (ok) {
            bcrypt.hash(newPassword, saltRounds, null, (err, hashedPassword) => {
                if (err) {
                    console.error(err);
                    callback(true, 'An error occurred. Please try again')
                } else {
                    db.update('users').set('password', hashedPassword).where({id}).returning('*').row((err, row) => {
                        callback(err, row);
                    });
                }
            })
        }
        else
            callback(true, 'Password Was Incorrect')
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
    user.aggregate([
        {
            $match: {
                "username": username
            }
        },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "owner",
                as: "posts"
            }
        },
        {
            $project: {
                "username": 1,
                "email": 1,
                "name": 1,
                "posts": "$posts"
            }
        }
    ], callback)

}

module.exports.findUserPostsbyID = (_id, callback) => {
    user.findOne({_id}, {posts: 1}, callback)
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
