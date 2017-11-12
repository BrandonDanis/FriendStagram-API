const statuses = require('statuses')
const util = require('./utils/util')

const codes = [200, 201, 202, 500]

class FSError extends Error {
  constructor ({code, title, status = '500'}, extraProps = {}) {
    super(title)
    this.code = code
    this.title = title
    this.status = status
    Object.keys(extraProps).forEach(key => {
      this[key] = extraProps[key]
    })
  }

  static userDoesNotExist ({title = 'User doesn\'t exist', status = '404'} = {}) {
    return new FSError({code: 'FS-ERR-1', title, status})
  }

  static missingParameters ({errors, status = '400'}) {
    errors[0] = util.capitalize(errors[0])
    return new FSError({code: 'FS-ERR-2', title: `${errors.join(', ')} is invalid`, status})
  }

  static fieldAlreadyExists ({title, status = '409'}) {
    return new FSError({code: 'FS-ERR-3', title, status})
  }

  static unauthorized ({title = 'Bad token', status = '401'} = {}) {
    return new FSError({code: 'FS-ERR-4', title, status})
  }

  static invalidPassword ({title = 'Invalid password', status = '403'} = {}) {
    return new FSError({code: 'FS-ERR-5', title, status})
  }

  static userIsNotLoggedIn ({title = 'User is not logged in', status = '412'} = {}) {
    return new FSError({code: 'FS-ERR-6', title, status})
  }

  static unknown ({title, status = '500'}) {
    return new FSError({code: 'FS-ERR-7', title, status})
  }
}

// Only created like this for code completion
// noinspection JSUnusedAssignment
let Response = {
  OK: sendFakeResponse,
  Created: sendFakeResponse,
  Accepted: sendFakeResponse,
  InternalServerError: sendFakeError
}
Response = statuses.codes.filter(code => codes.some(usedCode => code === usedCode)).map(code => {
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
    [functionName]: (res, data) => { res.status(code).json({data, error: {}}) }
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

module.exports = {Response, FSError}
