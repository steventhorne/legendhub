angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('quests-edit', function($scope, $http, breadcrumb) {
	$scope.initialize = function() {
		$scope.questModel = {Content: "", Whoises: null};
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
			$scope.questModel = response.data;
			$scope.questModel.Aggro = Boolean($scope.questModel.Aggro);
			$scope.initialQuestModel = Object.assign({}, $scope.questModel);

			breadcrumb.links = [{'display': 'Quests', 'href': '/quests/'},
								{'display': $scope.questModel.AreaEra, 'href': '/quests/index.html?eraId=' + $scope.questModel.EraId},
								{'display': $scope.questModel.AreaName, 'href': '/quests/index.html?eraId=' + $scope.questModel.EraId + '&areaId=' + $scope.questModel.AreaId},
								{'display': $scope.questModel.Title, 'href': '/quests/details.html?id=' + $scope.questModel.Id},
								{'display': 'Edit', 'href': '', 'active': true}];
		}, function errorCallback(response){

		});
	}

	$scope.saveDisabled = function() {
		return !$scope.form.$valid || JSON.stringify($scope.questModel) === JSON.stringify($scope.initialQuestModel);
	}

	$scope.submitQuest = function() {
		if (!$scope.form.$valid || JSON.stringify($scope.questModel) === JSON.stringify($scope.initialQuestModel)) {
			return;
		}

		var postData = Object.assign({}, $scope.questModel);
		$http({
			url: '/php/quests/updateQuest.php',
			method: 'POST',
			data: postData
		}).then(function succcessCallback(response) {
			window.location = "/quests/details.html?id=" + $scope.questModel.Id;
		}, function errorCallback(response){

		});
	}

	$scope.initialize();
});
