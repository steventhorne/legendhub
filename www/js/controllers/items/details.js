angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('items-details', ['$scope', '$http', '$q', 'itemConstants', 'breadcrumb', function($scope, $http, $q, itemConstants, breadcrumb) {
    /** Initializes the controller. */
    var initialize = function() {
        $scope.slots = itemConstants.selectOptions.Slot;
        $scope.aligns = itemConstants.selectOptions.AlignRestriction;
        $scope.selectShortOptions = itemConstants.selectShortOptions;

        loadPage();
    };

    /** Calls the async functions needed before displaying the page. */
    var loadPage = function() {
        $q.all([getStatCategoriesAsync(), getStatInfoAsync()]).then(
            function(data) {
                $scope.statCategories = data[0];
                $scope.statInfo = data[1];

                var id = getUrlParameter("id");
                $q.all([getItemAsync(id), getItemHistoryAsync(id)]).then(
                    function(data) {
                        $scope.item = data[0];

                        if (data[0] == null) {
                            breadcrumb.links = [{'display': 'Items', 'href': '/items/'},
                                                {'display': 'Not Found', 'href': '', 'active': true}];
                            return;
                        }

                        // response for getItemAsync
                        $scope.item.ModifiedOn = (new Date($scope.item.ModifiedOn + " UTC")).toString().slice(4, 24);

                        breadcrumb.links = [{'display': 'Items', 'href': '/items/'},
                                            {'display': $scope.slots[$scope.item.Slot], 'href': '/items/index.html?slotId=' + $scope.item.Slot},
                                            {'display': $scope.item.Name, 'href': '', 'active': true}];

                        // response for getItemHistoryAsync
                        $scope.history = data[1].slice(0, 9);

                        var i;
                        for (i = 0; i < $scope.history.length; i++) {
                            $scope.history[i].ModifiedOn = (new Date($scope.history[i].ModifiedOn + " UTC")).toString().slice(4, 24);
                        }

		                if ($scope.item.MobId && $scope.item.MobId >= 0) {
                            getMobAsync($scope.item.MobId).then(
                                function(data) {
                                    $scope.mob = data;
                                }
                            );
                        }

		                if ($scope.item.QuestId && $scope.item.QuestId >= 0) {
                            getQuestAsync($scope.item.QuestId).then(
                                function(data) {
                                    $scope.quest = data;
                                }
                            );
                        }
                    }
                );
            }
        );
    };

    /**
     * Gets the stat category information from the server.
     *
     * @return {Promise} a promise containing the category information.
     */
    var getStatCategoriesAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItemCategories.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
    };

    /**
     * Gets the stat information from the server.
     *
     * @return {Promise} a promise containing the stat information.
     */
	var getStatInfoAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItemStats.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Gets the item from the server with the given Id.
     *
     * @param {int} id - the id of the item needed.
     * @return {Promise} a promise containing the data for the requested item.
     */
	var getItemAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItem.php',
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
     * Gets the history for the given item.
     *
     * @param {int} id - the id of the item to get the history for.
     * @return {Promise} a promise containing the history data for the item.
     */
	var getItemHistoryAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItemHistory.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Gets the mob for the given mobId
     *
     * @param {int} mobId - the id of the mob to retrieve.
     * @return {Promise} a promise containing the mob data.
     */
	var getMobAsync = function(mobId) {
        var deferred = $q.defer();

        $http({
            url: '/php/mobs/getMob.php',
            method: 'POST',
            data: {"id": $scope.item.MobId}
        }).then(function successCallback(response) {
            deferred.resolve(response.data);
        }, function errorCallback(response){
            deferred.reject(response);
        });

        return deferred.promise;
	};

    /**
     * Gets the quest for the given questId
     *
     * @param {int} questId - the id of the quest to retrieved.
     * @return {Promise} a promise containing the quest data.
     */
	var getQuestAsync = function(questId) {
        var deferred = $q.defer();

        $http({
            url: '/php/quests/getQuest.php',
            method: 'POST',
            data: {"id": $scope.item.QuestId}
        }).then(function successCallback(response) {
            deferred.resolve(response.data);
        }, function errorCallback(response){
            deferred.reject(response);
        });

        return deferred.promise;
	};

    /**
     * Gets whether the stat should be shown for an item.
     *
     * @param {object} item - the item in question.
     * @param {string} stat - the stat in question.
     * @return {bool} true if the stat should be shown.
     */
	$scope.shouldShowStat = function(item, stat) {
        if (stat == undefined ||
            stat['var'] === "Slot" ||
            stat['var'] === "Name" ||
            stat['var'] === "AlignRestriction" ||
            stat['var'] === "Strength" ||
            stat['var'] === "Mind" ||
            stat['var'] === "Dexterity" ||
            stat['var'] === "Constitution" ||
            stat['var'] === "Perception" ||
            stat['var'] === "Spirit" ||
            stat['var'] === "Ac" ||
            stat['var'] === "Value" ||
            stat['var'] === "UniqueWear" ||
            stat['var'] === "Rent" ||
            stat['var'] === "NetStat") {
            return false;
        }

		if (stat['type'] === 'int' || stat['type'] == 'bool') {
			return item != 0;
		}

		if (stat['type'] === 'string') {
			return item != '' && item != null;
		}

        if (stat['type'] === 'select') {
            return item != null && item >= 0;
        }

		return false;
	};

	initialize();
}]);
