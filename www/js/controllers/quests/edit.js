angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('quests-edit', ['$scope', '$http', '$q', 'breadcrumb', function($scope, $http, breadcrumb) {
    /** Initializes the controller. */
	var initialize = function() {
		$scope.questModel = {Content: "", Whoises: null};
		$scope.areas = [];

		$scope.getAreas();
	};

    var loadPage = function() {
        $q.all([getAreasAsync(), getQuestAsync(getUrlParameter("id"))]).then(
            function(data) {
                // getAreasAsync
			    $scope.areas = data[0];

                // getQuestAsync
                $scope.questModel = data[1];
                $scope.questModel.Aggro = Boolean($scope.questModel.Aggro);
                $scope.initialQuestModel = angular.copy($scope.questModel);

                breadcrumb.links = [{'display': 'Quests', 'href': '/quests/'},
                                    {'display': $scope.questModel.AreaEra, 'href': '/quests/index.html?eraId=' + $scope.questModel.EraId},
                                    {'display': $scope.questModel.AreaName, 'href': '/quests/index.html?eraId=' + $scope.questModel.EraId + '&areaId=' + $scope.questModel.AreaId},
                                    {'display': $scope.questModel.Title, 'href': '/quests/details.html?id=' + $scope.questModel.Id},
                                    {'display': 'Edit', 'href': '', 'active': true}];
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
     * Whether the save button should be disabled.
     *
     * @return {bool} True if the save button should be disabled.
     */
	$scope.shouldDisableSave = function() {
		return !$scope.form.$valid || angular.toJson($scope.questModel) === angular.toJson($scope.initialQuestModel);
	};

    /**
     * Updates the quest data on the server.
     *
     * @param {object} questModel - the quest data to submit to the server.
     */
	$scope.submitQuest = function(questModel) {
		if (!$scope.form.$valid || angular.toJson(questModel) === angular.toJson($scope.initialQuestModel)) {
			return;
		}

		var postData = angular.copy(questModel);
		$http({
			url: '/php/quests/updateQuest.php',
			method: 'POST',
			data: postData
		}).then(function succcessCallback(response) {
			window.location = "/quests/details.html?id=" + $scope.questModel.Id;
		}, function errorCallback(response){

		});
	}

	initialize();
}]);
