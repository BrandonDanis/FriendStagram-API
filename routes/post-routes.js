const app = require('express').Router()
const postsController = require("../controllers/posts_controller.js")
const auth = require("../auth.js")


    app.post('/', auth.authenticate, postsController.addPosts)

    app.get('/', postsController.search)
    //app.get('/feed', postsController.getFollowingPosts)
    //app.get('/public', postsController.getPublicPosts)
    app.get('/id/:postid', postsController.getPostByID)
    app.get('/user/:username',postsController.getPostsByUser)

    app.delete('/', auth.authenticate, auth.authorizedToDelete, postsController.delete)


module.exports = app
