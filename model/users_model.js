const bcrypt = require('bcrypt')
const uuid = require('uuid')

const config = require('../config')
const db = require('pg-bricks').configure(config[process.env.NODE_ENV || 'development'])
const utils = require('../utils/util')
const {FSError} = require('../response-types')

// eslint-disable-next-line
const saltRounds = config.saltRounds

module.exports.register = async (username, unHashedPassword, email, name) => {
  const allTheSalt = await bcrypt.genSalt(saltRounds)
  const password = await bcrypt.hash(unHashedPassword, allTheSalt, null)
  try {
    return await db.insert('users', {username, password, email, name}).returning('*').row()
  } catch (e) {
    if (e.code === '23505') {
      throw FSError.fieldAlreadyExists({detail: `${utils.capitalize(e.detail.match(/[a-zA-Z]+(?=\))/)[0])} already exists`})
    }
  }
}

module.exports.findUserByUsername = async (username) => {
  const userPromise = db.select([
    'name',
    'username',
    'datecreated',
    'description',
    'profile_picture_url',
    'profile_background_url']).from('users').where({username}).row()

  const postsPromise = db.raw(
    'SELECT * FROM posts WHERE user_id = (SELECT id FROM users WHERE username  = $1) ORDER BY id DESC;',
    [username]).rows()

  const followerIDsPromise = db.raw(
    'SELECT uf.follower FROM users_follows uf JOIN users u ON uf.following = u.id WHERE uf.following = (SELECT id FROM users WHERE username = $1);',
    [username]).rows()

  const followingIDsPromise = db.raw(
    'SELECT uf.following FROM users_follows uf JOIN users u ON uf.follower = u.id WHERE uf.follower = (SELECT id FROM users WHERE username = $1);',
    [username]).rows()

  const [followerIDs, followingIDs] = await Promise.all(
    [followerIDsPromise, followingIDsPromise])

  let followersPromise
  if (followerIDs.length !== 0) {
    const params = followerIDs.map((id, index) => `$${index + 1}`).join(', ')
    followersPromise = db.raw(
      `SELECT username FROM users WHERE id IN (${params})`,
      followerIDs.map(({follower}) => follower)).rows()
  }

  let followingPromise
  if (followingIDs.length !== 0) {
    const params = followingIDs.map((id, index) => `$${index + 1}`).join(', ')
    followingPromise = db.raw(
      `SELECT username FROM users WHERE id IN (${params})`,
      followingIDs.map(({following}) => following)).rows()
  }

  try {
    return await Promise.all([userPromise, postsPromise, followersPromise, followingPromise])
  } catch (e) {
    if (e.message === 'Expected a row, none found') { // user not found
      throw FSError.userDoesNotExist({detail: 'User not found'})
    }
  }
}

module.exports.findUserByID = async (id) => {
  try {
    const {username} = await db.select('username').from('users').where({id}).row()
    return module.exports.findUserByUsername(username)
  } catch (e) {
    if (e.message === 'Expected a row, none found') { // user not found
      throw FSError.userDoesNotExist({detail: 'User not found'})
    }
  }
}

module.exports.findAllUsers = () => db.select(
  ['id', 'username', 'name', 'datecreated', 'email', 'description'])
  .from('users')
  .rows()

module.exports.authenticate = async (id, sessionID) => {
  try {
    await db.select('id').from('users').where({id}).row()
  } catch (e) {
    throw FSError.userDoesNotExist()
  }

  try {
    await db.select('id').from('users_sessions').where({id: sessionID}).row()
  } catch (e) {
    throw FSError.userIsNotLoggedIn()
  }
}

module.exports.comparePasswordByID = async (id, password) => {
  const row = await db.select(['password']).from('users').where({id}).row()
  return bcrypt.compare(password, row.password)
}

module.exports.login = async (username, password) => {
  const {id: userID, password: hashedPassword, verified, profile_picture_url} = await db
    .select(['id', 'password', 'verified', 'profile_picture_url'])
    .from('users')
    .where({username})
    .row()
  const validPassword = await bcrypt.compare(password, hashedPassword)

  if (!validPassword) {
    throw FSError.invalidPassword()
  }

  const uuidStr = uuid.v4()
  await db.raw('INSERT INTO users_sessions VALUES ($1, $2);', [uuidStr, userID]).run()
  return {id: uuidStr, user_id: userID, verified, profile_picture_url}
}

module.exports.changePassword = async (id, password, newPassword) => {
  const passwordMatch = await module.exports.comparePasswordByID(id, password)
  if (!passwordMatch) {
    throw FSError.invalidPassword()
  }

  const allTheSalt = await bcrypt.genSalt(saltRounds)
  const hashedPassword = await bcrypt.hash(newPassword, allTheSalt, null)

  return db.update('users').set('password', hashedPassword).where({id}).run()
}

module.exports.logOff = id => db.delete('users_sessions').where({id}).run()

module.exports.logOffAllOtherSessions = (id, requestedSession) => db.raw(
  'DELETE FROM users_sessions WHERE id NOT IN ($1) AND user_id = $2',
  [requestedSession, id]).run()

module.exports.authorizedToDelete = async (postID, id) => {
  try {
    await db.select('user_id').from('posts').where({id: postID, user_id: id}).row()
  } catch (e) {
    if (e.message.indexOf('Expected a row') > -1) {
      throw FSError.unauthorized({detail: 'User does not have the right to delete this post'})
    }
  }
}

module.exports.delete = id => db.delete().from('users').where({id}).run()

module.exports.updateProfilePicture = (userId, imageURL) => db.update('users', {profile_picture_url: imageURL}).where('id', userId).run()

module.exports.updateBackgroundPicture = (userId, imageURL) => db.update('users', {profile_background_url: imageURL}).where('id', userId).run()
