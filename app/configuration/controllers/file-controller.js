/**
 * Controller for file
 *
 * @module app/configuration
 * @exports fileController
 * @name fileController
 */

window.angular && (function(angular) {
  'use strict';

  angular
    .module('app.configuration')
    .controller('fileController', [
      '$scope',
      '$window',
      'APIUtils',
      'dataService',
      function($scope, $window, APIUtils, dataService) {
        $scope.dataService = dataService;
      }
    ]);

})(angular);
