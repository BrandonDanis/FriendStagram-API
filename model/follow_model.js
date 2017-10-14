const config = require('../config');
const db = require('pg-bricks').configure(config[process.env.NODE_ENV || 'development']);

// TODO: ensure that followeeID is an actual valid id
module.exports.followUser = (followerId, followeeUsername, callback) => {
    db.raw('SELECT * FROM USERS_FOLLOWS WHERE follower = $1 AND following = (SELECT id FROM users WHERE username = $2)', [followerId, followeeUsername]).row((err, row) => {
        if (!row) {
            db.raw('INSERT INTO users_follows VALUES ($1, (SELECT id FROM users WHERE username = $2))', [followerId, followeeUsername]).run((e) => {
                if (e) {
                    if (e.code === '23502') {
                        callback(401, "User doesn't exist");
                    } else {
                        callback(500, 'Error while attempting to follow');
                    }
                } else {
                    callback(200, 'Now Following');
                }
            });
        } else {
            callback(200, 'Already following');
        }
    });
};

// TODO: Add meaningful error message
module.exports.unfollowUser = (unfollowerId, unfolloweeUsername, callback) => {
    db.raw('DELETE FROM users_follows where follower = $1 and following = (SELECT id FROM users WHERE username = $2) RETURNING *', [unfollowerId, unfolloweeUsername]).rows((err) => {
        if (err) {
            console.log(err);
            callback(500, 'Error unfollowing');
        } else {
            callback(200, 'Unfollowed');
        }
    });
};

module.exports.getAllFollowing = (userId, callback) => {
    db.raw('SELECT id,name,username,profile_picture_url FROM USERS_FOLLOWS, USERS WHERE FOLLOWER = $1 AND USERS.ID = USERS_FOLLOWS.following', [userId]).rows(callback);
};

module.exports.getAllFollowers = (userId, callback) => {
    db.raw('SELECT id,name,username,profile_picture_url FROM USERS_FOLLOWS, USERS WHERE FOLLOWING = $1 AND USERS.ID = USERS_FOLLOWS.follower', [userId]).rows(callback);
};
