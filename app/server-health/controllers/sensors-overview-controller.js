/**
 * Controller for sensors-overview
 *
 * @module app/serverHealth
 * @exports sensorsOverviewController
 * @name sensorsOverviewController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';
    angular
        .module('app.overview')
        .controller('sensorsOverviewController', [
            '$rootScope',
            '$scope',
            '$log',
            '$window',
            'APIUtils',
            'dataService',
            'Constants',
            function($rootScope, $scope, $log, $window, APIUtils, dataService, Constants){
                $scope.dataService = dataService;

                $scope.dropdown_selected = false;

                $scope.$log = $log;
                $scope.customSearch = "";
                $scope.searchTerms = [];
                $scope.messages = Constants.MESSAGES.SENSOR;
                $scope.selectedSeverity = {
                    all: true,
                    normal: false,
                    warning: false,
                    critical: false
                };
                $scope.export_name = "sensors.json";
                $scope.loading = false;
                $scope.jsonData = function(data){
                    var dt = {};
                    data.data.forEach(function(item){
                        dt[item.original_data.key] = item.original_data.value;
                    });
                    return JSON.stringify(dt);
                };

                $scope.clear = function(){
                    $scope.customSearch = "";
                    $scope.searchTerms = [];
                }

                $scope.doSearchOnEnter = function (event) {
                    var search = $scope.customSearch.replace(/^\s+/g,'').replace(/\s+$/g,'');
                    if (event.keyCode === 13 &&
                        search.length >= 2) {
                        $scope.searchTerms = $scope.customSearch.split(" ");
                    }else{
                        if(search.length == 0){
                            $scope.searchTerms = [];
                        }
                    }
                };

                $scope.doSearchOnClick = function() {
                    var search = $scope.customSearch.replace(/^\s+/g,'').replace(/\s+$/g,'');
                    if (search.length >= 2) {
                        $scope.searchTerms = $scope.customSearch.split(" ");
                    }else{
                        if(search.length == 0){
                            $scope.searchTerms = [];
                        }
                    }
                }

                $scope.toggleSeverityAll = function(){
                    $scope.selectedSeverity.all = !$scope.selectedSeverity.all;

                    if($scope.selectedSeverity.all){
                        $scope.selectedSeverity.warning = false;
                        $scope.selectedSeverity.critical = false;
                    }
                }

                $scope.toggleSeverity = function(severity){
                    $scope.selectedSeverity[severity] = !$scope.selectedSeverity[severity];

                   if(['warning', 'critical'].indexOf(severity) > -1){
                       if($scope.selectedSeverity[severity] == false &&
                          (!$scope.selectedSeverity.warning &&
                           !$scope.selectedSeverity.critical
                          )){
                           $scope.selectedSeverity.all = true;
                           return;
                       }
                   }

                    if($scope.selectedSeverity.warning &&
                       $scope.selectedSeverity.critical){
                        $scope.selectedSeverity.all = true;
                        $scope.selectedSeverity.warning = false;
                        $scope.selectedSeverity.critical = false;
                    }else{
                        $scope.selectedSeverity.all = false;
                    }
                }

                $scope.filterBySeverity = function(sensor){
                    if($scope.selectedSeverity.all) return true;

                    return( (sensor.severity_flags.normal && $scope.selectedSeverity.normal) ||
                            (sensor.severity_flags.warning && $scope.selectedSeverity.warning) ||
                            (sensor.severity_flags.critical && $scope.selectedSeverity.critical)
                    );
                }
                $scope.filterBySearchTerms = function(sensor){

                    if(!$scope.searchTerms.length) return true;

                    for(var i = 0, length = $scope.searchTerms.length; i < length; i++){
                        if(sensor.search_text.indexOf($scope.searchTerms[i].toLowerCase()) == -1) return false;
                    }
                    return true;
                }

                $scope.loadSensorData = function(){
                    $scope.loading = true;
                    APIUtils.getAllSensorStatus(function(data, originalData){
                        $scope.data = data;
                        $scope.originalData = originalData;
                        dataService.sensorData = data;
                        $scope.export_data = JSON.stringify(originalData);
                        $scope.loading = false;
                    });
                };

                $scope.loadSensorData();

                var refreshDataListener = $rootScope.$on('refresh-data', function(event, args) {
                    $scope.loadSensorData();
                });

                $scope.$on('$destroy', function() {
                    refreshDataListener();
                });
				$scope.update = function(sensor){
					//update esm attr, esm attr start with "esm"
					var i = 0;

					function delay(t) {
					   return new Promise(function(resolve) { 
					       setTimeout(resolve, t)
					   });
					}
					var _sensor = [];
					$scope.loading = true;
					for(var key in sensor.original_data.value){
						if(key.startsWith("Esm")){
							//check if value has changed 
							if(sensor[key] != sensor.original_data.value[key]){
								_sensor.push(Object.assign(
									{
										key : sensor.original_data.key,
										attr : key,
										value : sensor[key]
									}
								));
								/*
								i++;
								
								setTimeout(APIUtils.setSensorAttr
									, 1000 * i
									, function(res){
											console.log(res);
											i--;
										}
									, sensor.original_data.key
									, key
									, sensor[key])
								*/
								}
								
						}
					}

					//update value attr
					if(sensor["Value"] != sensor.original_data.value["Value"]){

						_sensor.push(Object.assign(
							{
								key : sensor.original_data.key,
								attr : "Value",
								value : sensor["Value"] * Math.pow(10, Math.abs(parseInt(sensor.Scale,10)))
							}
						));
						/*
						i++;
						
						setTimeout(APIUtils.setSensorAttr
							, 1000 * i
							, function(res){
								console.log(res);
								i--;
								}
							, sensor.original_data.key
							, "Value"
							, sensor["Value"] * Math.pow(10, Math.abs(parseInt(sensor.Scale,10)))
							)
							*/
						}
					console.log(_sensor)
					APIUtils.setSensorAttr2(
						function(res){
							console.log(res);
							$scope.loading = false;
							if(res != 0){
								sensor.fail_attr = res;
								sensor.dis_fail = true;
							}
							else {
								sensor.dis_succ = true;
							}
							}
						, _sensor)
                };
			$scope.fetch = function(sensor){
				$scope.loading = true;
				APIUtils.getSingleSensorStatus(
					function(res){
							console.log(res);
							$scope.loading = false;
							console.log(sensor)
							
							if(res != 0){
								sensor.fail_attr = res;
								sensor.fetch_fail = true;
							}
							else {
								sensor.fetch_fail = false;
							}
							}
						, sensor
				)
				}
            }
        ]
    );

})(angular);
