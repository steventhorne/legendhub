angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('mobs-edit', function($scope, $http, breadcrumb) {
	$scope.initialize = function() {
		$scope.mobModel = {"Xp": 0, "Gold": 0, "Aggro": false, "Notes": null};
		$scope.areas = [];
		
		$scope.getAreas();
	}

	getUrlParameter = function(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	$scope.getAreas = function() {
		$http({
			url: '/php/mobs/getAreas.php'
		}).then(function successCallback(response) {
			$scope.areas = response.data;
			$scope.getMob();
		}, function errorCallback(response) {

		});
	}

	$scope.getMob = function() {
		$http({
			url: '/php/mobs/getMob.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.mobModel = response.data;
			$scope.mobModel.Aggro = Boolean($scope.mobModel.Aggro);
			$scope.initialMobModel = angular.copy($scope.mobModel);

			breadcrumb.links = [{'display': 'Mobs', 'href': '/mobs/'},
								{'display': $scope.mobModel.AreaEra, 'href': '/mobs/index.html?eraId=' + $scope.mobModel.EraId},
								{'display': $scope.mobModel.AreaName, 'href': '/mobs/index.html?eraId=' + $scope.mobModel.EraId + '&areaId=' + $scope.mobModel.AreaId},
								{'display': $scope.mobModel.Name, 'href': '/mobs/details.html?id=' + $scope.mobModel.Id},
								{'display': 'Edit', 'href': '', 'active': true}];
		}, function errorCallback(response){

		});
	}

	$scope.saveDisabled = function() {
		return !$scope.form.$valid || angular.toJson($scope.mobModel) === angular.toJson($scope.initialMobModel);
	}

	$scope.submitMob = function() {
		if (!$scope.form.$valid || angular.toJson($scope.mobModel) === angular.toJson($scope.initialMobModel)) {
			return;
		}

		var postData = angular.copy($scope.mobModel);
		$http({
			url: '/php/mobs/updateMob.php',
			method: 'POST',
			data: postData
		}).then(function succcessCallback(response) {
			window.location = "/mobs/details.html?id=" + $scope.mobModel.Id;
		}, function errorCallback(response){

		});
	}

	$scope.initialize();
});
