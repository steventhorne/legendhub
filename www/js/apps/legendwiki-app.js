var app = angular.module( "legendwiki-app", ['ngCookies'] );

/* Gets a parameter by name from the url's query string
 *
 * @param {string} name - The name of the query parameter.
 */
getUrlParameter = function(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ?
        '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

app.run(function($templateCache) {
    var notificationHtml = ' tabindex="0" role="button" data-container="lh-header>div" data-toggle="popover" data-placement="bottom" ng-attr-data-content="{{getNotificationContent()}}" ng-if="!!currentUser" lh-popover><span ng-if="notifications.length > 0"><span class="badge badge-pill badge-danger">{{notifications.length}}</span>&nbsp;</span><i class="fas fa-bell"></i></a>';
    var notificationWeb = '<a class="btn btn-dark d-none d-sm-inline-block"' + notificationHtml;
    var notificationMobile = '<a tabindex="0" class="btn btn-dark ml-auto mr-3 d-inline-block d-sm-none"' + notificationHtml;

	$templateCache.put('header.html',
'<div ng-controller="header">' +
'<nav class="navbar navbar-expand-sm navbar-dark bg-dark">' +
	'<a class="navbar-brand" href="/">LegendHUB</a>' +
     notificationMobile +
	'<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">' +
		'<span class="navbar-toggler-icon"></span>' +
	'</button>' +
	'<div class="collapse navbar-collapse" id="navbarSupportedContent">' +
		'<ul class="navbar-nav mr-auto">' +
			'<li class="nav-item">' +
				'<a class="nav-link text-primary" target="_blank" href="http://www.topmudsites.com/vote-legend.html">Vote!</a>' +
			'</li>' +
			'<li class="nav-item">' +
				'<a class="nav-link" href="/builder/">Builder</a>' +
			'</li>' +
			'<li class="nav-item">' +
				'<a class="nav-link" href="/items/">Items</a>' +
			'</li>' +
			'<li class="nav-item">' +
				'<a class="nav-link" href="/mobs/">Mobs</a>' +
			'</li>' +
			'<li class="nav-item">' +
				'<a class="nav-link" href="/quests/">Quests</a>' +
			'</li>' +
			'<li class="nav-item">' +
				'<a class="nav-link" href="/wiki/">Wiki</a>' +
			'</li>' +
		'</ul>' +
		'<ul class="navbar-nav ml-auto">' +
            '<li class="nav-item">' +
                 notificationWeb +
            '</li>' +
			'<li class="nav-item dropdown float-right">' +
                '<a class="nav-link dropdown-toggle dropdown-toggle-no-caret" href="#" id="themeDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                    '<i class="fas fa-palette"></i>' +
                '</a>' +
                '<div class="dropdown-menu dropdown-menu-right" aria-labelledby="themeDropdown">' +
                   '<a ng-repeat="theme in themes" class="dropdown-item" href="" ng-click="setTheme(theme)">{{::theme}}</a>' +
                '</div>' +
				//'<a class="nav-link" href="" ng-click="toggleTheme()"><i ng-class="getThemeClass()"></i></a>' +
			'</li>' +
			'<li class="nav-item dropdown float-right" ng-if="!!currentUser">' +
				'<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
					'{{currentUser}}' +
				'</a>' +
				'<div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">' +
                    '<a class="dropdown-item" href="/account/">Account</a>' +
                    '<a class="dropdown-item" href="/changelog/">Changelog</a>' +
					'<a class="dropdown-item" href="https://github.com/SvarturH/legendhub/issues" target="_blank">Report an Issue</a>' +
					'<div class="dropdown-divider"></div>' +
					'<a class="dropdown-item" href="" ng-click="logout()">Logout</a>' +
				'</div>' +
			'</li>' +
			'<li class="nav-item" ng-if="!currentUser">' +
				'<a class="nav-link" href="/login.html?returnUrl={{returnUrl}}">Login</a>' +
			'</li>' +
		'</ul>' +
	'</div>' +
'</nav>' +
'<div class="breadcrumbNav bg-dark" ng-if="bcFactory.links.length > 0">' +
	'<ul class="breadcrumbList text-light">' +
		'<li class="breadcrumbListLink" ng-repeat="link in bcFactory.links">' +
			'<a ng-if="!link.active" href="{{link.href}}">{{link.display}}</a>' +
			'<span class="active" ng-if="link.active">{{link.display}}</span>' +
		'</li>' +
	'</ul>' +
'</div>' +
'</div>' +
'<br/>');
	$templateCache.put('footer.html',
'<br />' +
'<div class="footer bg-dark">' +
	'<div class="container">' +
		'<div class="p-3">' +
			'<div class="row text-light" style="font-size:.8em">' +
				'<span class="mx-auto text-center">This domain, its content, and its creators are not associated, nor affiliated, with the LegendMUD immortal staff.</span>' +
			'</div>' +
			'<div class="row text-light" style="font-size:.8em">' +
				'<span class="mx-auto text-center">Additionally, since this is an open-access project, all of the information posted and listed may be incorrect.</span>' +
			'</div>' +
			'<div class="row text-primary">' +
				'<span class="mx-auto text-center"><i class="far fa-copyright"></i>&nbsp;2018</span>' +
			'</div>' +
		'</div>' +
	'</div>' +
'</div>' +
'<lh-cookie-consent></lh-cookie-consent>');

});

$templateCache.put('cookieConsent.html',
'This website or its third-party tools use cookies, which are necessary to its functioning and required to achieve the purposes illustrated in the cookie policy. If you want to know more or withdraw your consent to all or some of the cookies, please refer to the cookie policy.' +
'By closing this banner, scrolling this page, clicking a link or continuing to browse otherwise, you agree to the use of cookies.');

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
	aligns: [
        "No Align Restriction",
		"Good Only Align",
		"Neutral Only Align",
		"Evil Only Align",
		"Non-Good Align",
        "Non-Neutral Align",
		"Non-Evil Align"],
	shortAligns: [
        "     ",
		"G    ",
		"  N  ",
		"    E",
		"  N E",
		"G   E",
		"G N  "],
  selectOptions: {
    Slot: [
      "Light",
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
	    "Other"
    ],
    AlignRestriction: [
      "No Align Restriction",
      "Good Only Align",
      "Neutral Only Align",
      "Evil Only Align",
      "Non-Good Align",
      "Non-Neutral Align",
      "Non-Evil Align"
    ],
    WeaponType: [
      "",
      "Bladed Weapon",
      "Piercing Weapon",
      "Blunt Weapon"
    ],
    WeaponStat: [
      "",
      "Strength",
      "Dexterity",
      "Constitution"
    ]
  },
  selectShortOptions: {
    Slot: [
        "Light",
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
	    "Other"
    ],
    AlignRestriction: [
      "     ",
      "G    ",
      "  N  ",
      "    E",
      "  N E",
      "G   E",
      "G N  "
    ],
    WeaponType: [
      "",
      "Bladed",
      "Piercing",
      "Blunt"
    ],
    WeaponStat: [
      "",
      "Str",
      "Dex",
      "Con"
    ]
  }
});

