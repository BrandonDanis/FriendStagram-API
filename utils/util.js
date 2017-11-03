module.exports.isEmpty = str => (!str || str.length === 0)
if (!Array.prototype.isEmpty) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.isEmpty = function () {
    return this.length === 0
  }
}
module.exports.capitalize = str => str.slice(0, 1).toUpperCase() + str.slice(1)
