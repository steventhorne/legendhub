angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('items-details', function($scope, $http, itemConstants, breadcrumb) {
	$scope.slots = itemConstants.selectOptions.Slot;
	$scope.aligns = itemConstants.selectOptions.AlignRestriction;
    $scope.selectShortOptions = itemConstants.selectShortOptions;

	$scope.getItem = function() {
		$http({
			url: '/php/items/getItem.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.item = response.data;
			$scope.item.ModifiedOn = (new Date(response.data.ModifiedOn + " UTC")).toString().slice(4, 24);

			breadcrumb.links = [{'display': 'Items', 'href': '/items/'},
								{'display': $scope.slots[$scope.item.Slot], 'href': '/items/index.html?slotId=' + $scope.item.Slot},
								{'display': $scope.item.Name, 'href': '', 'active': true}];

			$scope.getItemHistory();
		}, function errorCallback(response){

		});
	}

	$scope.getItemHistory = function() {
		$http({
			url: '/php/items/getItemHistory.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.history = response.data;
			var i;
			for (i = 0; i < $scope.history.length; i++) {
				$scope.history[i].ModifiedOn = (new Date($scope.history[i].ModifiedOn + " UTC")).toString().slice(4, 24);
			}
			$scope.getMob();
			$scope.getQuest();
		}, function errorCallback(response){

		});
	}

	$scope.getMob = function() {
		if ($scope.item.MobId && $scope.item.MobId >= 0) {
			$http({
				url: '/php/mobs/getMob.php',
				method: 'POST',
				data: {"id": $scope.item.MobId}
			}).then(function successCallback(response) {
				$scope.mob = response.data;
			}, function errorCallback(response){

			});
		}
	}

	$scope.getQuest = function() {
		if ($scope.item.QuestId && $scope.item.QuestId >= 0) {
			$http({
				url: '/php/quests/getQuest.php',
				method: 'POST',
				data: {"id": $scope.item.QuestId}
			}).then(function successCallback(response) {
				$scope.quest = response.data;
			}, function errorCallback(response){

			});
		}
	}

	getUrlParameter = function(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	$scope.init = function() {
		$http({
			url: '/php/login/getLoggedInUser.php'
		}).then(function succcessCallback(response) {
			$scope.isLoggedIn = response.data.success;
			$scope.getStatInfo();
		}, function errorCallback(response) {

		});
		$scope.getStatCategories();
	}

    $scope.getStatCategories = function() {
		$http({
			url: '/php/items/getItemCategories.php'
		}).then(function succcessCallback(response) {
			$scope.statCategories = response.data;

			$scope.getStatInfo();
		}, function errorCallback(response){

		});
    }

	$scope.getStatInfo = function() {
		$http({
			url: '/php/items/getItemStats.php'
		}).then(function succcessCallback(response) {
			$scope.statInfo = response.data;

			$scope.getItem();
		}, function errorCallback(response){
		});
	}

	$scope.showStat = function(item, stat) {
        if (stat == undefined ||
            stat['var'] === "Slot" ||
            stat['var'] === "Name" ||
            stat['var'] === "AlignRestriction" ||
            stat['var'] === "Strength" ||
            stat['var'] === "Mind" ||
            stat['var'] === "Dexterity" ||
            stat['var'] === "Constitution" ||
            stat['var'] === "Perception" ||
            stat['var'] === "Spirit" ||
            stat['var'] === "Ac" ||
            stat['var'] === "Value" ||
            stat['var'] === "UniqueWear" ||
            stat['var'] === "Rent" ||
            stat['var'] === "NetStat") {
            return false;
        }

		if (stat['type'] === 'int' || stat['type'] == 'bool') {
			return item != 0;
		}

		if (stat['type'] === 'string') {
			return item != '' && item != null;
		}

        if (stat['type'] === 'select') {
            return item != null && item >= 0;
        }

		return false;
	}

	$scope.init();
});
