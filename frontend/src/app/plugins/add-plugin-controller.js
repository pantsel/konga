/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.plugins')
    .controller('AddPluginController', [
        '_','$scope','$rootScope','$log','$state',
        'MessageService','ConsumerModel','SocketHelperService',
        'KongPluginsService','$uibModalInstance','PluginsService','_pluginName','_schema',
      function controller(_,$scope,$rootScope,$log,$state,
                          MessageService,ConsumerModel,SocketHelperService,
                          KongPluginsService,$uibModalInstance,PluginsService,_pluginName,_schema ) {

          //var pluginOptions = new KongPluginsService().pluginOptions()
          var options = new KongPluginsService().pluginOptions(_pluginName)

          $scope.schema = _schema.data
          $scope.pluginName = _pluginName
          $log.debug("Schema",$scope.schema)
          //$log.debug("Options", options)
          $scope.close = close

          $scope.humanizeLabel = function(key) {
              return key.split("_").join(" ")
          }




          // Monkey patch to help with transition
          // of using plugin schema directly from kong
          $scope.data = _.merge(options.fields,$scope.schema)
          $scope.description = $scope.data.meta ? $scope.data.meta.description : 'Configure the Plugin according to your specifications and add it to the API'

          function assignValues(fields,prefix) {
              Object.keys(fields).forEach(function (item) {

                  if(fields[item].schema) {
                      assignValues(fields[item].schema.fields,item)
                  }else{
                      var path = prefix ? prefix + "." + item : item;
                      var value = fields[item].default
                      if (fields[item].type === 'array'
                          && value !== null && typeof value === 'object' && !Object.keys(value).length) {
                          value = []
                      }
                      fields[item].value = value
                      var field_meta = _.get(options,path)
                      fields[item].help = field_meta ? field_meta.help : ''
                  }
              })
          }

          assignValues($scope.data.fields);


          $scope.addPlugin = function(back) {

              $scope.busy = true;

              var data = {
                  name : _pluginName
              }

              if($scope.data.consumer instanceof Object) {
                  data.consumer_id = $scope.data.consumer.id
              }

              function createConfig(fields,prefix) {

                  Object.keys(fields).forEach(function (key) {
                      if(fields[key].schema) {
                          createConfig(fields[key].schema.fields,key)
                      }else{
                          var path = prefix ? prefix + "." + key : key;
                          if (fields[key].value instanceof Array) {
                              // Transform to comma separated string
                              data['config.' + path] = fields[key].value.join(",")
                          } else {
                              data['config.' + path] = fields[key].value
                          }
                      }
                  })
              }

              createConfig($scope.data.fields);

              $log.debug("POST DATA =>",data)

              PluginsService.add(data)
                  .then(function(res){
                      $log.debug("create plugin",res)
                      $scope.busy = false;
                      $rootScope.$broadcast('plugin.added',res.data)
                      MessageService.success('Plugin added successfully!')
                      $uibModalInstance.dismiss()
                      if(back) {
                          $state.go('plugins')
                      }
                  }).catch(function(err){
                  $scope.busy = false;
                  $log.error("create plugin",err)
                  var errors = {}
                  Object.keys(err.data.customMessage).forEach(function(key){
                      errors[key.replace('config.','')] = err.data.customMessage[key]
                  })
                  $scope.errors = errors
              })
          }



          // Add the consumers to the plugin options
          $scope.getConsumer = function(val) {

              // Initialize filters
              $scope.filters = {
                  searchWord: val || '',
                  columns: ['username','custom_id']
              };

              var commonParameters = {
                  where: SocketHelperService.getWhere($scope.filters)
              };

              return ConsumerModel
                  .load(_.merge({}, commonParameters, {}))
                  .then(function(response){
                      return response.map(function(item){
                          return item;
                      });
                  });
          };

          function close() {
              $uibModalInstance.dismiss()
          }
      }
    ]);
}());
