app.controller('header', ['$scope', '$http', '$cookies', 'breadcrumb', function($scope, $http, $cookies, breadcrumb) {
	$scope.initialize = function() {
        $scope.themes = ['Light', 'Dark', 'Solarized Dark'];
		$scope.bcFactory = breadcrumb;
		$scope.returnUrl = window.location.pathname + window.location.search;
	}

	$scope.logout = function() {
		$http({
			url: '/php/login/logout.php'
		}).then(function succcessCallback(response) {
			window.location = "/";
		});
	}

	$scope.setTheme = function(theme) {
        if ($cookies.get("cookie-consent")) {
            theme = theme.toLowerCase().replace(/\s/g, '-');
            var cookieDate = new Date();
            cookieDate.setFullYear(cookieDate.getFullYear() + 20);
            $cookies.put("theme", theme, {"path": "/", 'expires': cookieDate});
            $('link[id="theme"]').attr('href', '/css/bootstrap-' + theme + '.min.css?%%version%%');
        }
	}

    /**
     * @deprecated used for old theme toggle
     */
	$scope.toggleTheme = function() {
		var theme = $cookies.get("theme");
		if (!theme || theme == "light") {
			theme = "dark";
		}
		else {
			theme = "light";
		}
		$scope.setTheme(theme);
	}

    /**
     * @deprecated used for old theme toggle
     */
	$scope.getThemeClass = function() {
		var theme = $cookies.get("theme");
		if (!theme || theme == "light") {
			return "fas fa-lightbulb text-warning fa-lg"
		}
		else {
			return "fas fa-lightbulb fa-lg";
		}
	}

    $scope.getNotifications = function() {
        $http({
            url: '/php/account/getUnreadNotificationsForMember.php',
        }).then(function successCallback(response) {
            $scope.notifications = response.data;

            var currentPageIsInNotifications = false;
            for (var i = 0; i < $scope.notifications.length; ++i) {
                var objectId = $scope.notifications[i].ObjectId;
                var objectPage = $scope.notifications[i].ObjectPage;
                var objectType = $scope.notifications[i].ObjectType.charAt(0).toUpperCase() + $scope.notifications[i].ObjectType.slice(1);
                var objectName = "<span class='text-primary'>" + $scope.notifications[i].ObjectName + "</span>";
                var verb = $scope.notifications[i].Verb;

                var message = objectType + " " + objectName + " has been " + verb;
                if ($scope.notifications[i].Count > 1) {
                    message += " " + $scope.notifications[i].Count + " times.";
                }
                else {
                    message += " by " + $scope.notifications[i].MemberName;
                }

                $scope.notifications[i].Message = message;
                $scope.notifications[i].CreatedOnDate = (new Date($scope.notifications[i].CreatedOn + "Z")).toString().slice(4, 15);
                $scope.notifications[i].CreatedOnTime = (new Date($scope.notifications[i].CreatedOn + "Z")).toString().slice(16, 24);
                if ($scope.notifications[i].ObjectPage && $scope.notifications[i].ObjectId) {
                    $scope.notifications[i].Link = "/" + objectPage + "/details.html?id=" + objectId;
                }
                else {
                    $scope.notifications[i].Link = "";
                }

                // check if notification points to current page
                var path = window.location.pathname + window.location.search;
                if (!currentPageIsInNotifications && path === $scope.notifications[i].Link) {
                    $scope.notifications.splice(i, 1);
                    --i;
                    currentPageIsInNotifications = true;

                    // tell server to mark notifications as read
                    $scope.markNotificationsAsRead(objectType, objectId)
                }
            }
        }, function errorCallback(response) {

        });
    }

    $scope.markNotificationsAsRead = function(objectType, objectId) {
        $http({
			url: '/php/account/markNotificationsAsRead.php',
            method: 'POST',
            data: { all: false, objectType: objectType, objectId: objectId }
		}).then(function succcessCallback(response) {
		});
    }

    $scope.markAllNotificationsAsRead = function() {
        $http({
            url: '/php/account/markNotificationsAsRead.php',
            method: 'POST',
            data: { all: true }
        }).then(function successCallback(response) {
            $scope.notifications = [];
        });
    }

    $scope.getNotificationContent = function() {
        if (!$scope.notifications) {
            return "";
        }

        if ($scope.notifications.length > 0) {
            var text = "<p class='text-center'>" + $scope.notifications.length + " unread notifications.</p>";

        }
        else {
            var text = "<p class='text-center'>No unread notifications.</p>";
        }

        text += "<span class='d-flex justify-content-between'><a class='px-1' href='/notifications/'>View all</a>|<a class='px-1' href='' ng-click='markAllNotificationsAsRead()'>Mark all as read</a>|<a class='px-1' href='/account/'>Settings</a></span>";

        if ($scope.notifications.length > 0) {
            text += "<div class='list-group' style='max-height:50vh;overflow-y:scroll'>";
            for (var i = 0; i < $scope.notifications.length; ++i) {
                text += "<a href='" + $scope.notifications[i].Link + "' class='list-group-item list-group-item-action flex-column align-items-stretch'>" +
                    "<div class='d-flex w-100 justify-content-between'>" +
                        "<p class='mr-3'>" + $scope.notifications[i].Message + "</p>" +
                        "<div class='text-info'>" +
                            "<p class='mb-0' style='white-space:nowrap'><small>" + $scope.notifications[i].CreatedOnDate + "</small></p>" +
                            "<p style='white-space:nowrap'><small>" + $scope.notifications[i].CreatedOnTime + "</small></p>" +
                        "</div>" +
                    "</div>" +
                "</a>";
            }
            text += "</div>";
        }

        return text;
    }

	$scope.initialize();
}]);
