const cfg = require('./config')
const jwt = require('jwt-simple')
const user = require('./model/users_model')
const Response = require('./response-types')

// eslint-disable-next-line
module.exports.authenticate = async (req, res, next) => {
  const token = req.get('token')
  try {
    const {id, uuid} = jwt.decode(token, cfg.jwtSecret)

    try {
      await user.authenticate(id, uuid)
      req.user = {id, uuid}
      next()
    } catch (e) {
      console.error(e)
      let response = (res, error) => console.error(error)
      switch (e.message) {
        case 'User not found':
          response = Response.NotFound
        // eslint-disable-next-line no-fallthrough
        case 'User not logged in':
          response = Response.PreconditionFailed
          return response(res, {title: e.message})
        default:
          return Response.InternalServerError(res, {title: 'An error occurred authenticating'})
      }
    }
  } catch (e) {
    console.error(e)
    return Response.Unauthorized(res, {title: 'Bad token'})
  }
}

module.exports.authorizedToDelete = async ({body: {post}, user: {id}}, res, next) => {
  try {
    await user.authorizedToDelete(post, id)
    next()
  } catch (e) {
    console.error(e)
    if (e.message.indexOf('Expected a row') > -1) {
      return Response.Unauthorized(res, {title: 'User does not have the right to delete this post'})
    }
    return Response.InternalServerError(res, {title: 'An error occurred authenticating'})
  }
}
