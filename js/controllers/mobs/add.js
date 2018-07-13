angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('mobs-add', function($scope, $http) {
	$scope.initialize = function() {
		$scope.mobModel = {"Xp": 0, "Gold": 0, "Aggro": false, "Notes": null};
		$scope.areas = [];

		$scope.getAreas();
	}

	$scope.getAreas = function() {
		$http({
			url: '/php/mobs/getAreas.php',
		}).then(function successCallback(response) {
			$scope.areas = response.data;
		}, function errorCallback(response) {

		});
	}

	$scope.submitMob = function() {
		$http({
			url: '/php/mobs/insertMob.php',
			method: 'POST',
			data: $scope.mobModel
		}).then(function succcessCallback(response) {
			window.location = "/mobs/details.html?id=" + response.data;
		}, function errorCallback(response){

		});
	}

	$scope.initialize();
});
