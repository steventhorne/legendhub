app.controller('mobs', function($scope, $http, categories) {
	$scope.init = function() {
		$scope.mobsPerPage = 20;
		$scope.sortProperty = "";
		$scope.sortReverse = false;

		$scope.catService = categories;

		categories.setSelectedCategory(getUrlParameter('eraId'));
		categories.setSelectedSubcategory(getUrlParameter('areaId'));
		$scope.searchString = getUrlParameter('search');

		$scope.getAreas();

		if (categories.hasSelectedCategory() || $scope.searchString) {
			$scope.search();
		}
		else {
			$scope.getRecentMobs();
		}
	}

	$scope.getAreas = function() {
		$http({
			url: '/php/mobs/getAreas.php'
		}).then(function succcessCallback(response) {
			var eras = [];
			var eraCount = 0;
			for (var i = 0; i < response.data.length; ++i) {
				if (!eras.includes(response.data[i].Era)) {
					eras[response.data[i].EraId] = response.data[i].Era;
				}
				response.data[i].CategoryId = response.data[i].EraId;
			}

			var eraCategories = [];
			for (var i = 1; i < eras.length; ++i) {
				eraCategories.push({Id: i, Name: eras[i]});
			}

			categories.setCategories(eraCategories);
			categories.setSubcategories(response.data);
		})
	}

	$scope.getRecentMobs = function() {
		$http({
			url: '/php/mobs/getRecentMobs.php',
			method: 'POST'
		}).then(function succcessCallback(response) {
			$scope.mobs = response.data;
			$scope.recent = true;

			$scope.totalPages = Math.floor(($scope.mobs.length - 1) / $scope.mobsPerPage) + 1;
			$scope.currentPage = 1;
		}, function errorCallback(response){

		});
	}

	$scope.search = function() {
		$http({
			url: '/php/mobs/getMobs.php',
			method: 'POST',
			data: {"searchString": $scope.searchString, "eraId": categories.getCategoryId(), "areaId": categories.getSubcategoryId()}
		}).then(function succcessCallback(response) {
			$scope.mobs = response.data;
			$scope.recent = false;

			$scope.totalPages = Math.floor(($scope.mobs.length - 1) / $scope.mobsPerPage) + 1;
			$scope.currentPage = 1;
		}, function errorCallback(response){

		});
	}

	$scope.onSearchClicked = function() {
		window.location = $scope.getSearchUrl();
	}

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

	$scope.onMobClicked = function(item) {
		window.location = "/mobs/details.html?id=" + item.Id;
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

	$scope.init();
});
