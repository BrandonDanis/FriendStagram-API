const config = require('../config')
const db = require('pg-bricks').configure(config[process.env.NODE_ENV || 'development']);


//TODO: ensure that followeeID is an actual valid id
module.exports.followUser = (followerId, followeeId, callback) => {
    db.raw("SELECT * FROM USERS_FOLLOWS WHERE follower = $1 AND following = $2", [followerId, followeeId]).rows((err,rows) => {
		console.log(rows.length == 0);
		if(rows.length == 0){
			db.raw("INSERT INTO users_follows VALUES ($1,$2)", [followerId, followeeId]).rows((err,rows) => {
				if(err){
					console.log(err);
					callback(500, "Error while attempting to follow")
				}else{
					callback(200, "Now Following")
				}
			})
		}else{
			callback(302, "Already following")
		}
	})
}
