angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('changelog-edit', function($scope, $http, breadcrumb) {
	$scope.initialize = function() {
		$scope.changelogModel = {Title: "", CategoryId: 0, SubCategoryId: 0, Tags: "", Content: ""};
		$scope.getChangelogVersion();
	}

	$scope.getChangelogVersion = function() {
		$http({
			url: '/php/changelog/getChangelogVersion.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.changelogModel = response.data;
			$scope.initialChangelogModel = angular.copy($scope.changelogModel);

			$scope.addBreadcrumbs();
		}, function errorCallback(response){

		});
	}

	$scope.addBreadcrumbs = function() {
		breadcrumb.links = [{'display': 'Changelog', 'href': '/changelog/'},
		                    {'display': $scope.changelogModel.Version, 'href': '/changelog/details.html?id=' + $scope.changelogModel.Id},
		                    {'display': 'Edit', 'href': '', 'active': true}];
	}

	$scope.saveDisabled = function() {
		return !$scope.form.$valid || angular.toJson($scope.changelogModel) === angular.toJson($scope.initialChangelogModel);
	}

	$scope.submitChangelog = function() {
		$http({
			url: '/php/changelog/updateChangelogVersion.php',
			method: 'POST',
			data: $scope.changelogModel
		}).then(function succcessCallback(response) {
			window.location = "/changelog/details.html?id=" + response.data;
		}, function errorCallback(response){

		});
	}

	$scope.initialize();
});
