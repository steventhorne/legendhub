angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('changelog-edit', ['$scope', '$http', '$q', 'breadcrumb', function($scope, $http, $q, breadcrumb) {
    /** Initializes the controller. */
	$scope.initialize = function() {
		$scope.changelogModel = {Title: "", CategoryId: 0, SubCategoryId: 0, Tags: "", Content: ""};
        $scope.getChangelogVersionAsync(getUrlParameter("id")).then(
            function(data) {
                $scope.changelogModel = data;
                $scope.initialChangelogModel = angular.copy($scope.changelogModel);

                $scope.addBreadcrumbs();
            }
        );
	};

    /**
     * Gets the changelog version with the given id.
     *
     * @param {int} id - the Id of the changelog requested.
     * @return {Promise} a promise containing the requested changelog version.
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

    /** Adds breadcrumb links. */
	$scope.addBreadcrumbs = function() {
		breadcrumb.links = [{'display': 'Changelog', 'href': '/changelog/'},
		                    {'display': $scope.changelogModel.Version, 'href': '/changelog/details.html?id=' + $scope.changelogModel.Id},
		                    {'display': 'Edit', 'href': '', 'active': true}];
	};

    /**
     * Gets whether the save button should be disabled.
     *
     * @return {bool} true if save button should be disabled.
     */
	$scope.getIsSaveDisabled = function() {
		return !$scope.form.$valid || angular.toJson($scope.changelogModel) === angular.toJson($scope.initialChangelogModel);
	};

    /**
     * Submits the specified changelog version to the server.
     *
     * @param {object} changelog - the changelog version to be submitted.
     */
	$scope.submitChangelog = function(changelog) {
		$http({
			url: '/php/changelog/updateChangelogVersion.php',
			method: 'POST',
			data: changelog
		}).then(function succcessCallback(response) {
			window.location = "/changelog/details.html?id=" + response.data;
		}, function errorCallback(response){

		});
	};

	$scope.initialize();
}]);
