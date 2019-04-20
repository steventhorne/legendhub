app.controller('mobs', ['$scope', '$http', '$q', 'categories', function($scope, $http, $q, categories) {
    /** Initializes the controller. */
	var initialize = function() {
		$scope.mobsPerPage = 20;
		$scope.sortProperty = "";
		$scope.sortReverse = false;

		$scope.catService = categories;

		categories.setSelectedCategory(getUrlParameter('eraId'));
		categories.setSelectedSubcategory(getUrlParameter('areaId'));
		$scope.searchString = getUrlParameter('search');

        loadPage();
	};

    /** Calls the async functions needed before displaying the page. */
    var loadPage = function() {
        getAreasAsync().then(
            function(data) {
                var eras = [];
                var eraCount = 0;
                for (var i = 0; i < data.length; ++i) {
                    if (!eras.includes(data[i].Era)) {
                        eras[data[i].EraId] = data[i].Era;
                    }
                    data[i].CategoryId = data[i].EraId;
                }

                var eraCategories = [];
                for (var i = 1; i < eras.length; ++i) {
                    eraCategories.push({Id: i, Name: eras[i]});
                }

                categories.setCategories(eraCategories);
                categories.setSubcategories(data);

                if (categories.hasSelectedCategory() || $scope.searchString) {
                    searchAsync($scope.searchString, categories.getCategoryId(), categories.getSubcategoryId()).then(
                        function(data) {
                            $scope.mobs = data;
                            $scope.recent = false;

                            $scope.totalPages = Math.floor(($scope.mobs.length - 1) / $scope.mobsPerPage) + 1;
                            $scope.currentPage = 1;
                        }
                    );
                }
                else {
                    getRecentMobsAsync().then(
                        function(data) {
                            $scope.mobs = data;
                            $scope.recent = true;

                            $scope.totalPages = Math.floor(($scope.mobs.length - 1) / $scope.mobsPerPage) + 1;
                            $scope.currentPage = 1;
                        }
                    );
                }
            }
        );
    };

    /**
     * Gets the area data from the server.
     *
     * @return {Promise} a promise containing the area data.
     */
	var getAreasAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/mobs/getAreas.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
        }, function errorCallback(response) {
            deferred.reject(response);
        });

        return deferred.promise;
	};

    /**
     * Gets the recently added/edited mobs from the server.
     *
     * @return {Promise} a promise containing the recent mob data.
     */
	var getRecentMobsAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/mobs/getRecentMobs.php',
			method: 'POST'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Gets the mobs based on search/filter parameters
     *
     * @param {string} searchString - the string used to filter out which mobs are returned.
     * @param {int} eraId - the era that the mob must be a part of.
     * @param {int} areaId - the area the the mob must be a part of.
     */
	var searchAsync = function(searchString, eraId, areaId) {
        var deferred = $q.defer();

		$http({
			url: '/php/mobs/getMobs.php',
			method: 'POST',
			data: {"searchString": searchString, "eraId": eraId, "areaId": areaId}
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /** Event for when the search button is clicked. */
	$scope.onSearchClicked = function() {
		window.location = $scope.getSearchUrl();
	};

    /**
     * Gets the search url based on the category and subcategory ids.
     *
     * @param {int} categoryId - the category to search on.
     * @param {int} subcategoryId - the subcategory to search on.
     * @return {string} the search url to visit.
     */
	$scope.getSearchUrl = function(categoryId, subcategoryId) {
		var url = "/mobs/index.html?";

		if (categoryId !== undefined) {
			url += "eraId=" + categoryId + "&";
		}
		else if (categories.hasSelectedCategory()) {
			url += "eraId=" + categories.getCategoryId() + "&";
		}

		if (subcategoryId !== undefined) {
			url += "areaId=" + subcategoryId + "&";
		}
		else if (categories.hasSelectedSubcategory()) {
			url += "areaId=" + categories.getSubcategoryId() + "&";
		}

		url += "search=" + $scope.searchString;
		return url;
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
     * @param {int} num - the number of the page that was clicked.
     */
	$scope.onPageClicked = function(num) {
		$scope.currentPage = num;
	};

    /**
     * Event for when a mob is clicked in the search view.
     *
     * @param {object} item - the mob that was clicked.
     */
	$scope.onMobClicked = function(item) {
		window.location = "/mobs/details.html?id=" + item.Id;
	};

    /**
     * Gets an array with the page numbers that should be displayed.
     *
     * @return {Array} an array of page numbers.
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
     * Event for when a column header is clicked on the search result table.
     *
     * @param {string} the variable name of the stat that was clicked.
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
     * Gets the HTML class for the specified stat.
     *
     * @param {string} statVar - the variable name of the stat to get the class for.
     * @return {string} the HTML class names that should be used.
     */
	$scope.sortClass = function(statVar) {
		if (!$scope.sortProperty) {
			return "fas fa-sort";
		}
		else if ($scope.sortProperty == statVar) {
			return $scope.sortReverse ? "fas fa-sort-down" : "fas fa-sort-up";
		}
	};

	initialize();
}]);
