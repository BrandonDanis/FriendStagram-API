const user = require('../model/users_model');
const utils = require('../utils/util');

module.exports.addPosts = (req, res) => {
    var id = req.user.id;
    user.addPosts(id, req.body.description, req.body.url, function (err, data) {
        res.status(err ? 404 : 200).json({
            error: err,
            data: data
        });
    });
}