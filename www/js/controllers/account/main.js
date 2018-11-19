app.controller('account', ['$scope', '$http', '$q', function($scope, $http, $q) {
    /** Initializes the controller */
	$scope.init = function() {
        $scope.notificationOptions = [{Value: 0, Name: 'Off'},
                                      {Value: 1, Name: 'On'}];
        $scope.getNotificationSettingsAsync().then(
            function (data) {
                $scope.notificationSettings = data;
            });
	}

    /**
     * Gets the notification settings for the current user.
     *
     * @return {Promise} Promise object with notification settings.
     */
    $scope.getNotificationSettingsAsync = function() {
        var deferred = $q.defer();

        $http({
			url: '/php/account/getNotificationSettings.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
    }

    /**
     * Updates the notification settings for the current user in the DB
     * using the $scope.notificationSettings variable.
     *
     * @param {Array} settings - notificationSettings array that needs to be saved.
     */
    $scope.saveNotifications = function(settings) {
        $http({
            url: '/php/account/updateNotificationSettings.php',
            method: 'POST',
            data: settings
        }).then(function successCallback(response) {
            $scope.editingNotifications = false;
        }, function errorCallback(response) {
        });
    }

    /**
     * Cancels the editing of the notification settings.
     *
     * Replaces the current dirty settings with the settings from the DB.
     */
    $scope.cancelNotifications = function() {
        $scope.getNotificationSettingsAsync();
        $scope.editingNotifications = false;
    }

    /**
     * Checks the new passwords to see if they match and sets the validity
     * on the form if they do not.
     */
    $scope.onPasswordChanged = function() {
        $scope.editPasswordForm.confirmPasswordInput.$setValidity("matches",
            $scope.newPassword === $scope.confirmPassword);
    }

    /**
     * Updates the user's password to the $scope's new password.
     *
     * @param {string} oldPassword - The old password
     * @param {string} newPassword - The new Password
     */
    $scope.savePassword = function(oldPassword, newPassword) {
        $scope.dbfail = false;
        $http({
            url: '/php/account/updatePassword.php',
            method: 'POST',
            data: {'oldPassword': oldPassword,
                    'newPassword': newPassword}
        }).then(function successCallback(response) {
            $scope.dbfail = !response.data.success;
            if (response.success) {
                $scope.editingPassword = false;
            }
        }, function errorCallback(response) {
        });
    }

	$scope.init();
}]);
