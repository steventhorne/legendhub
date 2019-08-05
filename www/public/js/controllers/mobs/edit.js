angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('mobs-edit', ['$scope', '$http', '$q', 'breadcrumb', function($scope, $http, $q, breadcrumb) {
    /** Initializes the controller. */
	var initialize = function() {
        loadPage();
	};

    /** Runs the async functions needed before displaying the page. */
    var loadPage = function() {
        $q.all([getAreasAsync(), getMobAsync(getUrlParameter("id"))]).then(
            function(data) {
                // getAreasAsync
			    $scope.areas = data[0];

                // getMobAsync
                $scope.mobModel = data[1];

                if (data[1] == null) {
                    breadcrumb.links = [{'display': 'Mobs', 'href': '/mobs/'},
                                        {'display': 'Not Found', 'href': '', 'active': true}];
                    return;
                }

                if ($scope.mobModel) {
                    $scope.mobModel.Aggro = Boolean($scope.mobModel.Aggro);
                    $scope.initialMobModel = angular.copy($scope.mobModel);

                    breadcrumb.links = [{'display': 'Mobs', 'href': '/mobs/'},
                                        {'display': $scope.mobModel.AreaEra, 'href': '/mobs/index.html?eraId=' + $scope.mobModel.EraId},
                                        {'display': $scope.mobModel.AreaName, 'href': '/mobs/index.html?eraId=' + $scope.mobModel.EraId + '&areaId=' + $scope.mobModel.AreaId},
                                        {'display': $scope.mobModel.Name, 'href': '/mobs/details.html?id=' + $scope.mobModel.Id},
                                        {'display': 'Edit', 'href': '', 'active': true}];
                }
            }
        );
    };

    /**
     * Gets the area data from the server.
     *
     * @return {Promise} a promise containing the area data.
     */
	var getAreasAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/mobs/getAreas.php'
		}).then(function successCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response) {
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Gets the mob data from the server.
     *
     * @param {int} id - the id of the mob to retrieve.
     * @return {Promise} a promise containing the mob data.
     */
	var getMobAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/mobs/getMob.php',
			method: 'POST',
			data: {"id": id}
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Get whether the save button should be disabled.
     *
     * @return {bool} true if the save button should be disabled.
     */
	$scope.shouldDisableSave = function() {
		return !$scope.form.$valid || angular.toJson($scope.mobModel) === angular.toJson($scope.initialMobModel);
	};

    /** Submit the mob data to the server. */
	$scope.submitMob = function() {
		if (!$scope.form.$valid || angular.toJson($scope.mobModel) === angular.toJson($scope.initialMobModel)) {
			return;
		}

		var postData = angular.copy($scope.mobModel);
		$http({
			url: '/php/mobs/updateMob.php',
			method: 'POST',
			data: postData
		}).then(function succcessCallback(response) {
			window.location = "/mobs/details.html?id=" + $scope.mobModel.Id;
		}, function errorCallback(response){

		});
	};

	initialize();
}]);
