app.controller('login', ['$scope', '$cookies', '$http', function($scope, $cookies, $http) {
    /** Initializes the controller */
    var initialize = function() {
        $scope.registerErrors = {};
        $scope.loginErrors = {};
    };

	$scope.checkPassword = function() {
		$scope.registerForm.confirmPasswordInput.$setValidity("match", null);

		if (($scope.registerModel.Password &&
            $scope.registerModel.ConfirmPassword) &&
            $scope.registerModel.Password != $scope.registerModel.ConfirmPassword) {
			$scope.registerForm.confirmPasswordInput.$setValidity("match", false);
		}
	}

	$scope.register = function() {
        if (!$scope.registerForm.$valid)
            return;

        $scope.registerErrors = {};
        let queryString = 'mutation{register(username:"' + $scope.registerModel.Username + '",password:"' + $scope.registerModel.Password + '")}';

		$http({
            url: "/api",
			method: 'POST',
            data: { query: queryString }
		}).then(function succcessCallback(response) {
            if (response.data.data) {
				$('#loginCollapse').collapse('show');
				$('#registerCollapse').collapse('hide');
            }
		}, function errorCallback(response){
            if (response.data.errors) {
                $scope.registerErrors = response.data.errors;
            }
		});
	};

	$scope.login = function() {
        $scope.loginErrors = {};
        let stayLoggedIn = !!$scope.loginModel.StayLoggedIn;

        let queryString =
            'mutation{authLogin(username:"' + $scope.loginModel.Username +
            '",password:"' + $scope.loginModel.Password +
            '",stayLoggedIn:' + stayLoggedIn + ') {' +
            'token\n' +
            'expires' +
            '}}';

		$http({
			url: '/api',
			method: 'POST',
			data: { query: queryString }
		}).then(function succcessCallback(response) {
            if (response.data.data) {
                let data = response.data.data;
                if (data.authLogin.token && $cookies.get("cookie-consent")) {
                    let cookieData = {"path": "/", "samesite": "lax", "secure": true};
                    if (stayLoggedIn)
                        cookieData["expires"] = data.authLogin.expires;

                    $cookies.put("loginToken", data.authLogin.token, cookieData);
                }

                let returnUrl = getUrlParameter("returnUrl");
                if (returnUrl)
                    window.location = returnUrl;
                else
                    window.location = "/";
            }
        }, function errorCallback(response) {
            if (response.data.errors) {
                $scope.loginErrors = response.data.errors;
            }
        });
	};

    initialize();
}]);
