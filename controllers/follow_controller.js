const followModel = require('../model/follow_model');

module.exports.followUser = async ({ body: { followUsername = null }, user = null }, res) => {
    if (followUsername) {
        try {
            const msg = await followModel.followUser(user.id, followUsername);
            return res.status(200).json({
                data: msg,
                errors: [],
                meta: {},
            });
        } catch (e) {
            if (e.message === 'User doesn\'t exist') {
                return res.status(401).json({
                    data: null,
                    errors: [{ title: e.message }],
                    meta: {},
                });
            }
            console.error(e);
            return res.status(500).json({
                data: null,
                errors: [{ title: e.message }],
                meta: {},
            });
        }
    } else {
        return res.status(400).json({
            data: null,
            errors: [{ title: 'followUsername parameter was not set' }],
            meta: {},
        });
    }
};

module.exports.unfollowUser = async ({ body: { unfollowUsername = null }, user = null }, res) => {
    if (unfollowUsername) {
        try {
            await followModel.unfollowUser(user.id, unfollowUsername);
            return res.status(200).json({
                data: `You have unfollowed ${unfollowUsername}`,
                errors: [],
                meta: {},
            });
        } catch (e) {
            // TODO: Do better error handling
            console.error(e);
            return res.status(500).json({
                data: null,
                errors: [{ title: `An error occurred unfollowing ${unfollowUsername}` }],
                meta: {},
            });
        }
    } else {
        return res.status(400).json({
            data: null,
            errors: [{ title: 'unfollowUsername parameter was not set' }],
            meta: {},
        });
    }
};

module.exports.getAllFollowing = async ({ params: { userId = null } }, res) => {
    try {
        const following = await followModel.getAllFollowing(userId);
        return res.status(200).json({
            data: following,
            errors: [],
            meta: {},
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            data: null,
            errors: [{ title: 'An error occurred retrieving users following you' }],
            meta: {},
        });
    }
};

module.exports.getAllFollowers = ({ params: { userId = null } }, res) => {
    try {
        const followers = followModel.getAllFollowers(userId);
        return res.status(200).json({
            data: followers,
            errors: [],
            meta: {},
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            data: null,
            errors: [{ title: 'An error occurred retrieving your followers' }],
            meta: {},
        });
    }
};
