const {Response, FSError} = require('./response-types')

module.exports = (error, req, res, next) => {
  if (error instanceof FSError) {
    return res.status(Number(error.status)).json({data: null, error})
  }
  console.error(error)
  return Response.InternalServerError(res, new FSError({code: 'FS-ERR-0', title: 'An error occurred'}))
}
