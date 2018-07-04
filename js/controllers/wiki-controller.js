app.controller('wiki-controller', function($scope, $cookies, $http) {
	$scope.initialize = function() {
		$scope.getRecentWikiPages();
	}

	$scope.getRecentWikiPages = function() {
		$http({
			url: '/php/wiki/getRecentWikiPages.php'
		}).then(function succcessCallback(response) {
			
		}, function errorCallback(response) {

		});
	}

	$scope.initialize();
});
