const cfg = require('./config')
const jwt = require('jwt-simple')
const user = require('./model/users_model')

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
          return res.status(404).json({
            data: null,
            errors: [{title: 'User not found'}],
            meta: {}
          })
        case 'User not logged in':
          return res.status(412).json({
            data: null,
            errors: [{title: 'User not logged in'}],
            meta: {}
          })
        default:
          return res.status(500).json({
            data: null,
            errors: [{title: 'An error occurred authenticating'}],
            meta: {}
          })
      }
    }
  } catch (e) {
    console.error(e)
    return res.status(401).json({
      data: null,
      errors: [{title: 'Bad token'}],
      meta: {}
    })
  }
}

module.exports.authorizedToDelete = async (req, res, next) => {
  try {
    await user.authorizedToDelete(req.body.post, req.user.id)
    next()
  } catch (e) {
    console.error(e)
    if (e.message.indexOf('Expected a row') > -1) {
      res.status(401).json({
        data: null,
        errors: [{title: 'User does not have right to delete this post'}],
        meta: {}
      })
    } else {
      res.status(500).json({
        data: null,
        errors: [{title: 'An error occurred authenticating'}],
        meta: {}
      })
    }
  }
}
