angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('quests-history', function($scope, $http, itemConstants, breadcrumb) {
	$scope.getQuest = function() {
		$scope.slots = itemConstants.slots;
		$http({
			url: '/php/quests/getQuestByHistoryId.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.quest = response.data;
			$scope.quest.ModifiedOn = (new Date(response.data.ModifiedOn + " UTC")).toString().slice(4, 24);
			$scope.quest.Stat = Boolean($scope.quest.Stat);
			$scope.quest.Id = $scope.quest.QuestId;

			breadcrumb.links = [{'display': 'Quests', 'href': '/quests/'},
								{'display': $scope.quest.AreaEra, 'href': '/quests/index.html?eraId=' + $scope.quest.EraId},
								{'display': $scope.quest.AreaName, 'href': '/quests/index.html?eraId=' + $scope.quest.EraId + '&areaId=' + $scope.quest.AreaId},
								{'display': $scope.quest.Title, 'href': '/quests/details.html?id=' + $scope.quest.Id},
								{'display': $scope.quest.ModifiedOn, 'href': '', 'active': true}];

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
			data: {"id": $scope.quest.QuestId}
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
			url: '/php/items/getItemsByQuestId.php',
			method: 'POST',
			data: {"QuestId": $scope.quest.QuestId}
		}).then(function successCallback(response) {
			$scope.items = response.data;
			for (var i = 0; i < $scope.items.length; ++i) {
				$scope.items[i].SlotName = $scope.slots[$scope.items[i].Slot];
			}
		}, function errorCallback(response) {

		});
	}

	$scope.revert = function() {
		var postData = angular.copy($scope.quest);
		delete postData.QuestId;
		delete postData.ModifiedOn;
		delete postData.ModifiedBy;
		delete postData.ModifiedByIP;
		delete postData.ModifiedByIPForward;
		$http({
			url: '/php/quests/updateQuest.php',
			method: 'POST',
			data: postData
		}).then(function succcessCallback(response) {
			window.location = "/quests/details.html?id=" + $scope.quest.QuestId;
		}, function errorCallback(response){

		});
	}

	$scope.initialize = function() {
		$http({
			url: '/php/login/getLoggedInUser.php'
		}).then(function succcessCallback(response) {
			$scope.isLoggedIn = response.data.success;
			$scope.getQuest();
		}, function errorCallback(response) {

		});
	}

	$scope.initialize();
});
