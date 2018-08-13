app.controller('wiki', function($scope, $location, $http) {
	$scope.init = function() {
		$scope.searchString = "";
		$scope.wikiPagesPerPage = 20;
		$scope.categories = [];
		$scope.subcategories = [];

		// load query params
		$scope.selectedCategoryId = getUrlParameter('categoryId');
		$scope.selectedSubcategoryId = getUrlParameter('subcategoryId');
		$scope.searchString = getUrlParameter('search');

		$scope.getCategories();
		$scope.getSubcategories();

		if ($scope.selectedCategoryId || $scope.searchString) {
			$scope.search();
		}
		else {
			$scope.getRecentWikiPages();
		}
		$http({
			url: '/php/login/getLoggedInUser.php'
		}).then(function succcessCallback(response) {
			$scope.isLoggedIn = response.data.success;
		}, function errorCallback(response) {

		});
	}

	$scope.getCategories = function() {
		$http({
			url: '/php/wiki/getCategories.php'
		}).then(function succcessCallback(response) {
			$scope.categories = response.data;
		}, function errorCallback(response){

		});
	}

	$scope.getCategory = function(id) {
		for (var i = 0; i < $scope.categories.length; ++i) {
			if ($scope.categories[i].Id == id) {
				return $scope.categories[i].Name;
			}
		}
		return "";
	}

	$scope.getSubcategories = function() {
		$http({
			url: '/php/wiki/getSubCategories.php'
		}).then(function succcessCallback(response) {
			$scope.subcategories = response.data;
			$scope.filteredSubcategories = [];
			if ($scope.selectedCategoryId) {
				for (var i = 0; i < $scope.subcategories.length; ++i) {
					if ($scope.subcategories[i].CategoryId == $scope.selectedCategoryId) {
						$scope.filteredSubcategories.push($scope.subcategories[i]);
					}
				}
			}
		}, function errorCallback(response){

		});
	}

	$scope.getSubcategory = function(id) {
		for (var i = 0; i < $scope.subcategories.length; ++i) {
			if ($scope.subcategories[i].Id == id) {
				return $scope.subcategories[i].Name;
			}
		}
		return "None";
	}

	$scope.getSearchingCategory = function() {
		if ($scope.selectedCategoryId > 0) {
			if ($scope.selectedSubcategoryId > 0) {
				return $scope.getSubcategory($scope.selectedSubcategoryId);
			}
			return $scope.getCategory($scope.selectedCategoryId);
		}
	}

	$scope.clearCategories = function() {
		$scope.selectedCategoryId = 0;
		$scope.selectedSubcategoryId = 0;
	}

	$scope.getRecentWikiPages = function() {
		$http({
			url: '/php/wiki/getRecentWikiPages.php',
			method: 'POST'
		}).then(function succcessCallback(response) {
			$scope.wikiPages = response.data;
			$scope.recent = true;

			$scope.totalPages = Math.floor(($scope.wikiPages.length - 1) / $scope.wikiPagesPerPage) + 1;
			$scope.currentPage = 1;
		}, function errorCallback(response){

		});
	}

	$scope.search = function() {
		$http({
			url: '/php/wiki/getWikiPages.php',
			method: 'POST',
			data: {"searchString": $scope.searchString, "categoryId": $scope.selectedCategoryId, "subcategoryId": $scope.selectedSubcategoryId}
		}).then(function succcessCallback(response) {
			$scope.wikiPages = response.data;
			$scope.recent = false;

			$scope.totalPages = Math.floor(($scope.wikiPages.length - 1) / $scope.wikiPagesPerPage) + 1;
			$scope.currentPage = 1;
		}, function errorCallback(response){

		});
	}

	$scope.onSearchClicked = function() {
		var url = "/wiki/index.html?"
		if ($scope.selectedCategoryId) {
			url += "categoryId=" + $scope.selectedCategoryId + "&";
		}

		if ($scope.selectedSubcategoryId) {
			url += "subcategoryId=" + $scope.selectedSubcategoryId + "&";
		}

		url += "search=" + $scope.searchString;

		window.location = url;
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

	$scope.onWikiPageClicked = function(item) {
		window.location = "/wiki/details.html?id=" + item.Id;
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

	getUrlParameter = function(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	$scope.init();
});
