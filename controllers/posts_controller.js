const user = require('../model/users_model');
const post = require('../model/posts_model');
const utils = require('../utils/util');
const qs = require('querystring');

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

module.exports.getPostsByUser = (req, res) => {
    var userName = req.params.username;
    user.findUserPosts(userName, (err, posts) => {
        post.getURLsByIDs(posts.posts, req.query.sort, (err, urls) => {
            res.json({
                error:err,
                data:urls
            })
        })
    })
}

module.exports.search = (req, res) => {
    var {limit, sort, tags, offset} = req.query
    if(limit)
        req.query.limit = parseInt(limit)
    req.query.sort = sort ? JSON.parse(sort) : {}

    if(offset)
        req.query.offset = parseInt(offset)

    if(tags){
        req.query.tags = {$in: tags instanceof Array ?
            tags :
            [tags]}
    }

    post.search(req.query, (err, urls) => {
        res.json({
            error:err,
            data:urls
        })
    })
}

module.exports.getLatestPosts = (req, res) => {
    post.getLatestPosts(parseInt(req.query.numOfPosts), req.query.sort, (err,urls) => {
        res.json({
            error:err,
            data:urls
        })
    })
}