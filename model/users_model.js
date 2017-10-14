const config = require('../config');
const db = require('pg-bricks').configure(config[process.env.NODE_ENV || 'development']);
const bcrypt = require('bcrypt');

// eslint-disable-next-line
const saltRounds = config.saltRounds;
const uuid = require('uuid');

module.exports.register = async (username, unHashedPassword, email, name) => {
    const allTheSalt = await bcrypt.genSalt(saltRounds);
    const password = await bcrypt.hash(unHashedPassword, allTheSalt, null);
    return db.insert('users', {
        username, password, email, name,
    }).returning('*').row();
};

module.exports.findUser = async (username) => {
    const userPromise = db.select(['name', 'username', 'datecreated', 'description', 'profile_picture_url', 'profile_background_url']).from('users').where({ username }).row();

    const postsPromise = db.raw('SELECT * FROM posts WHERE user_id = (SELECT id FROM users WHERE username  = $1) ORDER BY id DESC;', [username]).rows();

    const followerIDsPromise = db.raw('SELECT uf.follower FROM users_follows uf JOIN users u ON uf.following = u.id WHERE uf.following = (SELECT id FROM users WHERE username = $1);', [username]).rows();

    const followingIDsPromise = db.raw('SELECT uf.following FROM users_follows uf JOIN users u ON uf.follower = u.id WHERE uf.follower = (SELECT id FROM users WHERE username = $1);', [username]).rows();

    const [followerIDs, followingIDs] = await Promise.all([followerIDsPromise, followingIDsPromise]);

    let followersPromise;
    if (followerIDs.length !== 0) {
        const params = followerIDs.map((id, index) => `$${index + 1}`).join(', ');
        followersPromise = db.raw(`SELECT username FROM users WHERE id IN (${params})`, followerIDs.map(({ follower }) => follower)).rows();
    }

    let followingPromise;
    if (followingIDs.length !== 0) {
        const params = followingIDs.map((id, index) => `$${index + 1}`).join(', ');
        followingPromise = db.raw(`SELECT username FROM users WHERE id IN (${params})`, followingIDs.map(({ following }) => following)).rows();
    }

    return Promise.all([userPromise, postsPromise, followersPromise, followingPromise]);
};

module.exports.findAllUsers = () => db.select(['id', 'username', 'name', 'datecreated', 'email', 'description']).from('users').rows();

module.exports.authenticate = async (id, sessionID) => {
    try {
        await db.select('id').from('users').where({ id }).row();
    } catch (e) {
        throw new Error('User not found');
    }

    try {
        await db.select('id').from('users_sessions').where({ id: sessionID }).row();
    } catch (e) {
        throw new Error('User not logged in');
    }
};

module.exports.comparePasswordByID = async (id, password) => {
    const row = await db.select(['password']).from('users').where({ id }).row();
    return bcrypt.compare(password, row.password);
};

module.exports.login = async (username, password) => {
    const possibleUser = await db.select(['username', 'password']).from('users').where({ username }).row();
    const validPssd = await bcrypt.compare(password, possibleUser.password);

    if (!validPssd) {
        throw new Error('Invalid password');
    }

    return db.raw('INSERT INTO users_sessions VALUES($1, (SELECT id FROM users WHERE username = $2)) RETURNING *;', [uuid.v4(), username]).row();
};

module.exports.changePassword = async (id, password, newPassword) => {
    const passwordMatch = await module.exports.comparePasswordByID(id, password);
    if (!passwordMatch) {
        throw new Error('Invalid password');
    }

    const allTheSalt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(newPassword, allTheSalt, null);

    return db.update('users').set('password', hashedPassword).where({ id }).run();
};

module.exports.logOff = id => db.delete('users_sessions').where({ id }).run();

module.exports.logOffAllOtherSessions = (id, requestedSession) => db.raw('DELETE FROM users_sessions WHERE id NOT IN ($1) AND user_id = $2', [requestedSession, id]).run();

module.exports.authorizedToDelete = (postID, id) => {
    db.select('user_id').from('posts').where({ id: postID, user_id: id }).row();
};

module.exports.delete = id => db.delete().from('users').where({ id }).run();

module.exports.updateProfilePicture = (userId, imageURL) => db.update('users', { profile_picture_url: imageURL }).where('id', userId).run();

module.exports.updateBackgroundPicture = (userId, imageURL) => db.update('users', { profile_background_url: imageURL }).where('id', userId).run();
