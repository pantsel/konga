var RemoteStorageService = {
    loadConsumers : function(req,res) {
        return require('./adapters')[req.body.adapter].methods.loadConsumers(req,res);
    }
}
module.exports = RemoteStorageService
