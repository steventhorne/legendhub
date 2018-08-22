app.controller('wiki', function($scope, $http, categories) {
	$scope.init = function() {
		$scope.wikiPagesPerPage = 20;
		$scope.sortProperty = "";
		$scope.sortReverse = false;

		$scope.catService = categories;

		// load query params
		categories.setSelectedCategory(getUrlParameter('categoryId'));
		categories.setSelectedSubcategory(getUrlParameter('subcategoryId'));
		$scope.searchString = getUrlParameter('search');

		$scope.getCategories();
		$scope.getSubcategories();

		if (categories.hasSelectedCategory() || $scope.searchString) {
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
			categories.setCategories(response.data);
		}, function errorCallback(response){

		});
	}

	$scope.getSubcategories = function() {
		$http({
			url: '/php/wiki/getSubCategories.php'
		}).then(function succcessCallback(response) {
			categories.setSubcategories(response.data);
		}, function errorCallback(response){

		});
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
			data: {"searchString": $scope.searchString, "categoryId": categories.getCategoryId(), "subcategoryId": categories.getSubcategoryId()}
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
		if (categories.hasSelectedCategory()) {
			url += "categoryId=" + categories.getCategoryId() + "&";
		}

		if (categories.getSubcategoryId()) {
			url += "subcategoryId=" + categories.getSubcategoryId() + "&";
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

	getUrlParameter = function(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	$scope.init();
});
