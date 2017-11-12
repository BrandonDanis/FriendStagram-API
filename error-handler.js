const {FSError} = require('./response-types')

module.exports = (error, req, res, next) => {
  if (error instanceof FSError) {
    return res.status(Number(error.status)).json({data: null, error})
  }
  console.error(error)
  module.exports(FSError.unknown(), req, res, next)
}
