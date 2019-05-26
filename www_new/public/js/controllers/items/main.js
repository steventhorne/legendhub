app.controller('items', ["$scope", "$q", "$cookies", "$http", "itemConstants", function($scope, $q, $cookies, $http, itemConstants) {
    /** Initializes the controller. */
	$scope.init = function() {
		$scope.searchString = getUrlParameter('search');

        loadFiltersFromUrl();
        $scope.multiValueFilters = {};

        loadPage();
	};

    /** Calls the async functions needed before displaying the page. */
    var loadPage = function() {
        let queryString =
            "{\n" +
                "getItemStatInfo {\n" +
                    "display\n" +
                    "short\n" +
                    "var\n" +
                    "type\n" +
                    "filterString\n" +
                    "showColumnDefault\n" +
                "}\n" +
            "}";

		$http({
			url: '/api',
            method: 'POST',
            data: { query: queryString }
		}).then(function succcessCallback(response) {
            $scope.statInfo = response.data.data.getItemStatInfo;

            loadCookies();
		}, function errorCallback(response){
		});
    };

    /*
     * Checks if a stat column is enabled.
     *
     * @param {string} statShort - the short name of the stat to check against.
     * @param {bool} def - the default value to return is the columns are not available.
     * @return {bool} true if the column should be displayed.
     */
    $scope.showColumn = function(statShort, def) {
        if (!$scope.columns)
            return def;

        return $scope.columns.includes(statShort);
    };

    /*
     * Toggles whether to display a stat column.
     *
     * @param {string} statShort - the short name of the stat to check against.
     */
    $scope.toggleColumn = function(statShort) {
        if (!$scope.columns)
            return;

        let index = $scope.columns.indexOf(statShort);
        if (index > -1)
            $scope.columns.splice(index, 1);
        else
            $scope.columns.push(statShort);

        $scope.saveCookies();
    };

    /*
     * Checks if a filter is enabled.
     *
     * @param {string} statVar - the var name of the stat to check against.
     * @param {bool} def - the default value to return if the filters are not available.
     * @return {bool} true if the filter is enabled for the given stat.
     */
    $scope.isFilterEnabled = function(statVar, def) {
        if (!$scope.filters)
            return def;

        return $scope.filters.hasOwnProperty(statVar);
    };

    /*
     * Toggles whether to use a filter in the search.
     *
     * @param {string} statVar - the var name of the stat to use as a filter.
     * @param {Array} values - the values for the filter, if any.
     */
    $scope.toggleFilter = function(statVar) {
        if (!$scope.filters)
            return;

        if ($scope.filters.hasOwnProperty(statVar)) {
            delete $scope.filters[statVar];
        }
        else {
            $scope.filters[statVar] = [];
        }
    };

    /**
     * Removes the filter for a specified stat.
     *
     * @param {string} statVar - The var name for the stat to remove the filter for.
     */
	$scope.removeFilter = function(statVar) {
        delete $scope.filters[statVar];
	};

    $scope.onFilterDropdownChange = function(statVar) {
        let value = $scope.multiValueFilters[statVar];

        if (value === undefined || value === "") {
            delete $scope.filters[statVar];
        }
        else {
            $scope.filters[statVar] = [value];
        }
    };

    /** Navigates to the items index page with the url query for the search. */
	$scope.onSearchClicked = function() {
		window.location = getSearchUrl($scope.searchString, $scope.filters);
	};

    /**
     * Gets the search url given the search input and filters.
     *
     * @param {string} searchString - the search input from the user.
     * @param {Array} filters - the array of filters.
     * @return {string} the url with the query parameters for the search.
     */
	let getSearchUrl = function(searchString, filters) {
		let url = "/items/index.html?";

		let filtersUrl = getURLFormattedFilters(filters);
		if (filtersUrl) {
			url += "filters=" + filtersUrl + "&";
		}

		url += "search=" + searchString;
		return url;
	};

    /*
     * Gets the URL format for the enabled filters.
     *
     * @param {Array} filters - the array of filters.
     * @return {string} the URL formatted string.
     */
	let getURLFormattedFilters = function(filters) {
        if (!filters)
            return "";

		let url = "";
        let first = true;
        for (let key in $scope.filters) {
            if (!first)
                url += ",";

            if ($scope.filters.hasOwnProperty(key)) {
                url += key;
                for (let i = 0; i < $scope.filters[key].length; ++i) {
                    url += "_" + $scope.filters[key][i];
                }
            }
            first = false;
        }

		return url;
	};

    /** Loads the enabled filters from the url into the statInfo array and enabled filters. */
	var loadFiltersFromUrl = function() {
		$scope.filters = {};

		let filterString = getUrlParameter("filters");
        if (filterString) {
            let filterStrings = filterString.split(",");
            for (let i = 0; i < filterStrings.length; ++i)
            {
                let splitFilter = filterStrings[i].split("_");
                $scope.filters[splitFilter[0]] = splitFilter.slice(1);
            }
        }
	};

    /** Loads the user's client-side saved data. */
	let loadCookies = function() {
		// delete old cookies
		$cookies.remove("sc1", {"path": "/"});

		// load new cookies
		if ($cookies.get("cookie-consent")) {
            $scope.columns = [];

			let columnCookie = $cookies.get("sc2");
			if (columnCookie) {
				let columns = columnCookie.split("-");
				for (let i = 0; i < columns.length; ++i) {
                    $scope.columns.push(columns[i]);
				}
			}
            else {
                for (let i = 0; i < $scope.statInfo.length; ++i) {
                    if ($scope.statInfo[i].showColumnDefault) {
                        $scope.columns.push($scope.statInfo[i].short);
                    }
                }
            }
		}
	};

    /** Saves the user's client-side saved data. */
	$scope.saveCookies = function() {
		var cookieDate = new Date();
		cookieDate.setFullYear(cookieDate.getFullYear() + 20);

        $savedColumns = $scope.columns.join("-");
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
     * @param {string} url - the url to visit.
     */
	$scope.onColumnHeaderClicked = function(url) {
        window.location = url;
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
        $scope.columns = [];
        for (let i = 0; i < $scope.statInfo.length; ++i) {
            if ($scope.statInfo[i].showColumnDefault) {
                $scope.columns.push($scope.statInfo[i].short);
            }
        }

        $scope.saveCookies();
	};

    /** Resets the enabled/disabled filters back to the defaults. */
	$scope.resetFilters = function() {
        $scope.filters = {};
	};

	$scope.init();
}]);
