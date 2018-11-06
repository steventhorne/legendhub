var app = angular.module( "legendwiki-app", ['ngCookies'] );
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
		'<div>' +
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
'</div>');

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
				resolve(this._check(permissionsName, mustCreate, mustRead, mustUpdate, mustDelete));
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
	shortAligns: ["     ",
				  "G    ",
				  "  N  ",
				  "    E",
				  "  N E",
				  "G   E",
				  "G N  "],
});

app.directive('lhTheme', function() {
	return {
		link: function (scope, element, attrs) {
			$('link[id="theme"]').attr('href','/css/bootstrap-dark.min.css');
		}
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
					});
				}
			});
		}
	}
}]);

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
})

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

angular.module("isteven-multi-select",["ng"]).directive("istevenMultiSelect",["$sce","$timeout","$templateCache",function($sce,$timeout,$templateCache){return{restrict:"AE",scope:{inputModel:"=",outputModel:"=",isDisabled:"=",onClear:"&",onClose:"&",onSearchChange:"&",onItemClick:"&",onOpen:"&",onReset:"&",onSelectAll:"&",onSelectNone:"&",translation:"="},templateUrl:"isteven-multi-select.htm",link:function($scope,element,attrs){$scope.backUp=[];$scope.varButtonLabel="";$scope.spacingProperty="";$scope.indexProperty="";$scope.orientationH=false;$scope.orientationV=true;$scope.filteredModel=[];$scope.inputLabel={labelFilter:""};$scope.tabIndex=0;$scope.lang={};$scope.helperStatus={all:true,none:true,reset:true,filter:true};var prevTabIndex=0,helperItems=[],helperItemsLength=0,checkBoxLayer="",scrolled=false,selectedItems=[],formElements=[],vMinSearchLength=0,clickedItem=null;$scope.clearClicked=function(e){$scope.inputLabel.labelFilter="";$scope.updateFilter();$scope.select("clear",e)};$scope.numberToArray=function(num){return new Array(num)};$scope.searchChanged=function(){if($scope.inputLabel.labelFilter.length<vMinSearchLength&&$scope.inputLabel.labelFilter.length>0){return false}$scope.updateFilter()};$scope.updateFilter=function(){$scope.filteredModel=[];var i=0;if(typeof $scope.inputModel==="undefined"){return false}for(i=$scope.inputModel.length-1;i>=0;i--){if(typeof $scope.inputModel[i][attrs.groupProperty]!=="undefined"&&$scope.inputModel[i][attrs.groupProperty]===false){$scope.filteredModel.push($scope.inputModel[i])}var gotData=false;if(typeof $scope.inputModel[i][attrs.groupProperty]==="undefined"){if(typeof attrs.searchProperty!=="undefined"&&attrs.searchProperty!==""){for(var key in $scope.inputModel[i]){if(typeof $scope.inputModel[i][key]!=="boolean"&&String($scope.inputModel[i][key]).toUpperCase().indexOf($scope.inputLabel.labelFilter.toUpperCase())>=0&&attrs.searchProperty.indexOf(key)>-1){gotData=true;break}}}else{for(var key in $scope.inputModel[i]){if(typeof $scope.inputModel[i][key]!=="boolean"&&String($scope.inputModel[i][key]).toUpperCase().indexOf($scope.inputLabel.labelFilter.toUpperCase())>=0){gotData=true;break}}}if(gotData===true){$scope.filteredModel.push($scope.inputModel[i])}}if(typeof $scope.inputModel[i][attrs.groupProperty]!=="undefined"&&$scope.inputModel[i][attrs.groupProperty]===true){if(typeof $scope.filteredModel[$scope.filteredModel.length-1][attrs.groupProperty]!=="undefined"&&$scope.filteredModel[$scope.filteredModel.length-1][attrs.groupProperty]===false){$scope.filteredModel.pop()}else{$scope.filteredModel.push($scope.inputModel[i])}}}$scope.filteredModel.reverse();$timeout(function(){$scope.getFormElements();if($scope.inputLabel.labelFilter.length>vMinSearchLength){var filterObj=[];angular.forEach($scope.filteredModel,function(value,key){if(typeof value!=="undefined"){if(typeof value[attrs.groupProperty]==="undefined"){var tempObj=angular.copy(value);var index=filterObj.push(tempObj);delete filterObj[index-1][$scope.indexProperty];delete filterObj[index-1][$scope.spacingProperty]}}});$scope.onSearchChange({data:{keyword:$scope.inputLabel.labelFilter,result:filterObj}})}},0)};$scope.getFormElements=function(){formElements=[];var selectButtons=[],inputField=[],checkboxes=[],clearButton=[];if($scope.helperStatus.all||$scope.helperStatus.none||$scope.helperStatus.reset){selectButtons=element.children().children().next().children().children()[0].getElementsByTagName("button");if($scope.helperStatus.filter){inputField=element.children().children().next().children().children().next()[0].getElementsByTagName("input");clearButton=element.children().children().next().children().children().next()[0].getElementsByTagName("button")}}else{if($scope.helperStatus.filter){inputField=element.children().children().next().children().children()[0].getElementsByTagName("input");clearButton=element.children().children().next().children().children()[0].getElementsByTagName("button")}}if(!$scope.helperStatus.all&&!$scope.helperStatus.none&&!$scope.helperStatus.reset&&!$scope.helperStatus.filter){checkboxes=element.children().children().next()[0].getElementsByTagName("input")}else{checkboxes=element.children().children().next().children().next()[0].getElementsByTagName("input")}for(var i=0;i<selectButtons.length;i++){formElements.push(selectButtons[i])}for(var i=0;i<inputField.length;i++){formElements.push(inputField[i])}for(var i=0;i<clearButton.length;i++){formElements.push(clearButton[i])}for(var i=0;i<checkboxes.length;i++){formElements.push(checkboxes[i])}};$scope.isGroupMarker=function(item,type){if(typeof item[attrs.groupProperty]!=="undefined"&&item[attrs.groupProperty]===type)return true;return false};$scope.removeGroupEndMarker=function(item){if(typeof item[attrs.groupProperty]!=="undefined"&&item[attrs.groupProperty]===false)return false;return true};$scope.syncItems=function(item,e,ng_repeat_index){e.preventDefault();e.stopPropagation();if(typeof attrs.disableProperty!=="undefined"&&item[attrs.disableProperty]===true){return false}if(typeof attrs.isDisabled!=="undefined"&&$scope.isDisabled===true){return false}if(typeof item[attrs.groupProperty]!=="undefined"&&item[attrs.groupProperty]===false){return false}var index=$scope.filteredModel.indexOf(item);if(typeof item[attrs.groupProperty]!=="undefined"&&item[attrs.groupProperty]===true){if(typeof attrs.selectionMode!=="undefined"&&attrs.selectionMode.toUpperCase()==="SINGLE"){return false}var i,j,k;var startIndex=0;var endIndex=$scope.filteredModel.length-1;var tempArr=[];var nestLevel=0;for(i=index;i<$scope.filteredModel.length;i++){if(nestLevel===0&&i>index){break}if(typeof $scope.filteredModel[i][attrs.groupProperty]!=="undefined"&&$scope.filteredModel[i][attrs.groupProperty]===true){if(tempArr.length===0){startIndex=i+1}nestLevel=nestLevel+1}else if(typeof $scope.filteredModel[i][attrs.groupProperty]!=="undefined"&&$scope.filteredModel[i][attrs.groupProperty]===false){nestLevel=nestLevel-1;if(tempArr.length>0&&nestLevel===0){var allTicked=true;endIndex=i;for(j=0;j<tempArr.length;j++){if(typeof tempArr[j][$scope.tickProperty]!=="undefined"&&tempArr[j][$scope.tickProperty]===false){allTicked=false;break}}if(allTicked===true){for(j=startIndex;j<=endIndex;j++){if(typeof $scope.filteredModel[j][attrs.groupProperty]==="undefined"){if(typeof attrs.disableProperty==="undefined"){$scope.filteredModel[j][$scope.tickProperty]=false;inputModelIndex=$scope.filteredModel[j][$scope.indexProperty];$scope.inputModel[inputModelIndex][$scope.tickProperty]=false}else if($scope.filteredModel[j][attrs.disableProperty]!==true){$scope.filteredModel[j][$scope.tickProperty]=false;inputModelIndex=$scope.filteredModel[j][$scope.indexProperty];$scope.inputModel[inputModelIndex][$scope.tickProperty]=false}}}}else{for(j=startIndex;j<=endIndex;j++){if(typeof $scope.filteredModel[j][attrs.groupProperty]==="undefined"){if(typeof attrs.disableProperty==="undefined"){$scope.filteredModel[j][$scope.tickProperty]=true;inputModelIndex=$scope.filteredModel[j][$scope.indexProperty];$scope.inputModel[inputModelIndex][$scope.tickProperty]=true}else if($scope.filteredModel[j][attrs.disableProperty]!==true){$scope.filteredModel[j][$scope.tickProperty]=true;inputModelIndex=$scope.filteredModel[j][$scope.indexProperty];$scope.inputModel[inputModelIndex][$scope.tickProperty]=true}}}}}}else{tempArr.push($scope.filteredModel[i])}}}else{if(typeof attrs.selectionMode!=="undefined"&&attrs.selectionMode.toUpperCase()==="SINGLE"){for(i=0;i<$scope.filteredModel.length;i++){$scope.filteredModel[i][$scope.tickProperty]=false}for(i=0;i<$scope.inputModel.length;i++){$scope.inputModel[i][$scope.tickProperty]=false}$scope.filteredModel[index][$scope.tickProperty]=true}else{$scope.filteredModel[index][$scope.tickProperty]=!$scope.filteredModel[index][$scope.tickProperty]}var inputModelIndex=$scope.filteredModel[index][$scope.indexProperty];$scope.inputModel[inputModelIndex][$scope.tickProperty]=$scope.filteredModel[index][$scope.tickProperty]}clickedItem=angular.copy(item);if(clickedItem!==null){$timeout(function(){delete clickedItem[$scope.indexProperty];delete clickedItem[$scope.spacingProperty];$scope.onItemClick({data:clickedItem});clickedItem=null},0)}$scope.refreshOutputModel();$scope.refreshButton();prevTabIndex=$scope.tabIndex;$scope.tabIndex=ng_repeat_index+helperItemsLength;e.target.focus();$scope.removeFocusStyle(prevTabIndex);$scope.setFocusStyle($scope.tabIndex);if(typeof attrs.selectionMode!=="undefined"&&attrs.selectionMode.toUpperCase()==="SINGLE"){$scope.toggleCheckboxes(e)}};$scope.refreshOutputModel=function(){$scope.outputModel=[];var outputProps=[],tempObj={};if(typeof attrs.outputProperties!=="undefined"){outputProps=attrs.outputProperties.split(" ");angular.forEach($scope.inputModel,function(value,key){if(typeof value!=="undefined"&&typeof value[attrs.groupProperty]==="undefined"&&value[$scope.tickProperty]===true){tempObj={};angular.forEach(value,function(value1,key1){if(outputProps.indexOf(key1)>-1){tempObj[key1]=value1}});var index=$scope.outputModel.push(tempObj);delete $scope.outputModel[index-1][$scope.indexProperty];delete $scope.outputModel[index-1][$scope.spacingProperty]}})}else{angular.forEach($scope.inputModel,function(value,key){if(typeof value!=="undefined"&&typeof value[attrs.groupProperty]==="undefined"&&value[$scope.tickProperty]===true){var temp=angular.copy(value);var index=$scope.outputModel.push(temp);delete $scope.outputModel[index-1][$scope.indexProperty];delete $scope.outputModel[index-1][$scope.spacingProperty]}})}};$scope.refreshButton=function(){$scope.varButtonLabel="";var ctr=0;if($scope.outputModel.length===0){$scope.varButtonLabel=$scope.lang.nothingSelected}else{var tempMaxLabels=$scope.outputModel.length;if(typeof attrs.maxLabels!=="undefined"&&attrs.maxLabels!==""){tempMaxLabels=attrs.maxLabels}if($scope.outputModel.length>tempMaxLabels){$scope.more=true}else{$scope.more=false}angular.forEach($scope.inputModel,function(value,key){if(typeof value!=="undefined"&&value[attrs.tickProperty]===true){if(ctr<tempMaxLabels){$scope.varButtonLabel+=($scope.varButtonLabel.length>0?'</div>, <div class="buttonLabel">':'<div class="buttonLabel">')+$scope.writeLabel(value,"buttonLabel")}ctr++}});if($scope.more===true){if(tempMaxLabels>0){$scope.varButtonLabel+=", ... "}$scope.varButtonLabel+="("+$scope.outputModel.length+")"}}$scope.varButtonLabel=$sce.trustAsHtml($scope.varButtonLabel+'<span class="caret"></span>')};$scope.itemIsDisabled=function(item){if(typeof attrs.disableProperty!=="undefined"&&item[attrs.disableProperty]===true){return true}else{if($scope.isDisabled===true){return true}else{return false}}};$scope.writeLabel=function(item,type){var temp=attrs[type].split(" ");var label="";angular.forEach(temp,function(value,key){item[value]&&(label+="&nbsp;"+value.split(".").reduce(function(prev,current){return prev[current]},item))});if(type.toUpperCase()==="BUTTONLABEL"){return label}return $sce.trustAsHtml(label)};$scope.toggleCheckboxes=function(e){var clickedEl=element.children()[0];angular.element(document).off("click",$scope.externalClickListener);angular.element(document).off("keydown",$scope.keyboardListener);if(angular.element(checkBoxLayer).hasClass("show")){angular.element(checkBoxLayer).removeClass("show");angular.element(clickedEl).removeClass("buttonClicked");angular.element(document).off("click",$scope.externalClickListener);angular.element(document).off("keydown",$scope.keyboardListener);$scope.removeFocusStyle($scope.tabIndex);if(typeof formElements[$scope.tabIndex]!=="undefined"){formElements[$scope.tabIndex].blur()}$timeout(function(){$scope.onClose()},0);element.children().children()[0].focus()}else{$scope.inputLabel.labelFilter="";$scope.updateFilter();helperItems=[];helperItemsLength=0;angular.element(checkBoxLayer).addClass("show");angular.element(clickedEl).addClass("buttonClicked");angular.element(document).on("click",$scope.externalClickListener);angular.element(document).on("keydown",$scope.keyboardListener);$scope.getFormElements();$scope.tabIndex=0;var helperContainer=angular.element(element[0].querySelector(".helperContainer"))[0];if(typeof helperContainer!=="undefined"){for(var i=0;i<helperContainer.getElementsByTagName("BUTTON").length;i++){helperItems[i]=helperContainer.getElementsByTagName("BUTTON")[i]}helperItemsLength=helperItems.length+helperContainer.getElementsByTagName("INPUT").length}if(element[0].querySelector(".inputFilter")){element[0].querySelector(".inputFilter").focus();$scope.tabIndex=$scope.tabIndex+helperItemsLength-2;angular.element(element).children()[0].blur()}else{if(!$scope.isDisabled){$scope.tabIndex=$scope.tabIndex+helperItemsLength;if($scope.inputModel.length>0){formElements[$scope.tabIndex].focus();$scope.setFocusStyle($scope.tabIndex);angular.element(element).children()[0].blur()}}}$scope.onOpen()}};$scope.externalClickListener=function(e){var targetsArr=element.find(e.target.tagName);for(var i=0;i<targetsArr.length;i++){if(e.target==targetsArr[i]){return}}angular.element(checkBoxLayer.previousSibling).removeClass("buttonClicked");angular.element(checkBoxLayer).removeClass("show");angular.element(document).off("click",$scope.externalClickListener);angular.element(document).off("keydown",$scope.keyboardListener);$timeout(function(){$scope.onClose()},0);element.children().children()[0].focus()};$scope.select=function(type,e){var helperIndex=helperItems.indexOf(e.target);$scope.tabIndex=helperIndex;switch(type.toUpperCase()){case"ALL":angular.forEach($scope.filteredModel,function(value,key){if(typeof value!=="undefined"&&value[attrs.disableProperty]!==true){if(typeof value[attrs.groupProperty]==="undefined"){value[$scope.tickProperty]=true}}});$scope.refreshOutputModel();$scope.refreshButton();$scope.onSelectAll();break;case"NONE":angular.forEach($scope.filteredModel,function(value,key){if(typeof value!=="undefined"&&value[attrs.disableProperty]!==true){if(typeof value[attrs.groupProperty]==="undefined"){value[$scope.tickProperty]=false}}});$scope.refreshOutputModel();$scope.refreshButton();$scope.onSelectNone();break;case"RESET":angular.forEach($scope.filteredModel,function(value,key){if(typeof value[attrs.groupProperty]==="undefined"&&typeof value!=="undefined"&&value[attrs.disableProperty]!==true){var temp=value[$scope.indexProperty];value[$scope.tickProperty]=$scope.backUp[temp][$scope.tickProperty]}});$scope.refreshOutputModel();$scope.refreshButton();$scope.onReset();break;case"CLEAR":$scope.tabIndex=$scope.tabIndex+1;$scope.onClear();break;case"FILTER":$scope.tabIndex=helperItems.length-1;break;default:}};function genRandomString(length){var possible="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";var temp="";for(var i=0;i<length;i++){temp+=possible.charAt(Math.floor(Math.random()*possible.length))}return temp}$scope.prepareGrouping=function(){var spacing=0;angular.forEach($scope.filteredModel,function(value,key){value[$scope.spacingProperty]=spacing;if(value[attrs.groupProperty]===true){spacing+=2}else if(value[attrs.groupProperty]===false){spacing-=2}})};$scope.prepareIndex=function(){var ctr=0;angular.forEach($scope.filteredModel,function(value,key){value[$scope.indexProperty]=ctr;ctr++})};$scope.keyboardListener=function(e){var key=e.keyCode?e.keyCode:e.which;var isNavigationKey=false;if(key===27){e.preventDefault();e.stopPropagation();$scope.toggleCheckboxes(e)}else if(key===40||key===39||!e.shiftKey&&key==9){isNavigationKey=true;prevTabIndex=$scope.tabIndex;$scope.tabIndex++;if($scope.tabIndex>formElements.length-1){$scope.tabIndex=0;prevTabIndex=formElements.length-1}while(formElements[$scope.tabIndex].disabled===true){$scope.tabIndex++;if($scope.tabIndex>formElements.length-1){$scope.tabIndex=0}if($scope.tabIndex===prevTabIndex){break}}}else if(key===38||key===37||e.shiftKey&&key==9){isNavigationKey=true;prevTabIndex=$scope.tabIndex;$scope.tabIndex--;if($scope.tabIndex<0){$scope.tabIndex=formElements.length-1;prevTabIndex=0}while(formElements[$scope.tabIndex].disabled===true){$scope.tabIndex--;if($scope.tabIndex===prevTabIndex){break}if($scope.tabIndex<0){$scope.tabIndex=formElements.length-1}}}if(isNavigationKey===true){e.preventDefault();formElements[$scope.tabIndex].focus();var actEl=document.activeElement;if(actEl.type.toUpperCase()==="CHECKBOX"){$scope.setFocusStyle($scope.tabIndex);$scope.removeFocusStyle(prevTabIndex)}else{$scope.removeFocusStyle(prevTabIndex);$scope.removeFocusStyle(helperItemsLength);$scope.removeFocusStyle(formElements.length-1)}}isNavigationKey=false};$scope.setFocusStyle=function(tabIndex){angular.element(formElements[tabIndex]).parent().parent().parent().addClass("multiSelectFocus")};$scope.removeFocusStyle=function(tabIndex){angular.element(formElements[tabIndex]).parent().parent().parent().removeClass("multiSelectFocus")};$scope.groupProperty=attrs.groupProperty;$scope.tickProperty=attrs.tickProperty;$scope.directiveId=attrs.directiveId;var tempStr=genRandomString(5);$scope.indexProperty="idx_"+tempStr;$scope.spacingProperty="spc_"+tempStr;if(typeof attrs.orientation!=="undefined"){if(attrs.orientation.toUpperCase()==="HORIZONTAL"){$scope.orientationH=true;$scope.orientationV=false}else{$scope.orientationH=false;$scope.orientationV=true}}checkBoxLayer=element.children().children().next()[0];if(typeof attrs.maxHeight!=="undefined"){var layer=element.children().children().children()[0];angular.element(layer).attr("style","height:"+attrs.maxHeight+"; overflow-y:scroll;")}for(var property in $scope.helperStatus){if($scope.helperStatus.hasOwnProperty(property)){if(typeof attrs.helperElements!=="undefined"&&attrs.helperElements.toUpperCase().indexOf(property.toUpperCase())===-1){$scope.helperStatus[property]=false}}}if(typeof attrs.selectionMode!=="undefined"&&attrs.selectionMode.toUpperCase()==="SINGLE"){$scope.helperStatus["all"]=false;$scope.helperStatus["none"]=false}$scope.icon={};$scope.icon.selectAll="&#10003;";$scope.icon.selectNone="&times;";$scope.icon.reset="&#8630;";$scope.icon.tickMark="&#10003;";if(typeof attrs.translation!=="undefined"){$scope.lang.selectAll=$sce.trustAsHtml($scope.icon.selectAll+"&nbsp;&nbsp;"+$scope.translation.selectAll);$scope.lang.selectNone=$sce.trustAsHtml($scope.icon.selectNone+"&nbsp;&nbsp;"+$scope.translation.selectNone);$scope.lang.reset=$sce.trustAsHtml($scope.icon.reset+"&nbsp;&nbsp;"+$scope.translation.reset);$scope.lang.search=$scope.translation.search;$scope.lang.nothingSelected=$sce.trustAsHtml($scope.translation.nothingSelected)}else{$scope.lang.selectAll=$sce.trustAsHtml($scope.icon.selectAll+"&nbsp;&nbsp;Select All");$scope.lang.selectNone=$sce.trustAsHtml($scope.icon.selectNone+"&nbsp;&nbsp;Select None");$scope.lang.reset=$sce.trustAsHtml($scope.icon.reset+"&nbsp;&nbsp;Reset");$scope.lang.search="Search...";$scope.lang.nothingSelected="None Selected"}$scope.icon.tickMark=$sce.trustAsHtml($scope.icon.tickMark);if(typeof attrs.MinSearchLength!=="undefined"&&parseInt(attrs.MinSearchLength)>0){vMinSearchLength=Math.floor(parseInt(attrs.MinSearchLength))}$scope.$watch("inputModel",function(newVal){if(newVal){$scope.refreshOutputModel();$scope.refreshButton()}},true);$scope.$watch("inputModel",function(newVal){if(newVal){$scope.backUp=angular.copy($scope.inputModel);$scope.updateFilter();$scope.prepareGrouping();$scope.prepareIndex();$scope.refreshOutputModel();$scope.refreshButton()}});$scope.$watch("isDisabled",function(newVal){$scope.isDisabled=newVal});var onTouchStart=function(e){$scope.$apply(function(){$scope.scrolled=false})};angular.element(document).bind("touchstart",onTouchStart);var onTouchMove=function(e){$scope.$apply(function(){$scope.scrolled=true})};angular.element(document).bind("touchmove",onTouchMove);$scope.$on("$destroy",function(){angular.element(document).unbind("touchstart",onTouchStart);angular.element(document).unbind("touchmove",onTouchMove)})}}}]).run(["$templateCache",function($templateCache){var template='<span class="multiSelect inlineBlock">'+'<button class="btn btn-outline-primary" id="{{directiveId}}" type="button"'+'ng-click="toggleCheckboxes( $event ); refreshSelectedItems(); refreshButton(); prepareGrouping; prepareIndex();"'+'ng-bind-html="varButtonLabel"'+'ng-disabled="disable-button"'+">"+"</button>"+'<div class="checkboxLayer">'+'<div class="helperContainer" ng-if="helperStatus.filter || helperStatus.all || helperStatus.none || helperStatus.reset ">'+'<div class="line" ng-if="helperStatus.all || helperStatus.none || helperStatus.reset ">'+'<button type="button" class="helperButton"'+'ng-disabled="isDisabled"'+'ng-if="helperStatus.all"'+"ng-click=\"select( 'all', $event );\""+'ng-bind-html="lang.selectAll">'+"</button>"+'<button type="button" class="helperButton"'+'ng-disabled="isDisabled"'+'ng-if="helperStatus.none"'+"ng-click=\"select( 'none', $event );\""+'ng-bind-html="lang.selectNone">'+"</button>"+'<button type="button" class="helperButton reset"'+'ng-disabled="isDisabled"'+'ng-if="helperStatus.reset"'+"ng-click=\"select( 'reset', $event );\""+'ng-bind-html="lang.reset">'+"</button>"+"</div>"+'<div class="line" style="position:relative" ng-if="helperStatus.filter">'+'<input placeholder="{{lang.search}}" type="text"'+"ng-click=\"select( 'filter', $event )\" "+'ng-model="inputLabel.labelFilter" '+'ng-change="searchChanged()" class="inputFilter"'+"/>"+'<button type="button" class="clearButton" ng-click="clearClicked( $event )" >×</button> '+"</div> "+"</div> "+'<div class="checkBoxContainer">'+"<div "+'ng-repeat="item in filteredModel | filter:removeGroupEndMarker" class="multiSelectItem"'+'ng-class="{selected: item[ tickProperty ], horizontal: orientationH, vertical: orientationV, multiSelectGroup:item[ groupProperty ], disabled:itemIsDisabled( item )}"'+'ng-click="syncItems( item, $event, $index );" '+'ng-mouseleave="removeFocusStyle( tabIndex );"> '+'<div class="acol" ng-if="item[ spacingProperty ] > 0" ng-repeat="i in numberToArray( item[ spacingProperty ] ) track by $index">'+"</div>  "+'<div class="acol">'+"<label>"+'<input class="checkbox focusable" type="checkbox" '+'ng-disabled="itemIsDisabled( item )" '+'ng-checked="item[ tickProperty ]" '+'ng-click="syncItems( item, $event, $index )" />'+"<span "+'ng-class="{disabled:itemIsDisabled( item )}" '+"ng-bind-html=\"writeLabel( item, 'itemLabel' )\">"+"</span>"+"</label>"+"</div>"+'<span class="tickMark" ng-if="item[ groupProperty ] !== true && item[ tickProperty ] === true" ng-bind-html="icon.tickMark"></span>'+"</div>"+"</div>"+"</div>"+"</span>";$templateCache.put("isteven-multi-select.htm",template)}]);
