app.controller('account', ['$scope', '$http', '$q', '$cookies', function($scope, $http, $q, $cookies) {
    /** Initializes the controller */
	$scope.init = function() {
        $scope.notificationOptions = [{Value: false, Name: 'Off'},
                                      {Value: true, Name: 'On'}];
        $scope.getNotificationSettingsAsync().then(
            function (data) {
                $scope.notificationSettings = data;
            }
        );
	};

    /**
     * Gets the notification settings for the current user.
     *
     * @return {Promise} Promise object with notification settings.
     */
    $scope.getNotificationSettingsAsync = function() {
        var deferred = $q.defer();

        let query = [
            "{",
                "getNotificationSettings(authToken:\"",$cookies.get("loginToken"),"\") {",
                    "itemAdded ",
                    "itemUpdated ",
                    "mobAdded ",
                    "mobUpdated ",
                    "questAdded ",
                    "questUpdated ",
                    "wikiPageAdded ",
                    "wikiPageUpdated",
                "}",
            "}"
        ];

        $http({
			url: '/api',
            method: "POST",
            data: {query: query.join("")}
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data.data.getNotificationSettings);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
    };

    /**
     * Updates the notification settings for the current user in the DB
     * using the $scope.notificationSettings variable.
     *
     * @param {Array} settings - notificationSettings array that needs to be saved.
     */
    $scope.saveNotifications = function(settings) {
        let query = [
            "mutation {",
                "updateNotificationSettings(authToken:\"",$cookies.get("loginToken"),"\",",
                    "itemAdded:",settings.itemAdded,
                    ",itemUpdated:",settings.itemUpdated,
                    ",mobAdded:",settings.mobAdded,
                    ",mobUpdated:",settings.mobUpdated,
                    ",questAdded:",settings.questAdded,
                    ",questUpdated:",settings.questUpdated,
                    ",wikiPageAdded:",settings.wikiPageAdded,
                    ",wikiPageUpdated:",settings.wikiPageUpdated,") {",
                    "token ",
                    "expires",
                "}",
            "}"
        ];
        $http({
            url: '/api',
            method: 'POST',
            data: {query: query.join("")}
        }).then(function successCallback(response) {
            let data = response.data.data.updateNotificationSettings;
            let cookieData = {"path": "/", "samesite": "lax", "secure": true};
            if (data.expires)
                cookieData["expires"] = new Date(data.expires);

            $cookies.put("loginToken", data.token, cookieData);
            $scope.editingNotifications = false;
        }, function errorCallback(response) {
        });
    };

    /**
     * Cancels the editing of the notification settings.
     *
     * Replaces the current dirty settings with the settings from the DB.
     */
    $scope.cancelNotifications = function() {
        $scope.getNotificationSettingsAsync().then(
            function (data) {
                $scope.notificationSettings = data;
            }
        );
        $scope.editingNotifications = false;
    };

    /**
     * Checks the new passwords to see if they match and sets the validity
     * on the form if they do not.
     */
    $scope.onPasswordChanged = function() {
        $scope.editPasswordForm.confirmPasswordInput.$setValidity("matches",
            $scope.newPassword === $scope.confirmPassword);
    };

    /**
     * Checks the new passwords to see if they match and sets the validity
     * on the form if they do not.
     */
    $scope.onResetPasswordChanged = function() {
        $scope.resetPasswordForm.resetConfirmPasswordInput.$setValidity("matches",
            $scope.resetNewPassword === $scope.resetConfirmPassword);
    };

    /**
     * Updates the user's password to the $scope's new password.
     *
     * @param {string} oldPassword - The old password
     * @param {string} newPassword - The new Password
     */
    $scope.savePassword = function(oldPassword, newPassword) {
        $scope.dbfail = false;

        let query = [
            "mutation {",
                "updatePassword(authToken:\"",$cookies.get("loginToken"),"\",",
                "currentPassword:\"",oldPassword,"\",",
                "newPassword:\"",newPassword,"\") {",
                    "success ",
                    "tokenRenewal {",
                        "token ",
                        "expires",
                    "}",
                "}",
            "}"
        ];
        $http({
            url: '/api',
            method: 'POST',
            data: {query: query.join("")}
        }).then(function successCallback(response) {
            let data = response.data.data.updatePassword;
            let cookieData = {"path": "/", "samesite": "lax", "secure": true};
            if (data.tokenRenewal.expires)
                cookieData["expires"] = new Date(data.tokenRenewal.expires);

            $cookies.put("loginToken", data.tokenRenewal.token, cookieData);

            $scope.dbfail = !data.success;
            if (data.success)
                $scope.editingPassword = false;
        }, function errorCallback(response) {
            console.log(response);
            $scope.dbfail = true;
        });
    };

	$scope.init();
}]);
