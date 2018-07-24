app.controller('quests', function($scope, $cookies, $http) {
	$scope.init = function() {
		$scope.searchString = "";
		$scope.questsPerPage = 20;
		$scope.statOnly = false;

		$http({
			url: '/php/login/getLoggedInUser.php'
		}).then(function succcessCallback(response) {
			$scope.isLoggedIn = response.data.success;
			$scope.getRecentQuests();
		}, function errorCallback(response) {

		});
	}

	$scope.getRecentQuests = function() {
		$http({
			url: '/php/quests/getRecentQuests.php',
			method: 'POST'
		}).then(function succcessCallback(response) {
			$scope.quests = response.data;
			$scope.recent = true;

			$scope.totalPages = Math.floor(($scope.quests.length - 1) / $scope.questsPerPage) + 1;
			$scope.currentPage = 1;
		}, function errorCallback(response){

		});
	}

	$scope.search = function() {
		$scope.searchError = "";
		$scope.resultWarning = "";

		$http({
			url: '/php/quests/getQuests.php',
			method: 'POST',
			data: {"searchString": $scope.searchString, "statOnly": $scope.statOnly}
		}).then(function succcessCallback(response) {
			$scope.quests = response.data;
			$scope.recent = false;

			$scope.totalPages = Math.floor(($scope.quests.length - 1) / $scope.questsPerPage) + 1;
			$scope.currentPage = 1;
		}, function errorCallback(response){

		});
	}

	$scope.onPreviousClicked = function() {
		$scope.currentPage -= 1;
		if ($scope.currentPage < 1) {
			$scope.currentPage = 1;
		}
	}

	$scope.onNextClicked = function() {
		$scope.currentPage += 1;
		if ($scope.currentPage > $scope.totalPages) {
			$scope.currentPage = $scope.totalPages;
		}
	}

	$scope.onPageClicked = function(num) {
		$scope.currentPage = num;
	}

	$scope.onQuestClicked = function(item) {
		window.location = "/quests/details.html?id=" + item.Id;
	}

	$scope.onStatClicked = function() {
		$scope.statOnly = !$scope.statOnly;
	}

	$scope.getPageArray = function() {
		var nums = [];
		if ($scope.totalPages > 7) {
			var nums = [1];
			if ($scope.currentPage < 5) {
				nums.push(2, 3, 4, 5, 6);
			}
			else if ($scope.currentPage > $scope.totalPages - 3) {
				var digit = $scope.totalPages - 6;
				nums.push(++digit, ++digit, ++digit, ++digit, ++digit);
			}
			else {
				var digit = $scope.currentPage - 3;
				nums.push(++digit, ++digit, ++digit, ++digit, ++digit);
			}
			nums.push($scope.totalPages);
		}
		else {
			for (var i = 1; i <= $scope.totalPages; ++i) {
				nums.push(i);
			}
		}
		return nums;
	}

	$scope.init();
});
