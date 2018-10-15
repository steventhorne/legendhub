angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('wiki-add', function($scope, $http, breadcrumb) {
	$scope.initialize = function() {
		$scope.wikiModel = {Title: "", CategoryId: 0, SubCategoryId: 0, Tags: "", Content: ""};
		$scope.categories = [];
		$scope.allsubcategories = [];
		$scope.subcategories = [];

		$scope.getCategories();
		$scope.getSubcategories();

		breadcrumb.links = [{'display': 'Wiki', 'href': '/wiki/'},
						{'display': 'Add', 'href': '', 'active': true}];
	}

	$scope.getCategories = function() {
		$http({
			url: '/php/wiki/getCategories.php'
		}).then(function succcessCallback(response) {
			$scope.categories = response.data;
		}, function errorCallback(response){

		});
	}

	$scope.getSubcategories = function() {
		$http({
			url: '/php/wiki/getSubCategories.php'
		}).then(function succcessCallback(response) {
			$scope.allsubcategories = response.data;
		}, function errorCallback(response){

		});
	}

	$scope.onCategoryChanged = function() {
		$scope.subcategories = [];
		$scope.wikiModel.SubCategoryId = 0;
		for (var i = 0; i < $scope.allsubcategories.length; ++i) {
			if ($scope.allsubcategories[i].CategoryId == $scope.wikiModel.CategoryId) {
				$scope.subcategories.push($scope.allsubcategories[i]);
			}
		}
	}

	$scope.submitWiki = function() {
		$http({
			url: '/php/wiki/insertWikiPage.php',
			method: 'POST',
			data: $scope.wikiModel
		}).then(function succcessCallback(response) {
			window.location = "/wiki/details.html?id=" + response.data;
		}, function errorCallback(response){

		});
	}

	$scope.initialize();
});