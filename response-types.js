class Response {
  constructor (data, meta = undefined) {
    this.data = data
    this.errors = []
    if (!!meta)
      this.meta = meta
  }
}

class Error {
  constructor(title) {
    this.title = title
  }
}

class ErrorResponse extends Response {
  /**
   * Generates error response
   * @param {Error[]} errors
   * @param {Object?} meta
   */
  constructor (errors, meta = undefined) {
    super(null, meta)
    this.errors = errors
  }
}

module.exports = {Response, Error, ErrorResponse}