const app = require('express').Router()
const followController = require('../controllers/follow_controller.js')
const auth = require('../auth.js')

app.get('/getAllFollowing/:userId', followController.getAllFollowing)
app.get('/getAllFollowers/:userId', followController.getAllFollowers)
app.post('/', auth.authenticate, followController.followUser)
app.delete('/', auth.authenticate, followController.unfollowUser)

module.exports = app
