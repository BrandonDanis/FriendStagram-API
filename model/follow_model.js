const config = require('../config')
const db = require('pg-bricks').
  configure(config[process.env.NODE_ENV || 'development'])

// TODO: ensure that followeeID is an actual valid id
module.exports.followUser = async (followerId, followeeUsername) => {
  try {
    await db.raw(
      'SELECT * FROM USERS_FOLLOWS WHERE follower = $1 AND following = (SELECT id FROM users WHERE username = $2)',
      [followerId, followeeUsername]).row()
    return 'Already following'
  } catch (e) {
    if (e.message === 'Expected a row, none found') {
      try {
        await db.raw(
          'INSERT INTO users_follows VALUES ($1, (SELECT id FROM users WHERE username = $2))',
          [followerId, followeeUsername]).run()
        return 'Now Following'
      } catch (err) {
        if (err.code === '23502') {
          throw new Error('User doesn\'t exist')
        } else {
          throw new Error('Error while attempting to follow')
        }
      }
    } else {
      console.error(e)
      throw new Error('Error while attempting to follow')
    }
  }
}

module.exports.unfollowUser = (unfollowerId, unfolloweeUsername) => db.raw(
  'DELETE FROM users_follows where follower = $1 and following = (SELECT id FROM users WHERE username = $2) RETURNING *',
  [unfollowerId, unfolloweeUsername]).rows()

module.exports.getAllFollowing = userID => db.raw(
  'SELECT u.id, u.name, u.username, u.profile_picture_url FROM users u JOIN users_follows uf ON u.id = uf.following WHERE uf.follower = $1',
  [userID]).rows()

module.exports.getAllFollowers = userID => db.raw(
  'SELECT u.id, u.name, u.username, u.profile_picture_url FROM users u JOIN users_followers uf ON u.id = uf.follower WHERE u.following = $1',
  [userID]).rows()