app.factory('breadcrumb', function() {
	function Breadcrumb() {
		this.links = [];
	}

	return new Breadcrumb();
});

app.factory('categories', function() {
	function Categories() {
		this.categories = [];
		this.subcategories = [];
		this.categoryNameProperty = "Name";
		this.subcategoryNameProperty = "Name";
		this.subcategoryCategoryProperty = "CategoryId";
		this.defaultId = -1;
		this.clearSelectedCategories();
	}

	/** @description Sets the options for the category service.
	 * @param {string} categoryNameProperty The name of the property that holds the category name.
	 * @param {string} subcategoryNameProperty The name of the property that holds the subcategory name.
	 * @param {string} subcategoryCategoryProperty The name of the property that holds the related categoryId for the subcategory.
	*/
	Categories.prototype.setOptions = function(categoryNameProperty, subcategoryNameProperty, subcategoryCategoryProperty, defaultId) {
		this.categoryNameProperty = categoryNameProperty;
		this.subcategoryNameProperty = subcategoryNameProperty;
		this.subcategoryCategoryProperty = subcategoryCategoryProperty;
		this.defaultId = defaultId;
	}

	/** @description Gets the category name via the given identifier.
	 * @param {number} id The identifier.
	 * @return {string} The category name.
	 */
	Categories.prototype.getCategoryName = function(id) {
		for (var i = 0; i < this.categories.length; ++i) {
			if (this.categories[i].Id == id) {
				return this.categories[i][this.categoryNameProperty];
			}
		}
		return '';
	}

	/** @description Gets the subcategory name via the given identifier.
	 * @param {number} id The identifier.
	 * @return {string} The subcategory name.
	*/
	Categories.prototype.getSubcategoryName = function(id) {
		for (var i = 0; i < this.subcategories.length; ++i) {
			if (this.subcategories[i].Id == id) {
				return this.subcategories[i][this.subcategoryNameProperty];
			}
		}
		return '';
	}

	/** @description Sets the categories for the service.
	 * @param {array} categories
	 */
	Categories.prototype.setCategories = function(categories) {
		this.categories = categories;
	}

	/** @description Sets the categories for the service.
	 * @param {array} subcategories
	 */
	Categories.prototype.setSubcategories = function(subcategories) {
		this.subcategories = subcategories;
	}

	/** @description Sets the current category.
	 * @param {number} id The Id of the category.
	 */
	Categories.prototype.setSelectedCategory = function(id) {
		if (id) {
			this.categoryId = id;
		}
	}

	/** @description Sets the current subcategory.
	 * @param {number} id The Id of the subcategory.
	 */
	Categories.prototype.setSelectedSubcategory = function(id) {
		if (id) {
			this.subcategoryId = id;
		}
	}

	/** @description Returns whether or not the selected category Id is valid.
	 * @returns {boolean}
	 */
	Categories.prototype.hasSelectedCategory = function() {
		return this.categoryId > this.defaultId;
	}

	/** @description Returns whether or not the selected subcategory Id is valid.
	 * @returns {boolean}
	 */
	Categories.prototype.hasSelectedSubcategory = function() {
		return this.subcategoryId > this.defaultId;
	}

	/** @description Gets the current category Id.
	 * @returns {number}
	 */
	Categories.prototype.getCategoryId = function() {
		return this.categoryId;
	}

	/** @description Gets the current subcategory Id.
	 * @returns {number}
	 */
	Categories.prototype.getSubcategoryId = function() {
		return this.subcategoryId;
	}

	/** @description Gets the current category name.
	 * @returns {number}
	 */
	Categories.prototype.getSelectedCategoryName = function() {
		return this.getCategoryName(this.categoryId);
	}

	/** @description Gets the current subcategory name.
	 * @returns {number}
	 */
	Categories.prototype.getSelectedSubcategoryName = function() {
		return this.getSubcategoryName(this.subcategoryId);
	}

	/** @description Gets the selected subcategory if selected, otherwise will get the selected category if selected. Used for displaying the category we're searching on.
	 * @returns {string}
	*/
	Categories.prototype.getActiveCategory = function() {
		if (this.categoryId && this.categoryId > this.defaultId) {
			if (this.subcategoryId && this.subcategoryId > this.defaultId) {
				return this.getSubcategoryName(this.subcategoryId);
			}
			return this.getCategoryName(this.categoryId);
		}
		return '';
	}

	/** @description Gets the subcategories that are under the selected category.
	 * @returns {array}
	 */
	Categories.prototype.getFilteredSubcategories = function() {
		if (this.categoryId) {
			var filtered = [];
			for (var i = 0; i < this.subcategories.length; ++i) {
				if (this.subcategories[i][this.subcategoryCategoryProperty] == this.categoryId) {
					filtered.push(this.subcategories[i]);
				}
			}
			return filtered;
		}

		return [];
	}

	/** @description Clears the selected categories. */
	Categories.prototype.clearSelectedCategories = function() {
		this.categoryId = this.defaultId;
		this.subcategoryId = this.defaultId;
	}

	return new Categories();
});

