module.exports = {
  Object: {
    clean: function clean(obj) {
      for (var key in obj) {
        if (JSON.stringify(obj[key]) == "{}" || !obj[key]) {
          delete obj[key];
        } else if (typeof obj[key] == "object") {
          obj[key] = this.clean(obj[key]);
        }
      }
      return obj;
    }
  },

  isRuntimeVersionSupported() {
    const minRequiredNodeVersion = '8.0.0';
    const semver = require('semver');
    return semver.gte(process.versions.node, minRequiredNodeVersion);
  }
}
