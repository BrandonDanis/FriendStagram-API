module.exports.isEmpty = (str) => {
    return (!str || 0 === str.length);
}
if (!Array.prototype.isEmpty) {
    Array.prototype.isEmpty = function () {
        return this.length === 0
    }
}
