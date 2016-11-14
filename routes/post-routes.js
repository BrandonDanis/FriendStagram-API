const posts_controller = require("../controllers/posts_controller.js")
const auth = require("../auth.js")

module.exports = function (app) {
    app.post('/posts', auth.authenticate, posts_controller.addPosts);
    app.get('/posts/:user_name',posts_controller.getPostByUser);
};
