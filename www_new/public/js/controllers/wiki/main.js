app.controller('wiki', ['$scope', '$http', '$q', 'categories', function($scope, $http, $q, categories) {
    /** Initializes the controller. */
	var initialize = function() {
		$scope.wikiPagesPerPage = 20;
		$scope.sortProperty = "";
		$scope.sortReverse = false;

		$scope.catService = categories;

		// load query params
		categories.setSelectedCategory(getUrlParameter('categoryId'));
		categories.setSelectedSubcategory(getUrlParameter('subcategoryId'));
		$scope.searchString = getUrlParameter('search');

        loadPage();
	};

    /** Calls the async functions needed before displaying the page. */
    var loadPage = function() {
        $q.all([getCategoriesAsync(), getSubcategoriesAsync()]).then(
            function(data) {
                // getCategoriesAsync
			    categories.setCategories(data[0]);

                // getSubcategoriesAsync
                categories.setSubcategories(data[1]);

                if (categories.hasSelectedCategory() || $scope.searchString) {
                    searchAsync($scope.searchString, categories.getCategoryId(), categories.getSubcategoryId()).then(
                        function(data) {
                            $scope.wikiPages = data;
                            $scope.recent = false;

                            $scope.totalPages = Math.floor(($scope.wikiPages.length - 1) / $scope.wikiPagesPerPage) + 1;
                            $scope.currentPage = 1;
                        }
                    );
                }
                else {
                    getRecentWikiPagesAsync().then(
                        function(data) {
                            $scope.wikiPages = data;
                            $scope.recent = true;

                            $scope.totalPages = Math.floor(($scope.wikiPages.length - 1) / $scope.wikiPagesPerPage) + 1;
                            $scope.currentPage = 1;
                        }
                    );
                }
            }
        );
    };

	var getCategoriesAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/wiki/getCategories.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response.data);
		});

        return deferred.promise;
	};

	var getSubcategoriesAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/wiki/getSubCategories.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

	var getRecentWikiPagesAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/wiki/getRecentWikiPages.php',
			method: 'POST'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

	var searchAsync = function(searchString, categoryId, subcategoryId) {
        var deferred = $q.defer();

		$http({
			url: '/php/wiki/getWikiPages.php',
			method: 'POST',
			data: {"searchString": searchString, "categoryId": categoryId, "subcategoryId": subcategoryId}
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

	$scope.onSearchClicked = function() {
		window.location = $scope.getSearchUrl();
	};

	$scope.getSearchUrl = function(categoryId, subcategoryId) {
		var url = "/wiki/index.html?";

		if (categoryId !== undefined) {
			url += "categoryId=" + categoryId + "&";
		}
		else if (categories.hasSelectedCategory()) {
			url += "categoryId=" + categories.getCategoryId() + "&";
		}

		if (subcategoryId !== undefined) {
			url += "subcategoryId=" + subcategoryId + "&";
		}
		else if (categories.getSubcategoryId()) {
			url += "subcategoryId=" + categories.getSubcategoryId() + "&";
		}

		url += "search=" + $scope.searchString;
		return url;
	};

	$scope.onPreviousClicked = function() {
		$scope.currentPage -= 1;
		if ($scope.currentPage < 1) {
			$scope.currentPage = 1;
		}
	};

	$scope.onNextClicked = function() {
		$scope.currentPage += 1;
		if ($scope.currentPage > $scope.totalPages) {
			$scope.currentPage = $scope.totalPages;
		}
	};

	$scope.onPageClicked = function(num) {
		$scope.currentPage = num;
	};

	$scope.onWikiPageClicked = function(item) {
		window.location = "/wiki/details.html?id=" + item.Id;
	};

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

	$scope.onColumnHeaderClicked = function(statVar) {
		if ($scope.sortProperty == statVar) {
			$scope.sortReverse = !$scope.sortReverse;
		}
		else {
			$scope.sortProperty = statVar;
			$scope.sortReverse = true;
		}
	};

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
