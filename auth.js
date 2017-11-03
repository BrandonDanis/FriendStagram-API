const cfg = require('./config')
const jwt = require('jwt-simple')
const user = require('./model/users_model')
const {Error, ErrorResponse} = require('./response-types')

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
      switch (e.message) {
        case 'User not found':
          return res.status(404).json(new ErrorResponse(
            [new Error('User not found')])
          )
        case 'User not logged in':
          return res.status(412).json(new ErrorResponse(
            [new Error('User not logged in')]
          ))
        default:
          return res.status(500).json(new ErrorResponse(
            [new Error('An error occurred authenticating')]
          ))
      }
    }
  } catch (e) {
    console.error(e)
    return res.status(401).json(new ErrorResponse(
      [new Error('Bad token')]
    ))
  }
}

module.exports.authorizedToDelete = async (req, res, next) => {
  try {
    await user.authorizedToDelete(req.body.post, req.user.id)
    next()
  } catch (e) {
    console.error(e)
    if (e.message.indexOf('Expected a row') > -1) {
      res.status(401).json(new ErrorResponse(
        [new Error('User does not have the right to delete this post')]
      ))
    } else {
      res.status(500).json(new ErrorResponse(
        [new Error('An error occurred authenticating')]
      ))
    }
  }
}
