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
    slot: [
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
    alignRestriction: [
      "No Align Restriction",
      "Good Only Align",
      "Neutral Only Align",
      "Evil Only Align",
      "Non-Good Align",
      "Non-Neutral Align",
      "Non-Evil Align"
    ],
    weaponType: [
      "",
      "Bladed Weapon",
      "Piercing Weapon",
      "Blunt Weapon"
    ],
    weaponStat: [
      "",
      "Strength",
      "Dexterity",
      "Constitution"
    ]
  },
  selectShortOptions: {
    slot: [
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
    alignRestriction: [
      "     ",
      "G    ",
      "  N  ",
      "    E",
      "  N E",
      "G   E",
      "G N  "
    ],
    weaponType: [
      "",
      "Bladed",
      "Piercing",
      "Blunt"
    ],
    weaponStat: [
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
        let popover = $("[id^=not-pop]");
            popover.popover({
                container: "body",
                content: $("#notification-window").html(),
                html: true,
                trigger: "focus",
                placement: "bottom"
            });
        let cookieDate = new Date();
        let offset = cookieDate.getTimezoneOffset();
        cookieDate.setTime(2144232732000);
        $cookies.put("tzoffset", offset, {"path": "/", "expires": cookieDate});
	};

	$scope.setTheme = function(theme) {
        if ($cookies.get("cookie-consent")) {
            theme = theme.toLowerCase().replace(/\s/g, '-');
            var cookieDate = new Date();
            cookieDate.setFullYear(cookieDate.getFullYear() + 20);
            $cookies.put("theme", theme, {"path": "/", 'expires': cookieDate});
            $('link[id="theme"]').attr('href', '/css/bootstrap-' + theme + '.min.css');
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

app.directive("lhCookieConsent", function($cookies) {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            element.bind("click", function() {
                let cookieDate = new Date();
                cookieDate.setTime(2144232732000);
                $cookies.put("cookie-consent", true, {"path": "/", "expires": cookieDate});
                element.parent().parent().parent().parent().remove();
            });
        }
    };
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
