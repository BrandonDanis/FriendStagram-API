const postsController = require("../controllers/posts_controller.js")
const auth = require("../auth.js")

module.exports = function (app) {
    app.post('/posts', auth.authenticate, postsController.addPosts)
    app.get('/posts/:username',postsController.getPostsByUser)
    app.get('/posts', postsController.search)
    app.delete('/posts', auth.authenticate, auth.authorizedToDelete, postsController.delete)
}
