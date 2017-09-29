const config = require('../config')
const db = require('pg-bricks').configure(config[process.env.NODE_ENV || 'development']);
const bcrypt = require('bcrypt')
const saltRounds = config['saltRounds']
const uuid = require('uuid')
const Rx = require('rx')

module.exports.register = async (username, unHashedPassword, email, name) => {
    const allTheSalt = await bcrypt.genSalt(saltRounds)
    const password = await bcrypt.hash(unHashedPassword, allTheSalt, null)
    return db.insert('users', {username, password, email, name}).returning('*').row();
};

module.exports.findUser = async (username) => {
    const userPromise = db.select(['name', 'username', 'datecreated', 'description', 'profile_picture_url', 'profile_background_url']).from('users').where({'username': username}).row()

    const postsPromise = db.raw('SELECT * FROM posts WHERE user_id = (SELECT id FROM users WHERE username  = $1) ORDER BY id DESC;', [username]).rows()

    const followerIDsPromise = db.raw("SELECT uf.follower FROM users_follows uf JOIN users u ON uf.following = u.id WHERE uf.following = (SELECT id FROM users WHERE username = $1);", [username]).rows()

    const followingIDsPromise = db.raw("SELECT uf.following FROM users_follows uf JOIN users u ON uf.follower = u.id WHERE uf.follower = (SELECT id FROM users WHERE username = $1);", [username]).rows()

    const [followerIDs, followingIDs] = await Promise.all([followerIDsPromise, followingIDsPromise])

    var followersPromise
    if(followerIDs.length !== 0){
        const params = followerIDs.map((id, index) => `\$${index + 1}`).join(', ')
        followersPromise = db.raw(`SELECT username FROM users WHERE id IN (${params})`, followerIDs).rows()
    }

    var followingPromise
    if(followerIDs.length !== 0){
        const params = followerIDs.map((id, index) => `\$${index + 1}`).join(', ')
        followingPromise = db.raw(`SELECT username FROM users WHERE id IN (${params})`, followingIDs).rows()
    }

    return Promise.all([userPromise, postsPromise, followersPromise, followingPromise])
};

module.exports.findAllUsers = () => {
    return db.select(['id', 'username', 'name', 'datecreated', 'email', 'description']).from('users').rows();
}

module.exports.authenticate = async (id, uuid) => {
    try {
        await db.select('id').from('users').where({id}).row()
    } catch(e) {
        throw new Error('User not found')
    }

    try {
        await db.select('id').from('users_sessions').where({'id': uuid}).row()
    } catch(e) {
        throw new Error('User not logged in')
    }
}

module.exports.comparePasswordbyID = async (id, password, callback) => {
    const row = await db.select(['password']).from('users').where({id}).row()
    return bcrypt.compare(password, row.password);
}

module.exports.login = async (username, password) => {
    const possibleUser = await db.select(['username', 'password']).from('users').where({username}).row()
    const validPssd = await bcrypt.compare(password, possibleUser.password)

    if(!validPssd)
        throw new Error('Invalid password')

    return db.raw('INSERT INTO users_sessions VALUES($1, (SELECT id FROM users WHERE username = $2)) RETURNING *;', [uuid.v4(), username]).row()
}

module.exports.changePassword = async (id, password, newPassword, callback) => {
    const passwordMatch = await module.exports.comparePasswordbyID(id, password)
    if(!passwordMatch)
        throw new Error('Invalid password')

    const allTheSalt = await bcrypt.genSalt(saltRounds)
    const hashedPassword = await bcrypt.hash(newPassword, allTheSalt, null)

    return db.update('users').set('password', hashedPassword).where({id}).run();
}

module.exports.logOff = (id) => {
    return db.delete('users_sessions').where({id}).run()
}

module.exports.logOffAllOtherSessions = (id, requestedSession) => {
    return Rx.Observable.create(observer => {
        db.raw('DELETE FROM users_sessions WHERE id NOT IN ($1) AND user_id = $2', [requestedSession, id]).run(err => {
            if (err)
                observer.onError(err);
            else
                observer.onNext('');
            observer.onCompleted();
        });
    });
}

//POST METHODS

/*module.exports.findUserPostsbyID = (id) => {
    return Rx.Observable.create(observer => {
        db.select('id').from('posts').where({'user_id': id}).rows((err, rows) => {
            if (err)
                observer.onError(err);
            else
                observer.onNext(rows);
            observer.onCompleted();
        });
    });
}*/

module.exports.authorizedToDelete = (postID, id) => {
    return Rx.Observable.create(observer => {
        db.select('user_id').from('posts').where({'id': postID, 'user_id': id}).row((err, row) => {
            if (err)
                observer.onError(err);
            else
                observer.onNext(row);
            observer.onCompleted();
        });
    });
}

/*module.exports.removePost = (post, _id, callback) => {
    user.update({_id}, {$pull: {posts: post}}, callback)
}*/

module.exports.delete = (id) => {
    return Rx.Observable.create(observer => {
        db.delete().from('users').where({id}).run(err => {
            if (err)
                observer.onError(err);
            else
                observer.onNext('');
            observer.onCompleted();
        });
    });
}

module.exports.updateProfilePicture = (userId, image_url) => {
    return Rx.Observable.create(observer => {
        db.update('users', {profile_picture_url: image_url}).where('id', userId).run((err) => {
            if(err){
                observer.onError(err)
            }else{
                observer.onNext()
            }
            observer.onCompleted()
        })
    })
}

module.exports.updateBackgroundPicture = (userId, image_url) => {
    return Rx.Observable.create(observer => {
        db.update('users', {profile_background_url: image_url}).where('id', userId).run((err) => {
            if(err){
                observer.onError(err)
            }else{
                observer.onNext()
            }
            observer.onCompleted()
        })
    })
}
