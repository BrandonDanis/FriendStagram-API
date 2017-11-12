const cfg = require('./config')
const jwt = require('jwt-simple')
const user = require('./model/users_model')
const {Response, FSError} = require('./response-types')

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
      let response = FSError.unknown
      switch (e.message) {
        case 'User not found':
          response = FSError.userDoesNotExist
        // eslint-disable-next-line no-fallthrough
        case 'User not logged in':
          response = FSError.userIsNotLoggedIn
          return next(response(e.message))
      }
    }
  } catch (e) {
    console.error(e)
    next(FSError.unauthorized())
  }
}

module.exports.authorizedToDelete = async ({body: {post}, user: {id}}, res, next) => {
  try {
    await user.authorizedToDelete(post, id)
    next()
  } catch (e) {
    next(e)
  }
}
