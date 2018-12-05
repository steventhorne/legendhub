angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('changelog-details', ['$scope', '$http', '$q', 'breadcrumb', function($scope, $http, $q, breadcrumb) {
    /** Initializes the controller. */
	$scope.initialize = function() {
        $scope.getChangelogVersionAsync(getUrlParameter("id")).then(
            function(data) {
                $scope.changelogModel = data;

                $scope.changelogModel.ModifiedOn = (new Date(data.ModifiedOn + " UTC")).toString().slice(4, 24);
                $scope.changelogModel.CreatedOn = (new Date(data.CreatedOn + " UTC")).toString().slice(4, 15);

                $scope.addBreadcrumb();
            }
        );
    };

    /**
     * Gets the changelog version with the specified Id.
     *
     * @param {int} id - The Id of the changelog version that is needed.
     * @return {Promise} a promise containing the changelog version requested.
     */
	$scope.getChangelogVersionAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/changelog/getChangelogVersion.php',
			method: 'POST',
			data: {"id": id}
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /** Adds the breadcrumb links */
    $scope.addBreadcrumb = function() {
        breadcrumb.links = [{'display': 'Changelog', 'href': '/changelog/'},
								{'display': $scope.changelogModel.Version, 'href': '', 'active': true}];
    };

	$scope.initialize();
}]);
