const follow = require('../model/follow_model');

module.exports.followUser = ({ body: { followUsername = null }, user = null }, res) => {
    if (followUsername) {
        follow.followUser(user.id, followUsername, (status, msg) => {
            let error = true;
            if (status === 200) { error = false; }
            res.status(status).json({
                error,
                status: msg,
            });
        });
    } else {
        res.status(400).json({
            error: true,
            status: 'followUsername parameter was not set',
        });
    }
};

module.exports.unfollowUser = ({ body: { unfollowUsername = null }, user = null }, res) => {
    if (unfollowUsername) {
        follow.unfollowUser(user.id, unfollowUsername, (status, msg) => {
            let error = true;
            if (status === 200) { error = false; }
            res.status(status).json({
                error,
                status: msg,
            });
        });
    } else {
        res.status(400).json({
            error: true,
            status: 'unfollowUsername parameter was not set',
        });
    }
};

module.exports.getAllFollowing = ({ params: { userId = null } }, res) => {
    follow.getAllFollowing(userId, (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).json({
                error: true,
                data: [],
            });
        } else {
            res.status(200).json({
                error: false,
                data: rows,
            });
        }
    });
};

module.exports.getAllFollowers = ({ params: { userId = null } }, res) => {
    follow.getAllFollowers(userId, (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).json({
                error: true,
                data: [],
            });
        } else {
            res.status(200).json({
                error: false,
                data: rows,
            });
        }
    });
};
