const config = require('../config')
const db = require('pg-bricks')
  .configure(config[process.env.NODE_ENV || 'development'])

module.exports.addPosts = (description, url, tags, owner) => db.insert('posts',
  {description, image_url: url, user_id: owner}).returning('*').row()

module.exports.getPostByID = (id) => {
  const getPost = db.select('p.id AS post_id', 'p.description', 'p.image_url')
    .from('posts as p')
    .join('users u')
    .on('p.user_id', 'u.id')
    .where({'p.id': id})
    .row()

  const getUserInfo = db.select('u.id as user_id', 'u.profile_picture_url')
    .from('users as u')
    .join('posts p')
    .on('u.id', 'p.user_id')
    .where({'p.id': id})
    .row()

  return Promise.all([getPost, getUserInfo])
}

// TODO: add sort
module.exports.search = async ({
                                 tags, offset = 0, limit = 15, description = ''
                               }) => {
  const findParams = {}
  if (tags) { findParams.tags = tags }
  if (description) { findParams.description = description }

  const getPosts = async (postIDs) => {
    const hasIDs = postIDs !== undefined
    const postIDQuery = hasIDs ? ' AND P.id IN $4' : ''
    const params = [`%${description}%`, offset, limit]
    if (hasIDs) { params.push(postIDs) }

    return db.raw(
      `SELECT P.id, P.description, P.image_url, U.id as user_id, U.username FROM POSTS as P, USERS as U WHERE P.USER_ID = U.ID AND P.DESCRIPTION LIKE $1${postIDQuery} ORDER BY P.id DESC OFFSET $2 LIMIT $3`,
      params).rows()
  }

  const postIDs = tags !== undefined && tags.length > 0 ? await db.select(
    'pt.post_id').from('post_tags as pt').join('tags t').on('t.id', 'pt.tag_id')
  // eslint-disable-next-line no-undef
    .where($in('t.name', tags)).rows() : undefined

  return getPosts(postIDs)
}

module.exports.likePost = (id, userID) => db.insert('post_likes', {'post_id': id, 'user_id': userID}).run()

module.exports.unlikePost = (id, userID) => db.delete('post_likes').where({'post_id': id, 'user_id': userID}).returning('post_id').row()

module.exports.delete = id => db.delete().from('posts').where({id}).run()

// eslint-disable-next-line no-undef
module.exports.batchDelete = postsToDelete => db.delete()
  .from('posts')
  .where($in('id', postsToDelete))
  .run()
