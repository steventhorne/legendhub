angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('mobs-history', ['$scope', '$http', '$q', 'itemConstants', 'breadcrumb', function($scope, $http, $q, itemConstants, breadcrumb) {
    /** Initializes the controller. */
    var initialize = function() {
		$scope.slots = itemConstants.slots;

        loadPage();
    };

    /** Runs the async functions needed before displaying the page. */
    var loadPage = function() {
        getMobAsync(getUrlParameter("id")).then(
            function(data) {
                // getMobAsync
                $scope.mob = data;
                if (data == null) {
                    breadcrumb.links = [{'display': 'Mobs', 'href': '/mobs/'},
                                        {'display': 'Not Found', 'href': '', 'active': true}];
                    return;
                }

                $scope.mob.ModifiedOn = (new Date($scope.mob.ModifiedOn + " UTC")).toString().slice(4, 24);
                $scope.mob.Id = $scope.mob.MobId;

                breadcrumb.links = [{'display': 'Mobs', 'href': '/mobs/'},
                                    {'display': $scope.mob.AreaEra, 'href': '/mobs/index.html?eraId=' + $scope.mob.EraId},
                                    {'display': $scope.mob.AreaName, 'href': '/mobs/index.html?eraId=' + $scope.mob.EraId + '&areaId=' + $scope.mob.AreaId},
                                    {'display': $scope.mob.Name, 'href': '/mobs/details.html?id=' + $scope.mob.Id},
                                    {'display': $scope.mob.ModifiedOn, 'href': '', 'active': true}];

                $q.all([getMobHistoryAsync($scope.mob.MobId), getItemsAsync($scope.mob.MobId)]).then(
                    function(data) {
                        // getMobHistoryAsync
                        $scope.history = data[0].slice(0, 9);
                        for (let i = 0; i < $scope.history.length; i++) {
                            $scope.history[i].ModifiedOn = (new Date($scope.history[i].ModifiedOn + " UTC")).toString().slice(4, 24);
                        }

                        // getItemsAsync
                        $scope.items = data[1];
                        for (let i = 0; i < $scope.items.length; ++i) {
                            $scope.items[i].SlotName = $scope.slots[$scope.items[i].Slot];
                        }
                    }
                );
            }
        );
    };

    /**
     * Gets the mob data from the server.
     *
     * @param {int} id - the id of the mob history to retrieve.
     * @return {Promise} a promise containing the mob data.
     */
	var getMobAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/mobs/getMobByHistoryId.php',
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
     * @param {int} id - the id of the mob to retrieve.
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
     * Gets the items linked to this mob.
     *
     * @param {int} id - the id of the mob to get the linked items for.
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
            deferred.reject(response.data);
		});

        return deferred.promise;
	};

    /** Reverts the mob to this history version of the mob. */
	$scope.revert = function() {
		var postData = angular.copy($scope.mob);
		delete postData.MobId;
		delete postData.ModifiedOn;
		delete postData.ModifiedBy;
        delete postData.ModifiedByIP;
        
		$http({
			url: '/php/mobs/updateMob.php',
			method: 'POST',
			data: postData
		}).then(function succcessCallback(response) {
			window.location = "/mobs/details.html?id=" + $scope.mob.MobId;
		}, function errorCallback(response){
		});
	};

	initialize();
}]);
