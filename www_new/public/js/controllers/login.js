app.controller('login', ['$scope', '$cookies', '$http', function($scope, $cookies, $http) {
    /** Initializes the controller */
    var initialize = function() {
	    $scope.registerFailed = false;
	    $scope.loginFailed = false;
    };

	$scope.checkUsername = function() {
		$scope.registerForm.usernameInput.$setValidity("length", null);
		$scope.registerForm.usernameInput.$setValidity("taken", null);
		if ($scope.registerModel.Username == '') {
			return;
		}
		$http({
			url: '/php/login/checkUsername.php',
			method: 'POST',
			data: $scope.registerModel
		}).then(function succcessCallback(response) {
			$scope.registerForm.usernameInput.$setValidity(response.data.reason, response.data.success);
		}, function errorCallback(response){

		});
	}

	$scope.checkPassword = function() {
		$scope.registerForm.passwordInput.$setValidity("length", null);
		$scope.registerForm.confirmPasswordInput.$setValidity("length", null);
		$scope.registerForm.confirmPasswordInput.$setValidity("match", null);

		if ($scope.registerModel.Password && $scope.registerModel.Password.length > 0 && $scope.registerModel.Password.length < 8) {
			$scope.registerForm.passwordInput.$setValidity("length", false);
		}
		if ( $scope.registerModel.ConfirmPassword && $scope.registerModel.ConfirmPassword.length > 0 && $scope.registerModel.ConfirmPassword.length < 8) {
			$scope.registerForm.confirmPasswordInput.$setValidity("length", false);
		}
		if ($scope.registerModel.Password && $scope.registerModel.ConfirmPassword && $scope.registerModel.Password.length > 0 && $scope.registerModel.ConfirmPassword.length > 0 && $scope.registerModel.Password != $scope.registerModel.ConfirmPassword) {
			$scope.registerForm.confirmPasswordInput.$setValidity("match", false);
		}
	}

	$scope.register = function() {
		$scope.registerFailed = false;
		$http({
			url: '/php/login/register.php',
			method: 'POST',
			data: $scope.registerModel
		}).then(function succcessCallback(response) {
			if (response.data.success) {
				$('#loginCollapse').collapse('show');
				$('#registerCollapse').collapse('hide');
			}
			else {
				$scope.registerFailed = true;
			}
		}, function errorCallback(response){

		});
	}

	$scope.login = function() {
		$scope.loginMessages = {};

        let queryString =
            '{authLogin(username:"' + $scope.loginModel.Username +
            '",Password:"' + $scope.loginModel.Password +
            '",stayLoggedIn:' + $scope.loginModel.StayLoggedIn + ')}';

		$http({
			url: '/api',
			method: 'POST',
			data: { query: queryString }
		}).then(function succcessCallback(response) {
            if (response.data.errors) {
                $scope.loginMessages = response.data.errors;
            }
            else if (response.data.data) {
                let data = response.data.data;
                if (data.authLogin.token && $cookies.get("cookie-consent"))
                    $cookies.put("loginToken", data.authLogin.token, {"path": "/", "expires": data.authLogin.expires});

                let returnUrl = getUrlParameter("returnUrl");
                if (returnUrl)
                    window.location = returnUrl;
                else
                    window.location = "/";
            }
		})
	}

    initialize();
}]);
