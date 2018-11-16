angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('mobs-details', function($scope, $http, itemConstants, breadcrumb) {
	$scope.initialize = function() {
		$scope.slots = itemConstants.slots;

		$http({
			url: '/php/login/getLoggedInUser.php'
		}).then(function succcessCallback(response) {
			$scope.isLoggedIn = response.data.success;
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
			$scope.mob = response.data;
			$scope.mob.ModifiedOn = (new Date(response.data.ModifiedOn + " UTC")).toString().slice(4, 24);

			breadcrumb.links = [{'display': 'Mobs', 'href': '/mobs/'},
								{'display': $scope.mob.AreaEra, 'href': '/mobs/index.html?eraId=' + $scope.mob.EraId},
								{'display': $scope.mob.AreaName, 'href': '/mobs/index.html?eraId=' + $scope.mob.EraId + '&areaId=' + $scope.mob.AreaId},
								{'display': $scope.mob.Name, 'href': '', 'active': true}];

			$scope.getMobHistory();
		}, function errorCallback(response){

		});
	}

	$scope.getMobHistory = function() {
		$http({
			url: '/php/mobs/getMobHistory.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.history = response.data;
			var i;
			for (i = 0; i < $scope.history.length; i++) {
				$scope.history[i].ModifiedOn = (new Date($scope.history[i].ModifiedOn + " UTC")).toString().slice(4, 24);
			}
			$scope.getItems();
		}, function errorCallback(response){

		});
	}

	$scope.getItems = function() {
		$http({
			url: '/php/items/getItemsByMobId.php',
			method: 'POST',
			data: {"MobId": getUrlParameter("id")}
		}).then(function successCallback(response) {
			$scope.items = response.data;
			for (var i = 0; i < $scope.items.length; ++i) {
				$scope.items[i].SlotName = $scope.slots[$scope.items[i].Slot];
			}
		}, function errorCallback(response) {

		});
	}

	$scope.initialize();
});
