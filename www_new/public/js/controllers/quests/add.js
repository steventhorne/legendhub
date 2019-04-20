angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('quests-add', ['$scope', '$http', '$q', 'breadcrumb', function($scope, $http, $q, breadcrumb) {
    /** Initializes the controller. */
	var initialize = function() {
		$scope.questModel = {Content: "", Whoises: null, Stat: false};
		$scope.areas = [];

		breadcrumb.links = [{'display': 'Quests', 'href': '/quests/'},
						{'display': 'Add', 'href': '', 'active': true}];

        loadPage();
	};

    /** Calls the async functions needed to display the page. */
    var loadPage = function() {
        getAreasAsync().then(
            function(data) {
			    $scope.areas = data;
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
			url: '/php/mobs/getAreas.php',
		}).then(function successCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response) {
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Submits the new quest to the server.
     *
     * @param {object} questModel - the quest data to submit.
     */
	$scope.submitQuest = function(questModel) {
		$http({
			url: '/php/quests/insertQuest.php',
			method: 'POST',
			data: questModel
		}).then(function succcessCallback(response) {
			window.location = "/quests/details.html?id=" + response.data;
		}, function errorCallback(response){
		});
	};

    initialize();
}]);
