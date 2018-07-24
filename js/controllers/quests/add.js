angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('quests-add', function($scope, $http) {
	$scope.initialize = function() {
		$scope.questModel = {Content: "", Whoises: null, Stat: false};
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

	$scope.submitQuest = function() {
		$http({
			url: '/php/quests/insertQuest.php',
			method: 'POST',
			data: $scope.questModel
		}).then(function succcessCallback(response) {
			window.location = "/quests/details.html?id=" + response.data;
		}, function errorCallback(response){

		});
	}

	$scope.initialize();
});