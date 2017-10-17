const postModel = require('../model/posts_model');
const utils = require('../utils/util');

module.exports.addPosts = async ({ body: { url = null, description = null, tags = null }, user = null }, res) => {
    let errors = [];

    if (utils.isEmpty(user.id)) {
        errors.push('User ID is Null');
    }
    if (utils.isEmpty(url)) {
        errors.push('URL is Null');
    }

    if (!errors.isEmpty()) {
        errors = errors.map(error => ({ title: error }));
        res.status(400).json({
            data: null,
            errors,
            meta: {},
        });
    } else {
        try {
            const post = await postModel.addPosts(description, url, tags, user.id);
            res.status(200).json({
                data: post,
                errors: [],
                meta: {},
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                data: null,
                errors: [{ title: 'Failed to create post' }],
                meta: {},
            });
        }
    }
};

module.exports.getPostByID = async ({ params: id = null }, res) => {
    try {
        const [post, user] = await postModel.getPostByID(id);
        post.user_info = user;
        res.status(200).json({
            data: post,
            errors: [],
            meta: {},
        });
    } catch (e) {
        console.error(e);
        res.status(404).json({
            data: null,
            errors: [{ title: 'Failed to find post' }],
            meta: {},
        });
    }
};

module.exports.search = async (req, res) => {
    let { page } = req.query;
    const { limit, sort, tags } = req.query;
    const searchQuery = {};

    if (page) {
        page = Number(page);
        searchQuery.offset = 0;
        // eslint-disable-next-line no-restricted-globals
        if (!isNaN(page)) {
            searchQuery.offset = Math.floor(page * limit);
        }
    }

    if (limit) {
        searchQuery.limit = Number(limit);
    }

    if (tags) {
        searchQuery.tags = tags instanceof Array ? tags : [tags];
    }

    searchQuery.sort = sort ? JSON.parse(sort) : {};

    try {
        const posts = await postModel.search(searchQuery);
        res.status(200).json({
            data: posts,
            errors: [],
            meta: {},
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            data: null,
            errors: [{ title: 'Failed to search for posts' }],
            meta: {},
        });
    }
};

module.exports.delete = async ({ body: { post = null } }, res) => {
    try {
        await postModel.delete(post);
        res.status(200).json({
            data: null,
            errors: [],
            meta: {},
        });
    } catch (e) {
        console.error(e);
        res.status(404).json({
            data: null,
            errors: [{ title: 'Failed to delete post' }],
            meta: {},
        });
    }
};
