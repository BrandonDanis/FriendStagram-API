const follow = require('../model/follow_model')
const utils = require('../utils/util')

module.exports.followUser = ({body: {userIdToFollow = null}, user = null}, res) => {
	if(userIdToFollow){
		follow.followUser(user.id, userIdToFollow, (status, msg) => {
			var error = true
			if(status == 200)
				error = false
			res.status(status).json({
				error: error,
				status: msg
			})
		})
	}else{
		res.status(400).json({
			error: true,
			status: "userIdToFollow parameter was not set"
		})
	}
}

module.exports.unfollowUser = ({body: {userIdToFollow = null}, user = null}, res) => {
	if(userIdToFollow){
		follow.unfollowUser(user.id, userIdToFollow, (status, msg) => {
			var error = true
			if(status == 200)
				error = false
			res.status(status).json({
				error: error,
				status: msg
			})
		})
	}else{
		res.status(400).json({
			error: true,
			status: "userIdToFollow parameter was not set"
		})
	}
}

module.exports.getAllFollowers = ({user = null}, res) => {
	follow.getAllFollowers(user.id, (err,rows) => {
		if(err){
			console.log(err);
			res.status(500).json({
				error: true,
				status: err
			})
		}else{
			res.status(200).json({
				error: true,
				status: rows
			})
		}
	})
}
