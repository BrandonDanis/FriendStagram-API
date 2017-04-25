module.exports.isEmpty = (str) => {
    return (!str || 0 === str.length)
}
if (!Array.prototype.isEmpty) {
    Array.prototype.isEmpty = function () {
        return this.length === 0
    }
}
module.exports.capitalize = (str) => str.slice(0, 1).toUpperCase() + str.slice(1);
