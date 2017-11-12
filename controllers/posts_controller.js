const postModel = require('../model/posts_model')
const utils = require('../utils/util')
const {Response, FSError} = require('../response-types')

module.exports.addPosts = async ({body, user = null}, res, next) => {
  const {url = null, description = null, tags = null} = body

  let errors = utils.getMissingKeys(user, [{key: 'id', name: 'user ID'}])
  errors = errors.concat(utils.getMissingKeys(body, [{key: 'url', name: 'URL'}]))
  if (!errors.isEmpty()) {
    return next(FSError.missingParameters({errors}))
  }

  try {
    const post = await postModel.addPosts(description, url, tags, user.id)
    return Response.OK(res, post)
  } catch (e) {
    next(e)
  }
}

module.exports.getPostByID = async ({params: id = null}, res, next) => {
  try {
    const [post, user] = await postModel.getPostByID(id)
    post.user_info = user
    return Response.OK(res, post)
  } catch (e) {
    console.error(e)
    next(e)
  }
}

module.exports.search = async (req, res, next) => {
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
    next(e)
  }
}

module.exports.delete = async ({body: {post = null}}, res, next) => {
  try {
    await postModel.delete(post)
    return Response.OK(res, null)
  } catch (e) {
    next(e)
  }
}
