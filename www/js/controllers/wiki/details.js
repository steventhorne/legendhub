angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('wiki-details', ['$scope', '$http', '$q', 'breadcrumb', function($scope, $http, $q, breadcrumb) {
	var initialize = function() {
		$scope.categories = [];
		$scope.subcategories = [];

        loadPage();
	};

    var loadPage = function() {
        var id = getUrlParameter("id");
        $q.all([getCategoriesAsync(), getSubcategoriesAsync(), getWikiPageAsync(id), getWikiPageHistoryAsync(id)]).then(
            function(data) {
                // getCategoriesAsync
                $scope.categories = data[0];

                // getSubcategoriesAsync
			    $scope.subcategories = data[1];

                // getWikiPageAsync
                $scope.wikiModel = data[2];
                if (data[2] == null) {
                    breadcrumb.links = [{'display': 'Wiki', 'href': '/wiki/'},
                                        {'display': 'Not Found', 'href': '', 'active': true}];
                    return;
                }
                $scope.wikiModel.ModifiedOn = (new Date($scope.wikiModel.ModifiedOn + " UTC")).toString().slice(4, 24);

		        $scope.tags = $scope.wikiModel.Tags.split(';');

                // getWikiPageHistoryAsync
                $scope.history = data[3].slice(0, 9);
                for (let i = 0; i < $scope.history.length; i++) {
                    $scope.history[i].ModifiedOn = (new Date($scope.history[i].ModifiedOn + " UTC")).toString().slice(4, 24);
                }

                breadcrumb.links = [{'display': 'Wiki', 'href': '/wiki/'},
                                    {'display': $scope.getCategory($scope.wikiModel.CategoryId), 'href': '/wiki/index.html?categoryId=' + $scope.wikiModel.CategoryId}];

                if ($scope.wikiModel.SubCategoryId > 0) {
                    breadcrumb.links.push({'display': $scope.getSubcategory($scope.wikiModel.SubCategoryId), 'href': '/wiki/index.html?categoryId=' + $scope.wikiModel.CategoryId + '&subcategoryId=' + $scope.wikiModel.SubCategoryId});
                }

                breadcrumb.links.push({'display': $scope.wikiModel.Title, 'href': '', 'active': true});
            }
        );
    };

	var getWikiPageAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/wiki/getWikiPage.php',
			method: 'POST',
			data: {"id": id}
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

	var getCategoriesAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/wiki/getCategories.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

	var getSubcategoriesAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/wiki/getSubCategories.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

	$scope.getCategory = function(id) {
		for (var i = 0; i < $scope.categories.length; ++i) {
			if ($scope.categories[i].Id == id) {
				return $scope.categories[i].Name;
			}
		}
		return "";
	};

	$scope.getSubcategory = function(id) {
		for (var i = 0; i < $scope.subcategories.length; ++i) {
			if ($scope.subcategories[i].Id == id) {
				return $scope.subcategories[i].Name;
			}
		}
		return "No Subcategory";
	};

	var getWikiPageHistoryAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/wiki/getWikiPageHistory.php',
			method: 'POST',
			data: {"id": id}
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);

		}, function errorCallback(response){
            deferred.reject(response);

		});

        return deferred.promise;
	};

	initialize();
}]);
