const userModel = require('../model/users_model');
const utils = require('../utils/util');
const jwt = require('jwt-simple');
const cfg = require('../config');

module.exports.findAllUsers = async (req, res) => {
    try {
        const users = await userModel.findAllUsers();
        return res.status(200).json({
            data: users,
            errors: [],
            meta: {},
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            data: null,
            errors: [{ title: 'Failed to load users' }],
            meta: {},
        });
    }
};

module.exports.register = async ({
    body: {
        username = null, password = null, email = null, name = null,
    },
}, res) => {
    let errors = [];

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

    if (!errors.isEmpty()) {
        errors = errors.map(error => ({ title: error }));
        return res.status(401).json({
            data: null,
            errors,
            meta: {},
        });
    }
    try {
        const { id, datecreated } = await userModel.register(username, password, email, name);
        return res.status(201).json({
            data: {
                name, username, email, datecreated, id,
            },
            errors: [],
            meta: {},
        });
    } catch (e) {
        if (e.code === '23505') {
            return res.status(409).json({
                data: null,
                errors: [{ title: `${utils.capitalize(e.detail.match(/[a-zA-Z]+(?=\))/)[0])} already exists` }],
                meta: {},
            });
        }
        console.log(e);
        return res.status(500).json({
            data: null,
            errors: [{ title: 'An error occurred trying to register' }],
            meta: {},
        });
    }
};

module.exports.findUser = async ({ params: { username = null } }, res) => {
    try {
        const [userInfo, postInfo = [], followersInfo = [], followingInfo = []] = await userModel.findUser(username);
        userInfo.posts = postInfo.map((post) => {
            const newPost = post;
            newPost.user = {
                username: userInfo.username,
                profile_picture_url: userInfo.profile_picture_url,
                name: userInfo.name,
            };
            return newPost;
        });
        userInfo.followers = followersInfo;
        userInfo.following = followingInfo;
        return res.status(202).json({
            data: userInfo,
            errors: [],
            meta: {},
        });
    } catch (e) {
        if (e.message === 'Expected a row, none found') { // user not found
            return res.status(404).json({
                data: null,
                errors: [{ title: 'User not found' }],
                meta: {},
            });
        }
        console.error(e);
        return res.status(500).json({
            data: null,
            errors: [{ title: `An error occurred trying to locate ${username}` }],
            meta: {},
        });
    }
};

module.exports.login = async ({ body: { username = null, password = null } }, res) => {
    let errors = [];

    if (utils.isEmpty(username)) {
        errors.push('Username is null');
    }
    if (utils.isEmpty(password)) {
        errors.push('Password is null');
    }

    if (!errors.isEmpty()) {
        errors = errors.map(error => ({ title: error }));
        return res.status(401).json({
            data: null,
            errors,
            meta: {},
        });
    }
    try {
        const loginData = await userModel.login(username, password);
        const payload = {
            id: loginData.user_id,
            timestamp: new Date(),
            uuid: loginData.id,
        };
        const token = jwt.encode(payload, cfg.jwtSecret);
        return res.status(200).json({
            data: token,
            errors: [],
            meta: {},
        });
    } catch (e) {
        let error = '';
        if (e.message === 'Require key') {
            error = 'Invalid signature';
            console.error('jwtSecret is missing');
        } else {
            console.error(e);
            error = 'An error occurred trying to verify you';
        }
        return res.status(500).json({
            data: null,
            errors: [{ title: error }],
            meta: {},
        });
    }
};

module.exports.changeUser = async ({ user: { id }, body: { old_password: oldPassword, new_password: newPassword } }, res) => {
    let errors = [];
    if (!id) {
        errors.push('Invalid user ID');
    }
    if (!oldPassword || !newPassword) {
        errors.push('Invalid password sent');
    }
    if (!errors.isEmpty()) {
        errors = errors.map(error => ({ title: error }));
        return res.status(400).json({
            data: null,
            errors,
            meta: {},
        });
    }

    try {
        await userModel.changePassword(id, oldPassword, newPassword);
        return res.status(200).json({
            data: 'Successfully updated user',
            errors: [],
            meta: {},
        });
    } catch (e) {
        if (e.message !== 'Invalid password') {
            return res.status(500).json({
                data: null,
                errors: [{ title: 'An error occurred trying to apply the new changes' }],
            });
        }
        return res.status(403).json({
            data: null,
            errors: [{ title: e.message }],
            meta: {},
        });
    }
};

module.exports.logOff = async (req, res) => {
    try {
        await userModel.logOff(req.user.uuid);
        return res.status(200).json({
            data: 'Successfully logged out',
            errors: [],
            meta: {},
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            data: null,
            errors: [{ title: 'Failed to logout' }],
            meta: {},
        });
    }
};

module.exports.logOffAllOtherSessions = async (req, res) => {
    try {
        await userModel.logOffAllOtherSessions(req.user.id, req.user.uuid);
        return res.status(200).json({
            data: 'Successfully logged out of your other sessions',
            errors: [],
            meta: {},
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            data: null,
            errors: [{ title: 'An error occurred logging out of your other sessions' }],
            meta: {},
        });
    }
};

module.exports.delete = async ({ body: { password = null }, user = null }, res) => {
    const passwordMatch = await userModel.comparePasswordByID(user.id, password);
    if (!passwordMatch) {
        return res.status(403).json({
            data: null,
            errors: [{ title: 'Invalid password' }],
            meta: {},
        });
    }

    try {
        await userModel.delete(user.id);
        return res.status(200).json({
            data: 'Successfully deleted user',
            errors: [],
            meta: {},
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            data: null,
            errors: [{ title: 'An error occurred trying to remove your account' }],
            meta: {},
        });
    }
};

module.exports.updateProfilePicture = async ({ user: { id = null }, body: { image_url: imageURL = null } }, res) => {
    try {
        await userModel.updateProfilePicture(id, imageURL);
        return res.status(200).json({
            data: 'Successfully updated your user profile',
            errors: [],
            meta: {},
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            data: null,
            errors: [{ title: 'Failed to update user profile' }],
            meta: {},
        });
    }
};

module.exports.updateBackgroundPicture = async ({ user: { id = null }, body: { image_url: imageURL = null } }, res) => {
    try {
        await userModel.updateBackgroundPicture(id, imageURL);
        return res.status(200).json({
            data: 'Successfully updated your user profile',
            errors: [],
            meta: {},
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            data: null,
            errors: [{ title: 'Failed to update user profile' }],
            meta: {},
        });
    }
};
