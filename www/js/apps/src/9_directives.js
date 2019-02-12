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

app.directive('lhCookieConsent', function($compile, $cookies) {
	return {
		restrict: 'E',
		link: function(scope, element, attrs) {
			var consent = $cookies.get("cookie-consent");
			if (!consent) {
				var msg = 'This website uses cookies, which are necessary to its functioning and required to achieve the purposes illustrated in the <a href="/cookies.html">cookie policy</a>. If you want to know more or withdraw your consent to all or some of the cookies, please refer to the cookie policy. By closing this banner, you agree to the use of cookies. Should you choose not to close this banner, it will persist on every page and certain features will not function as expected.';

				var template = "<div ng-init='test=1' class='cookie-consent-banner' style='position:fixed;left:0;right:0;bottom:0;background-color:#111417;padding:10px 0'>" +
                    "<div class='container'><div class='row'>" +
                    "<p class='col'>" + msg + "</p>" +
                    "<button class='btn btn-primary' style='margin-top:auto;margin-bottom:auto' ng-click='consentToCookies()'>Ok</button>" +
                    "</div></div></div>";

				scope.consentToCookies = function() {
					var cookieDate = new Date();
					cookieDate.setTime(2144232732000);
					$cookies.put("cookie-consent", true, {"path": "/", "expires": cookieDate});
					location.reload();
				};

                var linkFn = $compile(template);
                var content = linkFn(scope);

				element.html(content);
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
