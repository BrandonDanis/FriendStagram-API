const statuses = require('statuses')
const codes = [200, 201, 202, 400, 401, 403, 404, 409, 412, 500]

// Only created like this for code completion
// noinspection JSUnusedAssignment
let functions = {
  OK: sendFakeResponse,
  Created: sendFakeResponse,
  Accepted: sendFakeResponse,
  BadRequest: sendFakeError,
  Unauthorized: sendFakeError,
  Forbidden: sendFakeError,
  NotFound: sendFakeError,
  Conflict: sendFakeError,
  PreconditionFailed: sendFakeError,
  InternalServerError: sendFakeError
}
functions = statuses.codes.filter(code => codes.some(usedCode => code === usedCode)).map(code => {
  // Generates each function
  const functionName = statuses[code].replace(/[^a-zA-Z]/g, '')
  if (code >= 400 && code < 600) {
    return {
      [functionName]: (res, error) => {
        error.status = String(code)
        res.status(code).json({data: null, error})
      }
    }
  }
  return {
    [functionName]: (res, data) => res.status(code).json({data, error: {}})
  }
}).reduce((obj, funcObj) => {
  // Moving each generated function into one big object instead of using an array
  const key = Object.keys(funcObj)[0]
  obj[key] = funcObj[key]
  return obj
}, {})

function sendFakeResponse (res, data) {
  return 200
}

function sendFakeError (res, error) {
  return 500
}

module.exports = functions
