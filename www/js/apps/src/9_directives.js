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

app.directive('lhCookieConsent', function($cookies) {
	return {
		restrict: 'E',
		link: function(scope, element, attrs) {
			var consent = $cookies.get("cookie-consent");
			if (!consent) {
				var msg = 'This website or its third-party tools use cookies, which are necessary to its functioning and required to achieve the purposes illustrated in the cookie policy. If you want to know more or withdraw your consent to all or some of the cookies, please refer to the cookie policy.' +
				'By closing this banner, scrolling this page, clicking a link or continuing to browse otherwise, you agree to the use of cookies.';
			
				var template = "<div class='cookie-consent-banner'><p>" + msg + "</p><button ng-click='consentToCookies()'>Ok</button></div>";

				scope.consentToCookies = function() {
					$cookies.put("cookie-consent", true);
					element.html(null);
				};

				element.html(template);
			}
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
