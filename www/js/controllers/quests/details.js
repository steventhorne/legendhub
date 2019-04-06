angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('quests-details', ['$scope', '$http', '$q', 'itemConstants', 'breadcrumb', function($scope, $http, $q, itemConstants, breadcrumb) {
    /** Initializes the controller. */
    var initialize = function() {
		$scope.slots = itemConstants.slots;

        loadPage();
	};

    /** Calls the async functions needed to display the page. */
    var loadPage = function() {
        var id = getUrlParameter("id");
        $q.all([getQuestAsync(id), getQuestHistoryAsync(id), getItemsAsync(id)]).then(
            function(data) {
                // getQuestAsync
                $scope.quest = data[0];

                if (data[0] == null) {
                    breadcrumb.links = [{'display': 'Quests', 'href': '/quests/'},
                                        {'display': 'Not Found', 'href': '', 'active': true}];

                    return;
                }

                $scope.quest.ModifiedOn = (new Date($scope.quest.ModifiedOn + "Z")).toString().slice(4, 24);
                $scope.quest.Stat = Boolean($scope.quest.Stat);

                breadcrumb.links = [{'display': 'Quests', 'href': '/quests/'},
                                    {'display': $scope.quest.AreaEra, 'href': '/quests/index.html?eraId=' + $scope.quest.EraId},
                                    {'display': $scope.quest.AreaName, 'href': '/quests/index.html?eraId=' + $scope.quest.EraId + '&areaId=' + $scope.quest.AreaId},
                                    {'display': $scope.quest.Title, 'href': '', 'active': true}];

                $scope.whoises = $scope.quest.Whoises.split(';');

                // getQuestHistoryAsync
                $scope.history = data[1].slice(0, 9);
                for (let i = 0; i < $scope.history.length; i++) {
                    $scope.history[i].ModifiedOn = (new Date($scope.history[i].ModifiedOn + "Z")).toString().slice(4, 24);
                }

                // getItemsAsync
                $scope.items = data[2];
                for (var i = 0; i < $scope.items.length; ++i) {
                    $scope.items[i].SlotName = $scope.slots[$scope.items[i].Slot];
                }
            }
        );
    };

    /**
     * Gets the quest data from the server.
     *
     * @param {int} id - the id of the quest to retrieve.
     * @return {Promise} a promise containing the quest data.
     */
	var getQuestAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/quests/getQuest.php',
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
     * Gets the quest history from the server.
     *
     * @param {int} id - the id of the quest to retrieve the history for.
     * @return {Promise} a promise containing the array of quest history data.
     */
	var getQuestHistoryAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/quests/getQuestHistory.php',
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
     * Gets the items for a quest.
     *
     * @param {int} id - the id of the quest to retrieve the items for.
     * @return {Promise} a promise containing the item array data.
     */
	var getItemsAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItemsByQuestId.php',
			method: 'POST',
			data: {"QuestId": id}
		}).then(function successCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response) {
            deferred.reject(response);
		});

        return deferred.promise;
	};

	initialize();
}]);
