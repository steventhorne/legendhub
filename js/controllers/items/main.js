app.controller('items', function($scope, $cookies, $http, itemConstants) {
	$scope.init = function() {
		$scope.slots = itemConstants.slots;
		$scope.aligns = itemConstants.aligns;
		$scope.itemsPerPage = 20;

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

			$scope.totalPages = Math.floor(($scope.items.length - 1) / $scope.itemsPerPage) + 1;
			$scope.currentPage = 1;
			console.log($scope.totalPages);
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
			$scope.recent = false;

			$scope.totalPages = Math.floor(($scope.items.length - 1) / $scope.itemsPerPage) + 1;
			$scope.currentPage = 1;
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
		var cookieDate = new Date();
		cookieDate.setFullYear(cookieDate.getFullYear() + 20);

		$savedColumns = "";
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			if ($scope.statInfo[i]["showColumn"]) {
				$savedColumns += $scope.statInfo[i]["short"] + "-";
			}
		}
		$cookies.put("sc1", $savedColumns, {"path": "/", 'expires': cookieDate});
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

	$scope.onItemClicked = function(item) {
		window.location = "/items/details.html?id=" + item.Id;
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

	$scope.onColumnHeaderClicked = function(statVar) {

	}

	$scope.sortClass = function(statVar) {
		if ($scope.recent) {
			return "";
		}
	}

	$scope.listFilters = function() {
		if (!$scope.statInfo) {
			return "";
		}

		var filters = [];
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			if ($scope.statInfo[i].filter) {
				filters.push($scope.statInfo[i].display);
			}
		}

		if (filters.length == 0) {
			return "";
		}
		
		if (filters.length <= 5) {
			var msg = "The following filters are enabled: ";
			for (var j = 0; j < filters.length; ++j) {
				msg += filters[j];
				if (j < filters.length - 1) {
					msg += ", ";
				}
			}
			return msg;
		}
		else {
			return filters.length + " filters are enabled.";
		}
	}

	$scope.init();
});
