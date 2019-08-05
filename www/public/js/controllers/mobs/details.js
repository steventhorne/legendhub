angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('mobs-details', ['$scope', '$http', '$q', 'itemConstants', 'breadcrumb', function($scope, $http, $q, itemConstants, breadcrumb) {
    /** Initializes the controller. */
	var initialize = function() {
		$scope.slots = itemConstants.slots;

        loadPage();
	};

    /** Calls the async functions needed before displaying the page. */
    var loadPage = function() {
        var id = getUrlParameter("id");
        $q.all([getMobAsync(id), getMobHistoryAsync(id), getItemsAsync(id)]).then(
            function(data) {
                // getMobAsync
                $scope.mob = data[0];
                if (data[0] == null) {
                    breadcrumb.links = [{'display': 'Mobs', 'href': '/mobs/'},
                                        {'display': 'Not Found', 'href': '', 'active': true}];
                    return;
                }

                if ($scope.mob) {
                    $scope.mob.ModifiedOn = (new Date($scope.mob.ModifiedOn + "Z")).toString().slice(4, 24);

                    breadcrumb.links = [{'display': 'Mobs', 'href': '/mobs/'},
                                        {'display': $scope.mob.AreaEra, 'href': '/mobs/index.html?eraId=' + $scope.mob.EraId},
                                        {'display': $scope.mob.AreaName, 'href': '/mobs/index.html?eraId=' + $scope.mob.EraId + '&areaId=' + $scope.mob.AreaId},
                                        {'display': $scope.mob.Name, 'href': '', 'active': true}];
                }

                // getMobHistoryAsync
                $scope.history = data[1].slice(0, 9);
                for (let i = 0; i < $scope.history.length; i++) {
                    $scope.history[i].ModifiedOn = (new Date($scope.history[i].ModifiedOn + "Z")).toString().slice(4, 24);
                }

                //getItemsAsync
                $scope.items = data[2];
                for (var i = 0; i < $scope.items.length; ++i) {
                    $scope.items[i].SlotName = $scope.slots[$scope.items[i].Slot];
                }
            }
        )
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
     * Gets the mob history data from the server.
     *
     * @param {int} id - the id of the mob to retrieve history data for.
     * @return {Promise} a promise containing the mob history data.
     */
	var getMobHistoryAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/mobs/getMobHistory.php',
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
     * Gets the linked items for the specified mob.
     *
     * @param {int} id - the id of the mob to retrieve linked items for.
     * @return {Promise} a promise containing the item data.
     */
	var getItemsAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItemsByMobId.php',
			method: 'POST',
			data: {"MobId": id}
		}).then(function successCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response) {
            deferred.reject(response);
		});

        return deferred.promise;
	};

	initialize();
}]);
