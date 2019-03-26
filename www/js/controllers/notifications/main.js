angular.module("legendwiki-app").requires.push('ngSanitize');

app.controller('notifications', ['$scope', '$http', '$sanitize', '$q', function($scope, $http, $sanitize, $q) {
    /** Initializes the controller. */
	var initialize = function() {
        loadPage();
	};

    /** Calls the async functions needed before the page can be shown. */
    var loadPage = function() {
        getNotificationsAsync().then(
            function(data) {
                $scope.allNotifications = data;

                for (var i = 0; i < $scope.allNotifications.length; ++i) {
                    var objectId = $scope.allNotifications[i].ObjectId;
                    var objectPage = $scope.allNotifications[i].ObjectPage;
                    var objectType = $scope.allNotifications[i].ObjectType.charAt(0).toUpperCase() + $scope.allNotifications[i].ObjectType.slice(1);
                    var objectName = "<span class='text-primary'>" + $scope.allNotifications[i].ObjectName + "</span>";
                    var verb = $scope.allNotifications[i].Verb;

                    var message = objectType + " " + objectName + " has been " + verb;
                    if ($scope.allNotifications[i].Count > 1) {
                        message += " " + $scope.allNotifications[i].Count + " times.";
                    }
                    else {
                        message += " by " + $scope.allNotifications[i].MemberName;
                    }

                    $scope.allNotifications[i].Message = message;
                    $scope.allNotifications[i].CreatedOnDate = (new Date($scope.allNotifications[i].CreatedOn + "Z")).toString().slice(4, 15);
                    $scope.allNotifications[i].CreatedOnTime = (new Date($scope.allNotifications[i].CreatedOn + "Z")).toString().slice(16, 24);
                    if ($scope.allNotifications[i].ObjectPage && $scope.allNotifications[i].ObjectId) {
                        $scope.allNotifications[i].Link = "/" + objectPage + "/details.html?id=" + objectId;
                    }
                    else {
                        $scope.allNotifications[i].Link = "";
                    }
                }
            }
        );
    };

    /**
     * Gets the notification list for the current member from the server.
     *
     * @return {Promise} a promise containing the notification list data.
     */
    var getNotificationsAsync = function() {
        var deferred = $q.defer();

        $http({
			url: '/php/account/getAllNotificationsForMember.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
    }

	initialize();
}]);
