angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('mobs-history', function($scope, $http, itemConstants, breadcrumb) {
	$scope.getMob = function() {
		$scope.slots = itemConstants.slots;
		$http({
			url: '/php/mobs/getMobByHistoryId.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.mob = response.data;
			$scope.mob.ModifiedOn = (new Date(response.data.ModifiedOn + " UTC")).toString().slice(4, 24);
			$scope.mob.Id = $scope.mob.MobId;

			breadcrumb.links = [{'display': 'Mobs', 'href': '/mobs/'},
								{'display': $scope.mob.AreaEra, 'href': '/mobs/index.html?eraId=' + $scope.mob.EraId},
								{'display': $scope.mob.AreaName, 'href': '/mobs/index.html?eraId=' + $scope.mob.EraId + '&areaId=' + $scope.mob.AreaId},
								{'display': $scope.mob.Name, 'href': '/mobs/details.html?id=' + $scope.mob.Id},
								{'display': $scope.mob.ModifiedOn, 'href': '', 'active': true}];

			$scope.getMobHistory();
		}, function errorCallback(response){

		});
	}

	$scope.getMobHistory = function() {
		$http({
			url: '/php/mobs/getMobHistory.php',
			method: 'POST',
			data: {"id": $scope.mob.MobId}
		}).then(function succcessCallback(response) {
			$scope.history = response.data.slice(0, 9);
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
			data: {"MobId": $scope.mob.MobId}
		}).then(function successCallback(response) {
			$scope.items = response.data;
			for (var i = 0; i < $scope.items.length; ++i) {
				$scope.items[i].SlotName = $scope.slots[$scope.items[i].Slot];
			}
		}, function errorCallback(response) {

		});
	}

	$scope.revert = function() {
		var postData = angular.copy($scope.mob);
		delete postData.MobId;
		delete postData.ModifiedOn;
		delete postData.ModifiedBy;
		delete postData.ModifiedByIP;
		delete postData.ModifiedByIPForward;
		$http({
			url: '/php/mobs/updateMob.php',
			method: 'POST',
			data: postData
		}).then(function succcessCallback(response) {
			window.location = "/mobs/details.html?id=" + $scope.mob.MobId;
		}, function errorCallback(response){

		});
	}

	getUrlParameter = function(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	$scope.initialize = function() {
		$http({
			url: '/php/login/getLoggedInUser.php'
		}).then(function succcessCallback(response) {
			$scope.isLoggedIn = response.data.success;
			$scope.getMob();
		}, function errorCallback(response) {

		});
	}

	$scope.initialize();
});
