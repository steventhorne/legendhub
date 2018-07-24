angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('quests-details', function($scope, $http, itemConstants) {
	$scope.initialize = function() {
		$scope.slots = itemConstants.slots;

		$http({
			url: '/php/login/getLoggedInUser.php'
		}).then(function succcessCallback(response) {
			$scope.isLoggedIn = response.data.success;
			$scope.getQuest();
		}, function errorCallback(response) {

		});
	}

	$scope.getQuest = function() {
		$http({
			url: '/php/quests/getQuest.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.quest = response.data;
			$scope.quest.ModifiedOn = (new Date(response.data.ModifiedOn + " UTC")).toString().slice(4, 24);
			$scope.quest.Stat = Boolean($scope.quest.Stat);
			$scope.getQuestHistory();
			$scope.splitWhoises();
		}, function errorCallback(response){

		});
	}

	$scope.splitWhoises = function() {
		$scope.whoises = $scope.quest.Whoises.split(';');
	}

	$scope.getQuestHistory = function() {
		$http({
			url: '/php/quests/getQuestHistory.php',
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
			url: '/php/items/getItemsByQuestId.php',
			method: 'POST',
			data: {"QuestId": getUrlParameter("id")}
		}).then(function successCallback(response) {
			$scope.items = response.data;
			for (var i = 0; i < $scope.items.length; ++i) {
				$scope.items[i].SlotName = $scope.slots[$scope.items[i].Slot];
			}
		}, function errorCallback(response) {

		});
	}

	getUrlParameter = function(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	$scope.initialize();
});