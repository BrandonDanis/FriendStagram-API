module.exports.isEmpty = str => (!str || str.length === 0)
module.exports.capitalize = str => str.slice(0, 1).toUpperCase() + str.slice(1)
module.exports.getMissingKeys = (obj, keys) => {
  const missing = []
  keys.forEach(key => {
    if (typeof key === 'string') {
      if (module.exports.isEmpty(obj[key])) {
        missing.push(key)
      }
    } else {
      const {key: keyName, name} = key
      if (module.exports.isEmpty(obj[keyName])) {
        missing.push(name)
      }
    }
  })
  return missing
}

if (!Array.prototype.isEmpty) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.isEmpty = function () {
    return this.length === 0
  }
}
