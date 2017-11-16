const cfg = require('./config')
const jwt = require('jwt-simple')
const user = require('./model/users_model')
const {FSError} = require('./response-types')

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
      next(e)
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
