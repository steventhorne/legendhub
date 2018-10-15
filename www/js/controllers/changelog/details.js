angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('changelog-details', ['$scope', '$http', 'breadcrumb', function($scope, $http, breadcrumb) {
	$scope.initialize = function() {
		$scope.getChangelogVersion();
    }

	$scope.getChangelogVersion = function() {
		$http({
			url: '/php/changelog/getChangelogVersion.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.changelogModel = response.data;
			$scope.changelogModel.ModifiedOn = (new Date(response.data.ModifiedOn + " UTC")).toString().slice(4, 24);
			$scope.changelogModel.CreatedOn = (new Date(response.data.CreatedOn + " UTC")).toString().slice(4, 15);

            $scope.addBreadcrumb();
		}, function errorCallback(response){

		});
	}

    $scope.addBreadcrumb = function() {
        breadcrumb.links = [{'display': 'Changelog', 'href': '/changelog/'},
								{'display': $scope.changelogModel.Version, 'href': '', 'active': true}];
    }

	getUrlParameter = function(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	$scope.initialize();
}]);
