const statuses = require('statuses')
const util = require('./utils/util')

const codes = [200, 201, 202]

class FSError extends Error {
  constructor ({code, title, detail = '', status = '500'}, extraProps = {}) {
    super(detail === '' ? title : detail)
    this.code = code
    this.title = title
    this.status = status
    this.detail = detail
    Object.keys(extraProps).forEach(key => {
      this[key] = extraProps[key]
    })
  }

  static unknown () {
    return new FSError({code: 'FS-ERR-0', title: 'An error occurred'})
  }

  static userDoesNotExist ({detail = '', status = '404'} = {}) {
    return new FSError({code: 'FS-ERR-1', title: 'User doesn\'t exist', detail, status})
  }

  static missingParameters ({errors, status = '400'}) {
    errors[0] = util.capitalize(errors[0])
    return new FSError({code: 'FS-ERR-2', title: 'Missing parameters', detail: `${errors.join(', ')} is invalid`, status})
  }

  static fieldAlreadyExists ({detail, status = '409'}) {
    return new FSError({code: 'FS-ERR-3', title: 'Field already exists', detail, status})
  }

  static unauthorized ({detail = '', status = '401'} = {}) {
    return new FSError({code: 'FS-ERR-4', title: 'Bad token', detail, status})
  }

  static invalidPassword ({status = '403'} = {}) {
    return new FSError({code: 'FS-ERR-5', title: 'Invalid password', status})
  }

  static userIsNotLoggedIn ({status = '412'} = {}) {
    return new FSError({code: 'FS-ERR-6', title: 'User is not logged in', status})
  }
}

// Only created like this for code completion
let Response = {
  OK: sendFakeResponse,
  Created: sendFakeResponse,
  Accepted: sendFakeResponse
}
Response = statuses.codes.filter(code => codes.some(usedCode => code === usedCode)).map(code => {
  // Generates each function
  const functionName = statuses[code].replace(/[^a-zA-Z]/g, '')
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

module.exports = {Response, FSError}
