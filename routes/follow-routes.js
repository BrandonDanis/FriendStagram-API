const app = require('express').Router()
const followcontroller = require("../controllers/follow_controller.js")
const auth = require("../auth.js")

	app.get('/getAllFollowing', auth.authenticate, followcontroller.getAllFollowing)
	app.get('/getAllFollowers', auth.authenticate, followcontroller.getAllFollowers)
    app.post('/', auth.authenticate, followcontroller.followUser)
    app.delete('/', auth.authenticate, followcontroller.unfollowUser)

module.exports = app
