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
