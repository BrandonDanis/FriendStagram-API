const posts_controller = require("../controllers/posts_controller.js")
const auth = require("../auth.js")

module.exports = function (app) {
    app.post('/posts', auth.authenticate, posts_controller.addPosts);
    app.get('/posts/:username',posts_controller.getPostsByUser);
    app.get('/posts', posts_controller.searchPostsByTags);
    app.get('/latest_posts', posts_controller.getLatestPosts);
};
