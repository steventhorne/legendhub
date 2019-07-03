app.controller('mobs', ['$scope', '$http', '$q', 'categories', function($scope, $http, $q, categories) {
    /**
     * Event for when a mob is clicked in the search view.
     *
     * @param {object} item - the mob that was clicked.
     */
	$scope.onMobClicked = function(id) {
		window.location = "/mobs/details.html?id=" + id;
	};

    /**
     * Event for when a column header is clicked on the search result table.
     *
     * @param {string} the variable name of the stat that was clicked.
     */
	$scope.onColumnHeaderClicked = function(url) {
        window.location = url;
	};
}]);
