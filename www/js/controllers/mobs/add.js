angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('mobs-add', ['$scope', '$http', '$q', 'breadcrumb', function($scope, $http, $q, breadcrumb) {
    /** Initializes the controller. */
	var initialize = function() {
		$scope.mobModel = {"Xp": 0, "Gold": 0, "Aggro": false, "Notes": null};
		$scope.areas = [];

		breadcrumb.links = [{'display': 'Mobs', 'href': '/mobs/'},
						{'display': 'Add', 'href': '', 'active': true}];

        loadPage();
	};

    /** Calls the async functions that are needed before displaying the page. */
    var loadPage = function() {
        getAreasAsync().then(
            function(data) {
                $scope.areas = data;
            }
        );
    };

    /**
     * Gets the areas from the server.
     *
     * @return {Promise} a promise containing the area data.
     */
	var getAreasAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/mobs/getAreas.php',
		}).then(function successCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response) {
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Submits the mob data to the server.
     *
     * @param {object} mob - the mob to be submitted.
     */
	$scope.submitMob = function(mob) {
		$http({
			url: '/php/mobs/insertMob.php',
			method: 'POST',
			data: mob
		}).then(function succcessCallback(response) {
			window.location = "/mobs/details.html?id=" + response.data;
		}, function errorCallback(response){
		});
	};

	initialize();
}]);
