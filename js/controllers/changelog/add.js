angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('changelog-add', function($scope, $http, breadcrumb) {
	$scope.initialize = function() {
		$scope.changelogModel = {Version: "", Notes: ""};

		breadcrumb.links = [{'display': 'Changelog', 'href': '/changelog/'},
						{'display': 'Add', 'href': '', 'active': true}];
	}

	$scope.submitChangelog = function() {
		$http({
			url: '/php/changelog/insertChangelogVersion.php',
			method: 'POST',
			data: $scope.changelogModel
		}).then(function succcessCallback(response) {
			window.location = "/changelog/details.html?id=" + response.data;
		}, function errorCallback(response){

		});
	}

	$scope.initialize();
});
