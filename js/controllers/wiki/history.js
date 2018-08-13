angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('wiki-history', function($scope, $http, breadcrumb) {
	$scope.initialize = function() {
		$scope.categories = [];
		$scope.subcategories = [];

		$scope.loadingProgress = 0;
		$scope.getWikiPage();
		$scope.getCategories();
		$scope.getSubcategories();
		$http({
			url: '/php/login/getLoggedInUser.php'
		}).then(function succcessCallback(response) {
			$scope.isLoggedIn = response.data.success;
		}, function errorCallback(response) {

		});
	}

	$scope.getWikiPage = function() {
		$http({
			url: '/php/wiki/getWikiPageByHistoryId.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.wikiModel = response.data;
			console.log($scope.wikiModel);
			$scope.wikiModel.ModifiedOn = (new Date(response.data.ModifiedOn + " UTC")).toString().slice(4, 24);
			$scope.getWikiPageHistory();
			$scope.splitTags();

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
			$scope.subcategories = response.data;

			if (++$scope.loadingProgress == 3) {
				$scope.addBreadcrumbs();
			}
		}, function errorCallback(response){

		});
	}

	$scope.addBreadcrumbs = function() {
		breadcrumb.links = [{'display': 'Wiki', 'href': '/wiki/'}];
		breadcrumb.links.push({'display': $scope.getCategory($scope.wikiModel.CategoryId), 'href': '/wiki/index.html?categoryId=' + $scope.wikiModel.CategoryId});
		if ($scope.wikiModel.SubCategoryId && $scope.wikiModel.SubCategoryId > 0) {
			breadcrumb.links.push({'display': $scope.getSubcategory($scope.wikiModel.SubCategoryId), 'href': '/wiki/index.html?categoryId=' + $scope.wikiModel.CategoryId + '&subcategoryId=' + $scope.wikiModel.SubCategoryId});
		}
		breadcrumb.links.push({'display': $scope.wikiModel.Title, 'href': '/wiki/details.html?id=' + $scope.wikiModel.WikiPageId});
		breadcrumb.links.push({'display': $scope.wikiModel.ModifiedOn, 'href': '', 'active': true});
	}

	$scope.getCategory = function(id) {
		for (var i = 0; i < $scope.categories.length; ++i) {
			console.log($scope.categories);
			console.log(id);
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

	$scope.splitTags = function() {
		$scope.tags = $scope.wikiModel.Tags.split(';');
	}

	$scope.getWikiPageHistory = function() {
		$http({
			url: '/php/wiki/getWikiPageHistory.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.history = response.data;
			var i;
			for (i = 0; i < $scope.history.length; i++) {
				$scope.history[i].ModifiedOn = (new Date($scope.history[i].ModifiedOn + " UTC")).toString().slice(4, 24);
			}
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