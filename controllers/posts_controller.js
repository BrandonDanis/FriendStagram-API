const postModel = require('../model/posts_model');
const utils = require('../utils/util');

module.exports.addPosts = async ({ body: { url = null, description = null, tags = null }, user = null }, res) => {
    const errors = [];

    if (utils.isEmpty(user.id)) {
        errors.push('User ID is Null');
    }
    if (utils.isEmpty(url)) {
        errors.push('URL is Null');
    }

    if (errors.length > 0) {
        res.status(400).json({
            error: true,
            data: errors.join('\n'),
        });
    } else {
        try {
            const post = await postModel.addPosts(description, url, tags, user.id);
            res.status(200).json({
                error: false,
                data: post,
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                error: true,
                msg: 'Failed to create post',
            });
        }
    }
};

module.exports.getPostByID = async ({ params: id = null }, res) => {
    try {
        const [post, user] = await postModel.getPostByID(id);
        post.user_info = user;
        res.status(200).json({
            error: false,
            data: post,
        });
    } catch (e) {
        console.error(e);
        res.status(404).json({
            error: true,
            data: 'Failed to find post',
        });
    }
};

module.exports.search = async (req, res) => {
    let { page } = req.query;
    const { limit, sort, tags } = req.query;

    if (page) {
        page = Number(page);
        req.query.offset = 0;
        // eslint-disable-next-line no-restricted-globals
        if (!isNaN(page)) {
            req.query.offset = Math.floor(page * limit);
        }
        delete req.query.page;
    }

    if (limit) {
        req.query.limit = Number(limit);
    }

    if (tags) {
        req.query.tags = tags instanceof Array ? tags : [tags];
    }

    req.query.sort = sort ? JSON.parse(sort) : {};

    try {
        const posts = await postModel.search(req.query);
        res.status(200).json({
            error: false,
            data: posts,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            error: true,
            msg: 'Search failed',
        });
    }
};

module.exports.delete = async ({ body: { post = null } }, res) => {
    try {
        await postModel.delete(post);
        res.status(200).json({
            error: false,
            data: null,
        });
    } catch (e) {
        console.error(e);
        res.status(404).json({
            error: true,
            msg: 'Failed to delete post',
        });
    }
};
