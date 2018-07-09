var app = angular.module( "legendwiki-app", ['ngCookies'] );
  
app.constant('test', 'hi');
app.constant('itemConstants', {
	slots: ["Light",
	"Finger",
	"Neck",
	"Body",
	"Head",
	"Face",
	"Legs",
	"Feet",
	"Hands",
	"Arms",
	"Shield",
	"About",
	"Waist",
	"Wrist",
	"Wield",
	"Hold",
	"Ear",
	"Arm",
	"Amulet",
	"Aux",
	"Familiar",
	"Other"],
	aligns: ["No Align Restriction",
			 "Good Only Align",
			 "Neutral Only Align",
			 "Evil Only Align",
			 "Non-Good Align",
			 "Non-Neutral Align",
			 "Non-Evil Align"],
});

app.directive('lhTheme', function() {
	return {
		link: function (scope, element, attrs) {
			$('link[id="theme"]').attr('href','/css/bootstrap-dark.min.css');
		}
	}
});

app.directive('lazyLoadOptions', [function() {
	return {
		restrict: 'EA',
		require: 'ngModel',
		scope: {
			options: '=',
			lazyLoadFrom: '&'
		},
		link: function($scope, $element, $attrs, $ngModel) {
			//Ajax loading notification
			$scope.options = [
				{
					Name: "Loading..."
				}
			];

			// Control var to prevent infinite loop
			$scope.loaded = false;

			$element.bind('mousedown', function() {
				// Load the data from the promise if not already loaded
				if (!$scope.loaded) {
					$scope.lazyLoadFrom().then(function(data) {
						$scope.options = data;

						// Prevent the load from occurring again
						$scope.loaded = true;
			
						// Blur the element to collapse it
						$element[0].blur();

						// Click the element to re-open it (use timeout to escape digest cycle)
						setTimeout(function() {
							var e = document.createEvent("MouseEvents");
							e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
							$element[0].dispatchEvent(e);
						}, 1);
					}, function(reason) {
						console.error(reason);
					});
				}
			});
		}
	}
}]);

app.controller('header', function($scope, $http, $cookies) {
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

	$scope.setTheme = function(theme) {
		var cookieDate = new Date();
		cookieDate.setFullYear(cookieDate.getFullYear() + 20);
		$cookies.put("theme", theme, {"path": "/", 'expires': cookieDate});
		$('link[id="theme"]').attr('href', '/css/bootstrap-' + theme + '.min.css');
	}

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

	$scope.getThemeClass = function() {
		var theme = $cookies.get("theme");
		if (!theme || theme == "light") {
			return "fas fa-lightbulb text-warning fa-lg"
		}
		else {
			return "fas fa-lightbulb fa-lg";
		}
	}

	$scope.getLoggedInUser();
});