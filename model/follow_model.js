const config = require('../config')
const db = require('pg-bricks').configure(config[process.env.NODE_ENV || 'development']);


//TODO: ensure that followeeID is an actual valid id
module.exports.followUser = (followerId, followeeId, callback) => {
    db.raw("SELECT * FROM USERS_FOLLOWS WHERE follower = $1 AND following = $2", [followerId, followeeId]).rows((err,rows) => {
		if(rows.length == 0){
			db.raw("INSERT INTO users_follows VALUES ($1,$2)", [followerId, followeeId]).rows((err,rows) => {
				if(err){
					if(err.message.indexOf('violates foreign key constraint') > -1){
		                callback(401, "User doesn't exist")
		            }else{
						callback(500, "Error while attempting to follow")
					}
				}else{
					callback(200, "Now Following")
				}
			})
		}else{
			callback(302, "Already following")
		}
	})
}

module.exports.unfollowUser = (followerId, followeeId, callback) => {
    db.raw("delete from users_follows where follower = $1 and following = $2", [followerId, followeeId]).rows((err,rows) => {
		if(err){
			console.log(err);
			callback(500, "Error un-following")
		}else{
			callback(200, "Unfollowed")
		}
	})
}

module.exports.getAllFollowing = (userId, callback) => {
	db.raw("SELECT id,name,username,profile_picture_url FROM USERS_FOLLOWS, USERS WHERE FOLLOWER = $1 AND USERS.ID = USERS_FOLLOWS.following", [userId]).rows(callback)
}

module.exports.getAllFollowers = (userId, callback) => {
	db.raw("SELECT id,name,username,profile_picture_url FROM USERS_FOLLOWS, USERS WHERE FOLLOWING = $1 AND USERS.ID = USERS_FOLLOWS.follower", [userId]).rows(callback)
}
