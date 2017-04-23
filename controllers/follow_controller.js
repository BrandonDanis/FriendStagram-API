const follow = require('../model/follow_model')
const utils = require('../utils/util')

module.exports.followUser = ({body: {followId = null}, user = null}, res) => {
	if (followId) {
		follow.followUser(user.id, followId, (status, msg) => {
			let error = true;
			if(status === 200)
				error = false
			res.status(status).json({
				error: error,
				status: msg
			})
		})
	}else{
		res.status(400).json({
			error: true,
			status: "followId parameter was not set"
		})
	}
}

module.exports.unfollowUser = ({body: {unfollowId = null}, user = null}, res) => {
	if(unfollowId){
		follow.unfollowUser(user.id, unfollowId, (status, msg) => {
			let error = true;
			if(status === 200)
				error = false;
			res.status(status).json({
				error: error,
				status: msg
			})
		})
	}else{
		res.status(400).json({
			error: true,
			status: "unfollowId parameter was not set"
		})
	}
}

module.exports.getAllFollowing = ({params: {userId = null}}, res) => {
	follow.getAllFollowing(userId, (err,rows) => {
		if(err){
			console.log(err);
			res.status(500).json({
				error: true,
				data: []
			})
		}else{
			res.status(200).json({
				error: false,
				data: rows
			})
		}
	})
}

module.exports.getAllFollowers = ({params: {userId = null}}, res) => {
	follow.getAllFollowers(userId, (err,rows) => {
		if(err){
			console.log(err);
			res.status(500).json({
				error: true,
				data: []
			})
		}else{
			res.status(200).json({
				error: false,
				data: rows
			})
		}
	})
}
