app.controller('items', ["$scope", "$q", "$cookies", "$http", "itemConstants", function($scope, $q, $cookies, $http, itemConstants) {
    /** Initializes the controller. */
	$scope.init = function() {
		$scope.slots = itemConstants.selectShortOptions.Slot;
		$scope.aligns = itemConstants.selectOptions.AlignRestriction;
		$scope.shortAligns = itemConstants.selectShortOptions.AlignRestriction;
        $scope.selectShortOptions = itemConstants.selectShortOptions;

		$scope.itemsPerPage = 20;
		$scope.sortProperty = "";
		$scope.sortReverse = false;

		$scope.searchString = getUrlParameter('search');

        loadPage();
	};

    /** Calls the async functions needed before displaying the page. */
    var loadPage = function() {
        $q.all([getStatCategoriesAsync(), getStatInfoAsync()]).then(
            function(data) {
                $scope.statCategories = data[0];

                $scope.statInfo = data[1];
			    $scope.defaultStatInfo = angular.copy(data[1]);

                loadCookies();
                loadFiltersFromUrl();

                onPageLoaded();
            }
        );
    };

    /**
     * Gets the stat category information from the server.
     *
     * @return {Promise} a promise containing the category info.
     */
    var getStatCategoriesAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItemCategories.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Gets the stat information from the server.
     *
     * @return {Promise} a promise containing the stat info.
     */
    var getStatInfoAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItemStats.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /** Event called when the page info is loaded. */
    var onPageLoaded = function() {
		if (isSearchFiltered() || $scope.searchString) {
            searchAsync($scope.searchString, $scope.filters).then(
                function(data) {
                    $scope.items = data;
                    $scope.recent = false;

                    $scope.totalPages = Math.floor((data.length - 1) / $scope.itemsPerPage) + 1;
                    $scope.currentPage = 1;
                }
            );
		}
		else {
            getRecentItemsAsync().then(
                function(data) {
                    $scope.items = data;
                    $scope.recent = true;

                    $scope.totalPages = Math.floor((data.length - 1) / $scope.itemsPerPage) + 1;
                    $scope.currentPage = 1;
                }
            );
		}
	};

    /*
     * Checks if a filter is enabled.
     *
     * @param {string} statInfo - the variable name of the stat to check against.
     * @return {bool} true if the filter is enabled for the given stat.
     */
    var isFilterEnabled = function(statInfo) {
        if (statInfo.type === "select") {
            return statInfo.filter !== "" && statInfo.filter >= 0;
        }
        else {
            return statInfo.filter;
        }

        return false;
    };

    /*
     * Checks if the search has any filters enabled.
     *
     * @return {bool} true if filters are enabled for any stats.
     */
    var isSearchFiltered = function() {
		for (var i = 0; i < $scope.statInfo.length; ++i) {
            if (isFilterEnabled($scope.statInfo[i])) {
                return true;
			}
		}
        return false;
    };

    /**
     * Gets the most recently updated items from the database.
     *
     * @return {Promise} a promise containing the item array.
     */
    var getRecentItemsAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getRecentItems.php',
			method: 'POST'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Gets the items based on the search input and filters.
     *
     * @param {string} searchString - the search input from the user.
     * @param {Array} filters - the enabled filters from the url.
     * @return {Promise} a promise containing the item array.
     */
	var searchAsync = function(searchString, filters) {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItems.php',
			method: 'POST',
			data: {"searchString": searchString, "filterColumns": filters}
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);


		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /** Navigates to the items index page with the url query for the search. */
	$scope.onSearchClicked = function() {
		window.location = getSearchUrl($scope.searchString, $scope.statInfo);
	};

    /**
     * Gets the search url given the search input and filters.
     *
     * @param {string} searchString - the search input from the user.
     * @param {Array} statInfo - the array of stat information.
     * @return {string} the url with the query parameters for the search.
     */
	var getSearchUrl = function(searchString, statInfo) {
		var url = "/items/index.html?";

		var filtersUrl = getURLFormattedFilters(statInfo);
		if (filtersUrl) {
			url += "filters=" + filtersUrl + "&";
		}

		url += "search=" + searchString;
		return url;
	};

    /*
     * Gets the URL format for the enabled filters.
     *
     * @param {Array} statInfo - the array of stat information.
     * @return {string} the URL formatted string.
     */
	var getURLFormattedFilters = function(statInfo) {
		var url = "";

		if (!statInfo) {
			return;
		}

		for (var i = 0; i < statInfo.length; ++i) {
            if (isFilterEnabled(statInfo[i])) {
				if (url) {
					url += ",";
				}
				url += statInfo[i]["var"];
                if (statInfo[i]["type"] === "select") {
                   url += "_" + statInfo[i]["filter"];
                }
			}
		}

		return url;
	};

    /** Loads the enabled filters from the url into the statInfo array and enabled filters. */
	var loadFiltersFromUrl = function() {
		var url = getUrlParameter("filters");
		$scope.filters = [];
		var urlParts = url.split(',');
		for (var i = 0; i < urlParts.length; ++i)
		{
			if (urlParts[i]) {
				for (var j = 0; j < $scope.statInfo.length; ++j) {
                    var filterData = urlParts[i].split('_');
					if ($scope.statInfo[j]["var"] == filterData[0]) {
                        if ($scope.statInfo[j]["type"] === "select") {
						    $scope.statInfo[j]["filter"] = Number(filterData[1]);
                        }
                        else {
                            $scope.statInfo[j]["filter"] = true;
                        }
                        var filterStr = j;
                        for (var k = 1; k < filterData.length; ++k) {
                            filterStr += "_" + filterData[k];
                        }
						$scope.filters.push(filterStr);
					}
				}
			}
		}
	};

    /** Loads the user's client-side saved data. */
	var loadCookies = function() {
		// delete old cookies
		$cookies.remove("sc1", {"path": "/"});

		// load new cookies
		if ($cookies.get("cookie-consent")) {
			var columnCookie = $cookies.get("sc2");
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
	};

    /** Saves the user's client-side saved data. */
	$scope.saveCookies = function() {
		var cookieDate = new Date();
		cookieDate.setFullYear(cookieDate.getFullYear() + 20);

		$savedColumns = "";
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			if ($scope.statInfo[i]["showColumn"]) {
				$savedColumns += $scope.statInfo[i]["short"] + "-";
			}
		}
		if ($cookies.get("cookie-consent")) {
			$cookies.put("sc2", $savedColumns, {"path": "/", 'expires': cookieDate});
		}
	};

    /** Event for when the previous button is clicked in the pagination. */
	$scope.onPreviousClicked = function() {
		$scope.currentPage -= 1;
		if ($scope.currentPage < 1) {
			$scope.currentPage = 1;
		}
	};

    /** Event for when the next button is clicked in the pagination. */
	$scope.onNextClicked = function() {
		$scope.currentPage += 1;
		if ($scope.currentPage > $scope.totalPages) {
			$scope.currentPage = $scope.totalPages;
		}
	};

    /**
     * Event for when a specific page is clicked in the pagination.
     *
     * @param {int} num - the page number that was clicked.
     */
	$scope.onPageClicked = function(num) {
		$scope.currentPage = num;
	};

    /**
     * Event for when an item is clicked in the search result table.
     *
     * @param {object} item - the item that was clicked.
     */
	$scope.onItemClicked = function(item) {
		window.location = "/items/details.html?id=" + item.Id;
	};

    /**
     * Gets an array of numbers to display in the pagination.
     *
     * @return {Array} an array of integers for each page button.
     */
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
	};

    /**
     * Event for when a column header is clicked for sorting.
     *
     * @param {string} statVar - the variable name of the stat that was clicked.
     */
	$scope.onColumnHeaderClicked = function(statVar) {
		if ($scope.sortProperty == statVar) {
			$scope.sortReverse = !$scope.sortReverse;
		}
		else {
			$scope.sortProperty = statVar;
			$scope.sortReverse = true;
		}
	};

    /**
     * Gets the HTML class for the sort icon.
     *
     * @param {string} statVar - the variable name of the stat to retrive the HTML class for.
     * @return {string} the HTML class for the sort icon that should be displayed.
     */
	$scope.getSortClass = function(statVar) {
		if (!$scope.sortProperty) {
			return "fas fa-sort";
		}
		else if ($scope.sortProperty == statVar) {
			return $scope.sortReverse ? "fas fa-sort-down" : "fas fa-sort-up";
		}
	};

    /** Resets the enabled/disabled columns back to the defaults. */
	$scope.resetColumns = function() {
        for (var i = 0; i < $scope.defaultStatInfo.length; ++i) {
			for (var j = 0; j < $scope.statInfo.length; ++j) {
                if ($scope.defaultStatInfo[i].var === $scope.statInfo[j].var) {
				    $scope.statInfo[j].showColumn = $scope.defaultStatInfo[i].showColumn;
                    break;
                }
			}
		}

        $scope.saveCookies();
	};

    /**
     * Gets a list of currently selected filters.
     * Not just the filters that were selected when the page loaded.
     *
     * @return {Array} an array of stat information for each currently enabled filter.
     */
	$scope.getFilterList = function() {
		if (!$scope.statInfo) {
			return [];
		}

		var filters = [];
		for (var i = 0; i < $scope.statInfo.length; ++i) {
            if (isFilterEnabled($scope.statInfo[i])) {
				filters.push($scope.statInfo[i]);
            }
		}

		return filters;
	}

    /**
     * Gets a count of currently selected filters.
     * Not just the filters that were selected when the page loaded.
     *
     * @return {Array} an array of stat information for each currently enabled filter.
     */
	$scope.getFilterCount = function() {
		if (!$scope.statInfo) {
			return 0;
		}

		var count = 0;
		for (var i = 0; i < $scope.statInfo.length; ++i) {
            if (isFilterEnabled($scope.statInfo[i])) {
				count++;
            }
		}

		return count;
	};

    /**
     * Removes the filter for a specified stat.
     *
     * @param {object} statInfo - the variable name of the stat you want to disable.
     */
	$scope.removeFilter = function(statVar) {
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			if ($scope.statInfo[i].var === statVar) {
				delete $scope.statInfo[i].filter;
				break;
			}
		}

		$scope.saveCookies();
	};

    /** Resets the enabled/disabled filters back to the defaults. */
	$scope.resetFilters = function() {
		for (var i = 0; i < $scope.defaultStatInfo.length; ++i) {
			for (var j = 0; j < $scope.statInfo.length; ++j) {
                if ($scope.defaultStatInfo[i].var === $scope.statInfo[j].var) {
				    $scope.statInfo[j].filter = $scope.defaultStatInfo[i].filter;
                    break;
                }
			}
		}
	};

	$scope.init();
}]);
