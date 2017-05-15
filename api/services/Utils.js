module.exports = {
    removeEmptyObjects : function removeEmpty(obj) {
        Object.keys(obj).forEach(function(key) {
            (obj[key] && typeof obj[key] === 'object') && removeEmpty(obj[key]) ||
            (obj[key] === '' || obj[key] === null || Object.keys(obj[key]).length == 0) && delete obj[key]
        });
        return obj;
    }
}
