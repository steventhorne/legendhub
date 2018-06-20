app.controller('items-controller', function($scope, $cookies, $http, itemConstants) {
	$scope.init = function() {
		$scope.slots = itemConstants.slots;
		$scope.aligns = itemConstants.aligns;

		$scope.searchString = "";

		$http({
			url: '/php/login/getLoggedInUser.php'
		}).then(function succcessCallback(response) {
			$scope.isLoggedIn = response.data.success;
			$scope.getStatCategories();
		}, function errorCallback(response) {

		});
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

	$scope.getRecentItems = function() {
		$http({
			url: '/php/items/getRecentItems.php',
			method: 'POST'
		}).then(function succcessCallback(response) {
			$scope.items = response.data;
			$scope.recent = true;
		}, function errorCallback(response){

		});
	}

	$scope.getStatInfo = function() {
		$http({
			url: '/php/items/getItemStats.php'
		}).then(function succcessCallback(response) {
			$scope.statInfo = response.data;

			$scope.loadCookies();
			$scope.getRecentItems();
		}, function errorCallback(response){
		});
	}
	
	$scope.search = function() {
		$scope.searchError = "";
		$scope.resultWarning = "";

		filterColumns = [];
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			if ($scope.statInfo[i]["filter"]) {
				filterColumns.push(i);
			}
		}
		if ($scope.searchString.length < 3 && filterColumns.length == 0) {
			$scope.searchError = "You must use at least 3 characters in your search, or use a filter.";
			return;
		}

		$http({
			url: '/php/items/getItems.php',
			method: 'POST',
			data: {"searchString": $scope.searchString, "filterColumns": filterColumns}
		}).then(function succcessCallback(response) {
			$scope.items = response.data;
			if ($scope.items.length > 50) {
				$scope.items = $scope.items.slice(0, 50);
				$scope.resultWarning = "Results limited to 50. Refine your search to see the other options";
			}
			$scope.recent = false;
		}, function errorCallback(response){

		});
	}

	$scope.loadCookies = function() {
		var columnCookie = $cookies.get("sc1");
		if (columnCookie) {
			// wipe initial values
			for (var i = 0; i < $scope.statInfo.length; ++i) {
				$scope.statInfo[i]["showColumn"] = false;
			}

			var columns = columnCookie.split("-");
			for (var i = 0; i < columns.length; ++i) {
				for (var j = 0; j < $scope.statInfo.length; ++j) {
					if (columns[i] == $scope.statInfo[j]["short"]) {
						$scope.statInfo[j]["showColumn"] = true;
					}
				}
			}
		}
	}
	$scope.saveCookies = function() {
		$savedColumns = "";
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			if ($scope.statInfo[i]["showColumn"]) {
				$savedColumns += $scope.statInfo[i]["short"] + "-";
			}
		}
		$cookies.put("sc1", $savedColumns);
	}

	$scope.init();
});
