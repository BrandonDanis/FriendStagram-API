const postModel = require('../model/posts_model')
const utils = require('../utils/util')
const Response = require('../response-types')

module.exports.addPosts = async (
  {body: {url = null, description = null, tags = null}, user = null}, res) => {
  let errors = []

  if (utils.isEmpty(user.id)) {
    errors.push('User ID is Null')
  }
  if (utils.isEmpty(url)) {
    errors.push('URL is Null')
  }

  if (!errors.isEmpty()) {
    errors = errors.map(error => new Error(error))
    return Response.BadRequest(res, errors)
  } else {
    try {
      const post = await postModel.addPosts(description, url, tags, user.id)
      return Response.OK(res, post)
    } catch (e) {
      console.error(e)
      return Response.InternalServerError(res, {title: 'Failed to create post'})
    }
  }
}

module.exports.getPostByID = async ({params: id = null}, res) => {
  try {
    const [post, user] = await postModel.getPostByID(id)
    post.user_info = user
    return Response.OK(res, post)
  } catch (e) {
    console.error(e)
    return Response.NotFound(res, {title: 'Failed to find post'})
  }
}

module.exports.search = async (req, res) => {
  let {page} = req.query
  const {limit, sort, tags} = req.query
  const searchQuery = {}

  if (page) {
    page = Number(page)
    searchQuery.offset = 0
    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(page)) {
      searchQuery.offset = Math.floor(page * limit)
    }
  }

  if (limit) {
    searchQuery.limit = Number(limit)
  }

  if (tags) {
    searchQuery.tags = tags instanceof Array ? tags : [tags]
  }

  searchQuery.sort = sort ? JSON.parse(sort) : {}

  try {
    const posts = await postModel.search(searchQuery)
    return Response.OK(res, posts)
  } catch (e) {
    console.error(e)
    return Response.InternalServerError(res, {title: 'Failed to search for posts'})
  }
}

module.exports.delete = async ({body: {post = null}}, res) => {
  try {
    await postModel.delete(post)
    return Response.OK(res, null)
  } catch (e) {
    console.error(e)
    return Response.NotFound(res, {title: 'Failed to delete post'})
  }
}
