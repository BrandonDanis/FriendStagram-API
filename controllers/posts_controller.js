const postModel = require('../model/posts_model')
const utils = require('../utils/util')
const {Response, Error, ErrorResponse} = require('../response-types')

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
    res.status(400).json(new ErrorResponse(errors))
  } else {
    try {
      const post = await postModel.addPosts(description, url, tags, user.id)
      res.status(200).json(new Response(post))
    } catch (e) {
      console.error(e)
      res.status(500).json(new ErrorResponse(
        [new Error('Failed to create post')]
      ))
    }
  }
}

module.exports.getPostByID = async ({params: {id = null}}, res) => {
  try {
    const [post, user] = await postModel.getPostByID(id)
    post.user_info = user
    res.status(200).json(new Response(post))
  } catch (e) {
    console.error(e)
    res.status(404).json(new ErrorResponse(
      new Error('Failed to find post')
    ))
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
    res.status(200).json(new Response(posts))
  } catch (e) {
    console.error(e)
    res.status(500).json(new ErrorResponse(
      [new Error('Failed to search for posts')]
    ))
  }
}

module.exports.likePost = async ({params: {id = null}, user = null}, res) => {
  try {
    const postID = Number(id)
    await postModel.likePost(postID, user.id)
    res.status(200).json(new Response(null))
  } catch (e) {
    if (e.code === '23505') {
      return res.status(412).json(new ErrorResponse(
        [new Error('Already been liked')]
      ))
    }
    console.error(e)
    res.status(500).json(new ErrorResponse(
      [new Error('Failed to like this post')]
    ))
  }
}

module.exports.delete = async ({body: {post = null}}, res) => {
  try {
    await postModel.delete(post)
    res.status(200).json(new Response(null))
  } catch (e) {
    console.error(e)
    res.status(404).json(new ErrorResponse(
      [new Error('Failed to delete post')]
    ))
  }
}
