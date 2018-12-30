// http interceptor to redirect all 401/403 responses to the 401 page
app.factory('unauthorizedInterceptor', function($q) {
	return {
		responseError(response) {
			if (response.status === 401 || response.status === 403) {
				window.location = '/error/401.html';
			}

			return $q.reject(response);
		}
	};
}).config(function($httpProvider) {
	$httpProvider.interceptors.push('unauthorizedInterceptor');
});

// http interceptors for restoring logins
app.factory('httpRequestInterceptor', function($cookies) {
    return {
        request: function (config) {
            var loginToken = $cookies.get("loginToken");
			if (loginToken) {
                config.headers['login-token'] = loginToken;
			}

            return config;
        }
    }
}).config(function($httpProvider) {
	$httpProvider.interceptors.push('httpRequestInterceptor');
});

app.factory('httpResponseInterceptor', function($cookies) {
    return {
        response: function(response) {
            var token = response.headers('login-token');
            if (token) {
                var cookieDate = new Date();
				cookieDate.setDate(cookieDate.getDate() + 30);
				$cookies.put("loginToken", token, {"path": "/", 'expires': cookieDate});
                console.log("Login restored.");
            }
            return response;
        }
    }
}).config(function($httpProvider) {
	$httpProvider.interceptors.push('httpResponseInterceptor');
});

app.factory('permissions', ['$http', '$q', function($http, $q) {
	function Permissions()
	{
		this.allPermissions = [];
		this.retrieved = false;
	}

	Permissions.prototype._check = function(permissionName, mustCreate, mustRead, mustUpdate, mustDelete) {
		// allPerms will be empty if the user is not logged in.
		if (this.allPermissions.length == 0) {
			return false;
		}

		var canCreate, canRead, canUpdate, canDelete;
		canCreate = canRead = canUpdate = canDelete = false;
		for (var i = 0; i < this.allPermissions.length; ++i) {
			if (this.allPermissions[i].Name != permissionName) {
				continue;
			}

			canCreate |= this.allPermissions[i].Create;
			canRead |= this.allPermissions[i].Read;
			canUpdate |= this.allPermissions[i].Update;
			canDelete |= this.allPermissions[i].Delete;
		}

		return !((mustCreate && !canCreate) ||
		    (mustRead && !canRead) ||
		    (mustUpdate && !canUpdate) ||
		    (mustDelete && !canDelete));
	}

	/** @description Sets the options for the category service.
	 * @param {string} permissionName The name of the permission. Can be left blank to only check logged-in status.
	 * @param {boolean} mustCreate Checks if the user has create privileges for this permission.
	 * @param {boolean} mustRead Checks if the user has read privileges for this permission.
	 * @param {boolean} mustUpdate Checks if the user has update privileges for this permission.
	 * @param {boolean} mustDelete Checks if the user has delete privileges for this permission.
	*/
	Permissions.prototype.checkAsync = function(permissionName, mustCreate, mustRead, mustUpdate, mustDelete) {
		return $q((resolve, reject) => {
			if (this.retrieved) {
				resolve(this._check(permissionName, mustCreate, mustRead, mustUpdate, mustDelete));
			}
			else {
				if (!this.retrievePromise) {
					this.retrievePromise = $http({
						url: '/php/common/getPermissions.php'
					});
				}

				// 'this' no longer refers to the Permissions object once inside the callback
				var thisPerm = this;
				this.retrievePromise.then(function successCallback(response) {
					thisPerm.allPermissions = response.data;
					thisPerm.retrieved = true;
					resolve(thisPerm._check(permissionName, mustCreate, mustRead, mustUpdate, mustDelete));
				}, function errorCallback(response) {
					reject(response);
				});
			}
		});
	}

	return new Permissions();
}]);

// This directive is used to check the permissions of the user and hide html based on that check
// lhPermName: If supplied, will check if the user has access to a certain permission, otherwise will only check if the user is logged in
// lhPermCreate: If supplied, will check if the user has create permissions for the lhPermName
// lhPermRead: If supplied, will check if the user has read permissions for the lhPermName
// lhPermUpdate: If supplied, will check if the user has update permissions for the lhPermName
// lhPermDelete: If supplied, will check if the user has delete permissions for the lhPermName
// lhPermInverse: If supplied, will inverse the hiding of the html based on the permission check (useful for showing a section if the permission check fails)
// lhPermRedirect: If supplied, will redirect the user to the 401 page if the check fails
app.directive('lhPermCheck', ['$http', 'permissions', function($http, permissions) {
	return {
		restrict: 'E',
		scope: {
			lhPermName: "@",
		},
		compile: function(tElement, tAttributes) {
			tElement.addClass("ng-cloak"); // just in case

			return {
				// use pre-link to add ng-cloak immediately after angular usually
				// removes it. Then remove cloak after we get a response back.
				pre: function($scope, $element, $attrs) {
					$element.addClass("ng-cloak");

					var permCreate = $attrs.hasOwnProperty('lhPermCreate');
					var permRead = $attrs.hasOwnProperty('lhPermRead');
					var permUpdate = $attrs.hasOwnProperty('lhPermUpdate');
					var permDelete = $attrs.hasOwnProperty('lhPermDelete');
					var permInverse = $attrs.hasOwnProperty('lhPermInverse');
					var permRedirect = $attrs.hasOwnProperty('lhPermRedirect');

					permissions.checkAsync($scope.lhPermName, permCreate, permRead, permUpdate, permDelete)
						.then(function successCallback(response) {
						// xnor check on result and inverse attr
						if (permInverse === response) {
							$element.remove();
						}

						if (permRedirect && !response) {
							window.location = "/error/401.html";
						}
						$element.removeClass("ng-cloak");
					});
				}
			}
		}
	}
}]);
