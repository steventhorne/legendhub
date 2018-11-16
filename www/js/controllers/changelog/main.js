app.controller('changelog', function($scope, $cookies, $http, itemConstants, categories) {
	$scope.init = function() {
        $scope.getChangelogVersions();
	}

    $scope.getChangelogVersions = function() {
        $http({
			url: '/php/changelog/getChangelogVersions.php'
		}).then(function succcessCallback(response) {
			$scope.versions = response.data;

            for (var i = 0; i < $scope.versions.length; ++i) {
			    $scope.versions[i].CreatedOn = (new Date($scope.versions[i].CreatedOn + " UTC")).toString().slice(4, 15);
            }
		}, function errorCallback(response){

		});
    }

	$scope.init();
});
