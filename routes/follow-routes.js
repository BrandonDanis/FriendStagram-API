const app = require('express').Router()
const followcontroller = require("../controllers/follow_controller.js")
const auth = require("../auth.js")

    app.post('/', auth.authenticate, followcontroller.followUser)
    app.delete('/', auth.authenticate, followcontroller.unfollowUser)

module.exports = app
