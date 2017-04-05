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

module.exports.unfollowUser = (req, res) => {
	res.status(200).json({
		"data": "Un-follow User"
	})
}
