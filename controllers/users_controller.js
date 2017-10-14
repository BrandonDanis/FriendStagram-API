const user = require('../model/users_model');
const utils = require('../utils/util');
const jwt = require('jwt-simple');
const cfg = require('../config');

module.exports.findAllUsers = async (req, res) => {
    try {
        const users = await user.findAllUsers();
        return res.status(200).json({
            error: false,
            data: users,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: true });
    }
};

module.exports.register = async ({
    body: {
        username = null, password = null, email = null, name = null,
    },
}, res) => {
    const errors = [];

    if (utils.isEmpty(username)) {
        errors.push('Username is null');
    }
    if (utils.isEmpty(password)) {
        errors.push('Password is null');
    }
    if (utils.isEmpty(email)) {
        errors.push('Email is null');
    }
    if (utils.isEmpty(name)) {
        errors.push('Name is null');
    }

    if (!utils.isEmpty(errors)) {
        return res.status(401).json({
            error: true,
            data: errors,
        });
    }
    try {
        const { id, datecreated } = await user.register(username, password, email, name);
        return res.status(201).json({
            error: false,
            data: {
                name, username, email, datecreated, id,
            },
        });
    } catch (e) {
        if (e.code === '23505') {
            return res.status(409).json({
                error: true,
                msg: `${utils.capitalize(e.detail.match(/[a-zA-Z]+(?=\))/)[0])} already exists`,
            });
        }
        console.log(e);
        return res.status(500).json({ error: true });
    }
};

module.exports.findUser = async ({ params: { username = null } }, res) => {
    try {
        const [{ profile_picture_url, name }, postInfo = [], followersInfo = [], followingInfo = []] = await user.findUser(username);
        const userInfo = postInfo.map((post) => {
            const newPost = post;
            newPost.user = {
                username,
                profile_picture_url,
                name,
            };
            return newPost;
        });
        userInfo.posts = postInfo;
        userInfo.followers = followersInfo;
        userInfo.following = followingInfo;
        return res.status(202).json({
            error: false,
            data: userInfo,
        });
    } catch (e) {
        if (e.message === 'Expected a row, none found') { // user not found
            return res.status(404).json({
                error: true,
                data: 'User not found',
            });
        }
        console.error(e);
        return res.status(500).json({
            error: true,
            data: e,
        });
    }
};

module.exports.login = async ({ body: { username = null, password = null } }, res) => {
    const errors = [];

    if (utils.isEmpty(username)) {
        errors.push('Username is null');
    }
    if (utils.isEmpty(password)) {
        errors.push('Password is null');
    }

    if (!errors.isEmpty()) {
        return res.status(401).json({
            error: true,
            data: errors,
        });
    }
    try {
        const loginData = await user.login(username, password);
        const payload = {
            id: loginData.user_id,
            timestamp: new Date(),
            uuid: loginData.id,
        };
        const token = jwt.encode(payload, cfg.jwtSecret);
        return res.status(200).json({ error: false, data: token });
    } catch (e) {
        let error = '';
        if (e.message === 'Require key') {
            error = 'Invalid signature';
            console.error('jwtSecret is missing');
        } else {
            error = e.message;
        }
        return res.status(500).json({ error: true, data: error });
    }
};

module.exports.changeUser = async ({ user: { id }, body: { old_password: oldPassword, new_password: newPassword } }, res) => {
    const errors = [];
    if (!id) {
        errors.push('Invalid user ID');
    }
    if (!oldPassword || !newPassword) {
        errors.push('Invalid password sent');
    }
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, data: errors.join('\n') });
    }

    try {
        await user.changePassword(id, oldPassword, newPassword);
        return res.status(200).json({
            error: false,
            data: 'User updated',
        });
    } catch (e) {
        if (e.message === 'Invalid password') {
            return res.status(403).json({ error: true, data: e.message });
        }
        return res.status(500).json({ error: true, data: e.message });
    }
};

module.exports.logOff = async (req, res) => {
    try {
        await user.logOff(req.user.uuid);
        return res.status(200).json({ error: false, data: null });
    } catch (e) {
        console.error(e);
    }

    return res.status(500).json({
        error: true,
        data: null,
        errors: [{
            info: 'Failed to logout',
        }],
    });
};

module.exports.logOffAllOtherSessions = async (req, res) => {
    try {
        await user.logOffAllOtherSessions(req.user.id, req.user.uuid);
    } catch (e) {
        console.error(e);
        return res.status(200).json({
            error: false,
            data: null,
        });
    }

    return res.status(400).json({
        error: true,
        data: 'An error occurred',
    });
};

module.exports.delete = async (req, res) => {
    const passwordMatch = await user.comparePasswordByID(req.user.id, req.body.password);
    if (!passwordMatch) {
        throw new Error('Invalid password');
    }

    try {
        await user.delete(req.user.id);
        return res.status(200).json({
            error: true,
            data: 'Successfully deleted user',
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: true,
            data: null,
        });
    }
};

module.exports.updateProfilePicture = async ({ user: { id = null }, body: { image_url: imageURL = null } }, res) => {
    try {
        await user.updateProfilePicture(id, imageURL);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: true,
            data: 'Failed to update user profile',
        });
    }
    return res.status(200).json({
        error: false,
        data: 'Successfully update user profile',
    });
};

module.exports.updateBackgroundPicture = async ({ user: { id = null }, body: { image_url: imageURL = null } }, res) => {
    try {
        await user.updateBackgroundPicture(id, imageURL);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: true,
            data: 'Failed to update user profile',
        });
    }
    return res.status(200).json({
        error: false,
        data: 'Successfully updated user profile',
    });
};
