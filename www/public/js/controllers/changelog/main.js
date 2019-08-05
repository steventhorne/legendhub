app.controller('changelog', ['$scope', '$cookies', '$http', '$q', function($scope, $cookies, $http, $q) {
    /** Initializes the controller. */
	$scope.init = function() {
        $scope.getChangelogVersionsAsync().then(
            function(data) {
                $scope.versions = data;

                for (var i = 0; i < $scope.versions.length; ++i) {
			        $scope.versions[i].CreatedOn = (new Date($scope.versions[i].CreatedOn + "Z")).toString().slice(4, 15);
                }
            }
        );
	};

    /**
     * Gets the list of changelog versions.
     *
     * @return {Promise} promise containing the changelog versions array.
     */
    $scope.getChangelogVersionsAsync = function() {
        var deferred = $q.defer();

        $http({
			url: '/php/changelog/getChangelogVersions.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
    };

	$scope.init();
}]);