app.controller('header', ['$scope', '$http', '$cookies', 'breadcrumb', function($scope, $http, $cookies, breadcrumb) {
	$scope.initialize = function() {
        $scope.themes = ['Light', 'Dark', 'Solarized Dark'];
		$scope.bcFactory = breadcrumb;
		$scope.returnUrl = window.location.pathname + window.location.search;
		checkIfLoggedIn();
	}

	var checkIfLoggedIn = function() {
		getLoggedInUser();
	}

	var getLoggedInUser = function() {
		$http({
			url: '/php/login/getLoggedInUser.php'
		}).then(function succcessCallback(response) {
			if (response.data.success) {
				$scope.currentUser = response.data.username;
                $scope.getNotifications();
			}
		});
	}

	$scope.logout = function() {
		$http({
			url: '/php/login/logout.php'
		}).then(function succcessCallback(response) {
			window.location = "/";
		});
	}

	$scope.setTheme = function(theme) {
        theme = theme.toLowerCase().replace(/\s/g, '-');
		var cookieDate = new Date();
		cookieDate.setFullYear(cookieDate.getFullYear() + 20);
		$cookies.put("theme", theme, {"path": "/", 'expires': cookieDate});
		$('link[id="theme"]').attr('href', '/css/bootstrap-' + theme + '.min.css');
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
                $scope.notifications[i].CreatedOnDate = (new Date($scope.notifications[i].CreatedOn + " UTC")).toString().slice(4, 15);
                $scope.notifications[i].CreatedOnTime = (new Date($scope.notifications[i].CreatedOn + " UTC")).toString().slice(16, 24);
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

app.directive('lhAutofocus', ['$timeout', function($timeout) {
	return {
		restrict: 'A',
		link : function($scope, $element) {
			$timeout(function() {
				$element[0].focus();
			});
		}
	}
}]);

app.directive('lhHeader', function() {
	return {
		restrict: 'E',
		templateUrl: 'header.html'
	}
});

app.directive('lhFooter', function() {
	return {
		restrict: 'E',
		templateUrl: 'footer.html'
	}
});

app.directive('lhCookieConsent', function() {
	return {
		restrict: 'E',
		templateUrl: 'cookieConsent.html'
	}
});

app.directive('lhTooltip', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.on('mouseenter', function() {
				element.tooltip({html: true});
				element.tooltip('show');
			});
			element.on('mouseleave', function() {
				element.tooltip('hide');
			});
		}
	};
});

app.directive('lhPopover', function($compile) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.popover({html: true, trigger: 'focus'});
            element.on('shown.bs.popover', function() {
                $compile($(".popover-body").contents())(scope);
            });
        }
    };
});
