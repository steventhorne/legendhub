app.controller('header-controller', function($scope, $http) {
	$scope.returnUrl = window.location.pathname;
	$scope.getLoggedInUser = function() {
		$http({
			url: '/php/login/getLoggedInUser.php'
		}).then(function succcessCallback(response) {
			if (response.data.success) {
				$scope.currentUser = response.data.username;
			}
		})
	}

	$scope.logout = function() {
		$http({
			url: '/php/login/logout.php'
		}).then(function succcessCallback(response) {
			window.location = "/";
		})
	}

	$scope.getLoggedInUser();
});