angular.module("legendwiki-app").requires.push('isteven-multi-select');
app.controller('items', function($scope, $cookies, $http, itemConstants, categories) {
	$scope.init = function() {
		$scope.slots = itemConstants.slots;
		$scope.aligns = itemConstants.aligns;
		$scope.shortAligns = itemConstants.shortAligns;
		
		$scope.itemsPerPage = 20;
		$scope.sortProperty = "";
		$scope.sortReverse = false;

		$scope.catService = categories;

		// set categories
		var slotCategories = [];
		for (var i = 0; i < $scope.slots.length; ++i) {
			slotCategories.push({"Id": i, "Name": $scope.slots[i]});
		}
		categories.setCategories(slotCategories);

		categories.setSelectedCategory(getUrlParameter('slotId'));
		$scope.searchString = getUrlParameter('search');

		$scope.statLoadCount = 0;
		$scope.getStatCategories();
		$scope.getStatInfo();

		$http({
			url: '/php/login/getLoggedInUser.php'
		}).then(function succcessCallback(response) {
			$scope.isLoggedIn = response.data.success;
		}, function errorCallback(response) {

		});
	}

	$scope.getStatCategories = function() {
		$http({
			url: '/php/items/getItemCategories.php'
		}).then(function succcessCallback(response) {
			$scope.statCategories = response.data;
			
			$scope.statLoadCount++;
			if ($scope.statLoadCount == 2) {
				$scope.onStatsLoaded();
			}
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
		}, function errorCallback(response){

		});
	}

	$scope.getStatInfo = function() {
		$http({
			url: '/php/items/getItemStats.php'
		}).then(function succcessCallback(response) {
			$scope.statInfo = response.data;

			$scope.statLoadCount++;
			if ($scope.statLoadCount == 2) {
				$scope.onStatsLoaded();
			}
		}, function errorCallback(response){
		});
	}

	$scope.onStatsLoaded = function() {
		$scope.availableFilters = [];
		$scope.filterOptions = [];
		$scope.filterModel = [];
		for (var i = 0; i < $scope.statCategories.length; ++i) {
			$scope.availableFilters.push({name: $scope.statCategories[i].name, msGroup: true});
			for (var j = 0; j < $scope.statCategories[i].stats.length; ++j) {
				var index = $scope.statCategories[i].stats[j];
				var optionObj = {id: index, name: $scope.statInfo[index].display, filterString: $scope.statInfo[index].filterString};
				$scope.availableFilters.push(optionObj);
				if ($scope.statInfo[index].filter) {
					$scope.filterModel.push(optionObj);
				}
			}
			$scope.availableFilters.push({msGroup: false});
		}
		
		$scope.filterSettings = {scrollableHeight: '250px', scrollable: true, enableSearch: true, groupBy: 'category', selectedToTop: true, buttonClasses: 'btn btn-outline-primary'};
		$scope.loadCookies();
		$scope.loadFiltersFromUrl();

		var filterOn = false;
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			if ($scope.statInfo[i]["filter"]) {
				filterOn = true;
				break;
			}
		}
		
		if (categories.hasSelectedCategory() || filterOn || $scope.searchString) {
			$scope.search();
		}
		else {
			$scope.getRecentItems();
		}
	}

	$scope.filterGroupBy = function(groupValue) {
		return groupValue;
	}
	
	$scope.search = function() {
		$http({
			url: '/php/items/getItems.php',
			method: 'POST',
			data: {"searchString": $scope.searchString, "filterColumns": $scope.filters, "slotId": categories.getCategoryId()}
		}).then(function succcessCallback(response) {
			$scope.items = response.data;
			$scope.recent = false;

			$scope.totalPages = Math.floor(($scope.items.length - 1) / $scope.itemsPerPage) + 1;
			$scope.currentPage = 1;
		}, function errorCallback(response){

		});
	}

	$scope.onSearchClicked = function() {
		window.location = $scope.getSearchUrl();
	}

	$scope.getSearchUrl = function(categoryId) {
		var url = "/items/index.html?";

		if (categoryId !== undefined) {
			url += "slotId=" + categoryId + "&";
		}
		else if (categories.hasSelectedCategory()) {
			url += "slotId=" + categories.getCategoryId() + "&";
		}
		
		var filtersUrl = $scope.saveFiltersToUrl();
		if (filtersUrl) {
			url += "filters=" + filtersUrl + "&";
		}

		url += "search=" + $scope.searchString;
		return url;
	}

	$scope.saveFiltersToUrl = function() {
		var url = "";
		if (!$scope.statInfo) {
			return;
		}
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			if ($scope.statInfo[i]["filter"]) {
				if (url) {
					url += ",";
				}
				url += $scope.statInfo[i]["var"];
			}
		}
		return url;
	}

	$scope.loadFiltersFromUrl = function() {
		var url = getUrlParameter("filters");
		$scope.filters = [];
		var urlParts = url.split(',');
		for (var i = 0; i < urlParts.length; ++i)
		{
			if (urlParts[i]) {
				for (var j = 0; j < $scope.statInfo.length; ++j) {
					if ($scope.statInfo[j]["var"] == urlParts[i]) {
						$scope.statInfo[j]["filter"] = true;
						$scope.filters.push(j);
					}
				}
			}
		}

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
		if ($scope.sortProperty == statVar) {
			$scope.sortReverse = !$scope.sortReverse;
		}
		else {
			$scope.sortProperty = statVar;
			$scope.sortReverse = true;
		}
	}

	$scope.sortClass = function(statVar) {
		if (!$scope.sortProperty) {
			return "fas fa-sort";
		}
		else if ($scope.sortProperty == statVar) {
			return $scope.sortReverse ? "fas fa-sort-down" : "fas fa-sort-up";
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

	getUrlParameter = function(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	$scope.init();
});
