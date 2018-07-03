app.controller('mobsedit-controller', function($scope, $http) {
	$scope.initialize = function() {
		$scope.mobModel = {};
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
			$scope.initialMobModel = Object.assign({}, $scope.mobModel);
		}, function errorCallback(response){

		});
	}

	$scope.saveDisabled = function() {
		return !$scope.form.$valid || JSON.stringify($scope.mobModel) === JSON.stringify($scope.initialMobModel);
	}

	$scope.submitMob = function() {
		if (!$scope.form.$valid || JSON.stringify($scope.mobModel) === JSON.stringify($scope.initialMobModel)) {
			return;
		}

		var postData = Object.assign({}, $scope.mobModel);
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
