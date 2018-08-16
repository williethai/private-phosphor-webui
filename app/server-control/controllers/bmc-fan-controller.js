/**
 * Controller for bmc-fan
 *
 * @module app/serverControl
 * @exports bmcFanController
 * @name bmcFanController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.serverControl')
        .controller('bmcFanController', [
            '$scope', 
            '$window', 
            'APIUtils', 
            'dataService',
            function($scope, $window, APIUtils, dataService){
                $scope.dataService = dataService;
                $scope.controlFan = function(fan, speed){
					console.log(fan);
					console.log(speed);
					APIUtils.fanControl(function(response){
                        //@NOTE: using common event to reload server status, may be a better event listener name?
                        //$scope.$emit('user-logged-in',{});
                    }, fan, speed);
				};
            }
        ]
    );

})(angular);
//, $scope.psu0_fan_pwm, $scope.psu1_fan_pwm