angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('quests-history', ['$scope', '$http', '$q', 'itemConstants', 'breadcrumb', function($scope, $http, $q, itemConstants, breadcrumb) {
    /** Initializes the controller. */
    var initialize = function() {
		$scope.slots = itemConstants.slots;

        loadPage();
	};

    /** Runs the necessary async functions before displaying the page. */
    var loadPage = function() {
        var id = getUrlParameter("id");
        getQuestAsync(getUrlParameter("id")).then(
            function(data) {
                // getQuestAsync
                $scope.quest = data;
                $scope.quest.ModifiedOn = (new Date($scope.quest.ModifiedOn + " UTC")).toString().slice(4, 24);
                $scope.quest.Stat = Boolean($scope.quest.Stat);
                $scope.quest.Id = $scope.quest.QuestId;

                breadcrumb.links = [{'display': 'Quests', 'href': '/quests/'},
								{'display': $scope.quest.AreaEra, 'href': '/quests/index.html?eraId=' + $scope.quest.EraId},
								{'display': $scope.quest.AreaName, 'href': '/quests/index.html?eraId=' + $scope.quest.EraId + '&areaId=' + $scope.quest.AreaId},
								{'display': $scope.quest.Title, 'href': '/quests/details.html?id=' + $scope.quest.Id},
								{'display': $scope.quest.ModifiedOn, 'href': '', 'active': true}];

		        $scope.whoises = $scope.quest.Whoises.split(';');

                $q.all([getQuestHistoryAsync($scope.quest.QuestId), getItemsAsync($scope.quest.QuestId)]).then(
                    function(data) {
                        // getQuestHistoryAsync
                        $scope.history = data[0].slice(0, 9);
                        for (let i = 0; i < $scope.history.length; ++i) {
                            $scope.history[i].ModifiedOn = (new Date($scope.history[i].ModifiedOn + " UTC")).toString().slice(4, 24);
                        }

                        // getItemsAsync
                        $scope.items = data[1];
                        for (var i = 0; i < $scope.items.length; ++i) {
                            $scope.items[i].SlotName = $scope.slots[$scope.items[i].Slot];
                        }
                    }
                );
            }
        );

    };

    /**
     * Gets the history quest information from the server.
     *
     * @param {int} id - the history id of the quest to get.
     * @return {Promise} a promise containing the quest data.
     */
    var getQuestAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/quests/getQuestByHistoryId.php',
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
     * Gets the quest history information from the server.
     *
     * @param {int} id - the id of the quest to get history information about.
     * @return {Promise} a promise containing the history data for the quest.
     */
	var getQuestHistoryAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/quests/getQuestHistory.php',
			method: 'POST',
			data: {"id": $scope.quest.QuestId}
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Gets the items linked to the current quest.
     *
     * @param {int} id - the id of the quest to get the items for.
     * @return {Promise} a promise containing the items data.
     */
	var getItemsAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItemsByQuestId.php',
			method: 'POST',
			data: {"QuestId": $scope.quest.QuestId}
		}).then(function successCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response) {
            deferred.reject(response);
		});

        return deferred.promise;
	};

	$scope.revert = function() {
		var postData = angular.copy($scope.quest);
		delete postData.QuestId;
		delete postData.ModifiedOn;
		delete postData.ModifiedBy;
		delete postData.ModifiedByIP;
		delete postData.ModifiedByIPForward;
		$http({
			url: '/php/quests/updateQuest.php',
			method: 'POST',
			data: postData
		}).then(function succcessCallback(response) {
			window.location = "/quests/details.html?id=" + $scope.quest.QuestId;
		}, function errorCallback(response){

		});
	}

	initialize();
}]);
