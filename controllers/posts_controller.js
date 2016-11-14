const user = require('../model/users_model');
const post = require('../model/posts_model');
const utils = require('../utils/util');

module.exports.addPosts = (req, res) => {
    var userID = req.user.id;
    post.addPosts(req.body.description, req.body.url, req.body.tags, function (err, data) {
        if(err)
            return res.status(400).json({error: true, data: null})
        user.linkPosts(userID, data, function (err, data) {
            res.status(err ? 404 : 200).json({
                error: err,
                data: data
            });
        });
    });
}

module.exports.getPostByUser = (req, res) =>{
    var userName = req.params.user_name;
    user.findUserPosts(userName, (err, posts) => {
        console.log(posts.posts);
        post.getURLsByIDs(posts.posts, (err, urls) => {
            res.json(urls);
        });
    })

}