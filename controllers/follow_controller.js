const follow = require('../model/follow_model')
const utils = require('../utils/util')

module.exports.followUser = ({body: {userIdToFollow = null}, user = null}, res) => {
	follow.followUser(user.id, userIdToFollow, (status, msg) => {
		res.status(status).json({
			"status": msg
		})
	})
}

module.exports.unfollowUser = (req, res) => {
	res.status(200).json({
		"data": "Un-follow User"
	})
}
