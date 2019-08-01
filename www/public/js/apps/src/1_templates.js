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
