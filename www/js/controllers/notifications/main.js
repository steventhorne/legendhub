angular.module("legendwiki-app").requires.push('ngSanitize');

app.controller('notifications', function($scope, $http, $sanitize) {
	$scope.init = function() {
        $scope.getNotifications();
	}

    $scope.getNotifications = function() {
        $http({
			url: '/php/account/getAllNotificationsForMember.php'
		}).then(function succcessCallback(response) {
            $scope.allNotifications = response.data;

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
                $scope.allNotifications[i].CreatedOnDate = (new Date($scope.allNotifications[i].CreatedOn + " UTC")).toString().slice(4, 15);
                $scope.allNotifications[i].CreatedOnTime = (new Date($scope.allNotifications[i].CreatedOn + " UTC")).toString().slice(16, 24);
                if ($scope.allNotifications[i].ObjectPage && $scope.allNotifications[i].ObjectId) {
                    $scope.allNotifications[i].Link = "/" + objectPage + "/details.html?id=" + objectId;
                }
                else {
                    $scope.allNotifications[i].Link = "";
                }
            }
		}, function errorCallback(response){

		});
    }

	$scope.init();
});
