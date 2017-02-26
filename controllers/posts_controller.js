const user = require('../model/users_model')
const post = require('../model/posts_model')
const utils = require('../utils/util')
const qs = require('querystring')

module.exports.addPosts = (req, res) => {
    var userID = req.user.id
    var url = req.body.url

    var errorMessage = ""

    if (utils.isEmpty(userID)) {
        errorMessage+="User ID is Null\n"
    }
    if (utils.isEmpty(url)) {
        errorMessage+="URL is Null\n"
    }

    if(!utils.isEmpty(errorMessage)){
        res.status(401).json({
            error: true,
            data: errorMessage
        })
    }
    else {
        post.addPosts(req.body.description, req.body.url, req.body.tags, req.user.id, function (err, data) {
            if(err)
                return res.status(400).json({error: true, data: null})
            user.linkPosts(userID, data, function (err, data) {
                res.status(err ? 404 : 200).json({
                    error: err,
                    data: data
                })
            })
        })
    }
}

module.exports.getPostsByUser = (req, res) => {
    var userName = req.params.username
    user.findUserPostsbyUsername(userName, (err, posts) => {
        post.getURLsByIDs(posts.posts, req.query.sort, (err, urls) => {
            res.status(err ? 404 : 200).json({
                error: err,
                data: urls
            })
        })
    })
}

module.exports.getPostByID = (req, res) => {
    post.getPostByID(req.params.postid, (err, urls) => {
        res.status(err ? 404 : 200).json({
            error: err,
            data: urls
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
        res.status(err ? 404 : 200).json({
            error: err,
            data: urls
        })
    })
}

module.exports.delete = (req, res) => {
    post.delete(req.body.post, (err, ok) => {
        if (err) {
            return res.status(404).json({
                error: err,
                data: ok
            })
        }
        else{
            user.removePost(req.body.post, req.user.id, (err, ok) => {
                res.status(err ? 404 : 200).json({
                    error: err,
                    data: ok
                })
            })
        }

    })
}
