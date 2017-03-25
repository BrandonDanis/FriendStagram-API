const user = require('../model/users_model')
const post = require('../model/posts_model')
const utils = require('../utils/util')

module.exports.addPosts = ({body: {url = null, description = null, tags = null}, user = null}, res) => {
    let errorMessage = '';

    if (utils.isEmpty(user.id)) {
        errorMessage += 'User ID is Null\n'
    }
    if (utils.isEmpty(url)) {
        errorMessage += 'URL is Null\n'
    }

    if (!utils.isEmpty(errorMessage)) {
        res.status(401).json({
            error: true,
            data: errorMessage
        })
    } else {
        const addPostObservable = post.addPosts(description, url, tags, user.id);
        addPostObservable.subscribe(
            post =>
                res.status(200).json({
                    error: false,
                    data: post
                }),
            err => {
                console.error(err);
                res.status(400).json({
                    error: true,
                    data: null
                })
            }
        );
    }
}

module.exports.getPostByID = ({params: {postID = null}}, res) => {
    const getPostObservable = post.getPostByID(postID);
    getPostObservable.subscribe(
        post => res.status(200).json({
            error: false,
            data: post
        }),
        err => {
            console.error(err);
            res.status(404).json({
                error: true,
                data: null
            });
        }
    )
}

module.exports.search = (req, res) => {
    let {page, limit, sort, tags} = req.query;

    if (page) {
        page = parseInt(page);
        req.query.offset = 0;
        if (!isNaN(page)) {
            req.query.offset = Math.floor(page * limit);
        }
        delete req.query.page;
    }

    if (limit)
        req.query.limit = parseInt(limit);

    if (tags)
        req.query.tags = tags instanceof Array ? tags : [tags];

    req.query.sort = sort ? JSON.parse(sort) : {};

    const searchObservable = post.search(req.query);
    searchObservable.subscribe(
        posts => res.status(200).json({
            error: false,
            data: posts
        }),
        err => {
            console.error(err);
            res.status(400).json({
                error: true,
                data: null
            });
        }
    )
}

module.exports.delete = ({body = null}, res) => {
    const deletePostObservable = post.delete(body.post);
    deletePostObservable.subscribe(
        () => res.status(200).json({
            error: false,
            data: null
        }),
        err => {
            console.error(err);
            res.status(404).json({
                error: true,
                data: null
            });
        }
    );
    /*, (err, ok) => {
     if (err) {
     return res.status(404).json({
     error: err,
     data: ok
     })
     }
     else {
     user.removePost(body.post, user.id, (err, ok) => {
     res.status(err ? 404 : 200).json({
     error: err,
     data: ok
     })
     })
     }

     })*/
}
