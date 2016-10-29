var RemoteStorageService = function(adapter) {

    var self = this
    self.adapter = adapter

    self.loadConsumers = function(req,res) {
        return require('./adapters')[req.query.adapter].methods.loadConsumers(req,res)
    }
    return self
}

module.exports = RemoteStorageService
