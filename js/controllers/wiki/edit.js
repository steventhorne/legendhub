angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('wiki-edit', function($scope, $http, breadcrumb) {
	$scope.initialize = function() {
		$scope.wikiModel = {Title: "", CategoryId: 0, SubCategoryId: 0, Tags: "", Content: ""};
		$scope.categories = [];
		$scope.allsubcategories = [];
		$scope.subcategories = [];
		
		$scope.loadingProgress = 0;
		$scope.getWikiPage();
		$scope.getCategories();
		$scope.getSubcategories();
	}

	$scope.getWikiPage = function() {
		$http({
			url: '/php/wiki/getWikiPage.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.wikiModel = response.data;
			$scope.wikiModel.ModifiedOn = (new Date(response.data.ModifiedOn + " UTC")).toString().slice(4, 24);
			$scope.loadSubcategories();

			if (++$scope.loadingProgress == 3) {
				$scope.addBreadcrumbs();
			}
		}, function errorCallback(response){

		});
	}

	$scope.getCategories = function() {
		$http({
			url: '/php/wiki/getCategories.php'
		}).then(function succcessCallback(response) {
			$scope.categories = response.data;
			if (++$scope.loadingProgress == 3) {
				$scope.addBreadcrumbs();
			}
		}, function errorCallback(response){

		});
	}

	$scope.getSubcategories = function() {
		$http({
			url: '/php/wiki/getSubCategories.php'
		}).then(function succcessCallback(response) {
			$scope.allsubcategories = response.data;
			if (++$scope.loadingProgress == 3) {
				$scope.addBreadcrumbs();
			}
		}, function errorCallback(response){

		});
	}

	$scope.addBreadcrumbs = function() {
		breadcrumb.links = [{'display': 'Wiki', 'href': '/wiki/'},
						{'display': $scope.getCategory($scope.wikiModel.CategoryId), 'href': '/wiki/index.html?categoryId=' + $scope.wikiModel.CategoryId}];
		if ($scope.wikiModel.SubCategoryId > 0) {
			breadcrumb.links.push({'display': $scope.getSubcategory($scope.wikiModel.SubCategoryId), 'href': '/wiki/index.html?categoryId=' + $scope.wikiModel.CategoryId + '&subcategoryId=' + $scope.wikiModel.SubCategoryId});
		}
		breadcrumb.links.push({'display': $scope.wikiModel.Title, 'href': '/wiki/details.html?id=' + $scope.wikiModel.Id});
		breadcrumb.links.push({'display': 'Edit', 'href': '', 'active': true});
	}

	$scope.getCategory = function(id) {
		for (var i = 0; i < $scope.categories.length; ++i) {
			if ($scope.categories[i].Id == id) {
				return $scope.categories[i].Name;
			}
		}
		return "";
	}

	$scope.getSubcategory = function(id) {
		for (var i = 0; i < $scope.subcategories.length; ++i) {
			if ($scope.subcategories[i].Id == id) {
				return $scope.subcategories[i].Name;
			}
		}
		return "No Subcategory";
	}

	$scope.loadSubcategories = function() {
		$scope.subcategories = [];
		for (var i = 0; i < $scope.allsubcategories.length; ++i) {
			if ($scope.allsubcategories[i].CategoryId == $scope.wikiModel.CategoryId) {
				$scope.subcategories.push($scope.allsubcategories[i]);
			}
		}
	}

	$scope.onCategoryChanged = function() {
		$scope.wikiModel.SubCategoryId = 0;
		$scope.loadSubcategories();
	}

	$scope.submitWiki = function() {
		$http({
			url: '/php/wiki/updateWikiPage.php',
			method: 'POST',
			data: $scope.wikiModel
		}).then(function succcessCallback(response) {
			window.location = "/wiki/details.html?id=" + response.data;
		}, function errorCallback(response){

		});
	}

	getUrlParameter = function(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	$scope.initialize();
});