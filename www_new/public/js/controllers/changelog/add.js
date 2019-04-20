angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('changelog-add', ['$scope', '$http', 'breadcrumb', function($scope, $http, breadcrumb) {
    /** Initializes the controller. */
	$scope.initialize = function() {
		$scope.changelogModel = {Version: "", Notes: ""};

		breadcrumb.links = [{'display': 'Changelog', 'href': '/changelog/'},
						{'display': 'Add', 'href': '', 'active': true}];
	};

    /**
     * Sumbits the given changelog to the server.
     *
     * @param {object} changelog - the changelog object
     */
	$scope.submitChangelog = function(changelog) {
		$http({
			url: '/php/changelog/insertChangelogVersion.php',
			method: 'POST',
			data: changelog
		}).then(function succcessCallback(response) {
			window.location = "/changelog/details.html?id=" + response.data;
		}, function errorCallback(response){

		});
	};

	$scope.initialize();
}]);
