app.controller('account', ['$scope', '$http', function($scope, $http) {
    /** Initializes the controller */
	$scope.init = function() {
        $scope.notificationOptions = [{Value: 0, Name: 'Off'},
                                      {Value: 1, Name: 'On'}];
        $scope.getNotificationSettingsAsync();
	}

    /** Gets the notification settings for the current user.
     *
     * Gets the settings from the db and fills them into the
     * $scope.notificationSettings variable.
     */
    $scope.getNotificationSettingsAsync = function() {
        $http({
			url: '/php/account/getNotificationSettings.php'
		}).then(function succcessCallback(response) {
            $scope.notificationSettings = response.data;
		}, function errorCallback(response){

		});
    }

    /** Updates the notification settings for the current user in the DB
     * using the $scope.notificationSettings variable.
     */
    $scope.saveNotifications = function() {
        $http({
            url: '/php/account/updateNotificationSettings.php',
            method: 'POST',
            data: $scope.notificationSettings
        }).then(function successCallback(response) {
            $scope.editingNotifications = false;
        }, function errorCallback(response) {
        });
    }

    /** Cancels the editing of the notification settings.
     *
     * Replaces the current dirty settings with the settings from the DB.
     */
    $scope.cancelNotifications = function() {
        $scope.getNotificationSettingsAsync();
        $scope.editingNotifications = false;
    }

    /** Checks the new passwords to see if they match and sets the validity
     * on the form if they do not.
     */
    $scope.onPasswordChanged = function() {
        $scope.editPasswordForm.confirmPasswordInput.$setValidity("matches",
            $scope.newPassword === $scope.confirmPassword);
    }

    /** Updates the user's password to the $scope's new password. */
    $scope.savePassword = function() {
        $scope.dbfail = false;
        $http({
            url: '/php/account/updatePassword.php',
            method: 'POST',
            data: {'oldPassword': $scope.oldPassword,
                    'newPassword': $scope.newPassword}
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
