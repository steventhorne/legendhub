angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('wiki-edit', ['$scope', '$http', '$q', 'breadcrumb', function($scope, $http, $q, breadcrumb) {
	var initialize = function() {
		$scope.wikiModel = {Title: "", CategoryId: 0, SubCategoryId: 0, Tags: "", Content: ""};
		$scope.categories = [];
		$scope.allsubcategories = [];
		$scope.subcategories = [];

        loadPage();
	};

    var loadPage = function() {
        $q.all([getWikiPageAsync(getUrlParameter("id")), getCategoriesAsync(), getSubcategoriesAsync()]).then(
            function(data) {
                // getWikiPageAsync
                $scope.wikiModel = data[0];
                if (data[2] == null) {
                    breadcrumb.links = [{'display': 'Wiki', 'href': '/wiki/'},
                                        {'display': 'Not Found', 'href': '', 'active': true}];
                    return;
                }

                $scope.wikiModel.ModifiedOn = (new Date($scope.wikiModel.ModifiedOn + " UTC")).toString().slice(4, 24);
                $scope.initialWikiModel = angular.copy($scope.wikiModel);

                // getCateogires
                $scope.categories = data[1];

                // getSubcategores
			    $scope.allsubcategories = data[2];
                $scope.loadSubcategories();

                breadcrumb.links = [{'display': 'Wiki', 'href': '/wiki/'},
                                    {'display': $scope.getCategory($scope.wikiModel.CategoryId), 'href': '/wiki/index.html?categoryId=' + $scope.wikiModel.CategoryId}];

                if ($scope.wikiModel.SubCategoryId > 0) {
                    breadcrumb.links.push({'display': $scope.getSubcategory($scope.wikiModel.SubCategoryId), 'href': '/wiki/index.html?categoryId=' + $scope.wikiModel.CategoryId + '&subcategoryId=' + $scope.wikiModel.SubCategoryId});
                }

                breadcrumb.links.push({'display': $scope.wikiModel.Title, 'href': '/wiki/details.html?id=' + $scope.wikiModel.Id});
                breadcrumb.links.push({'display': 'Edit', 'href': '', 'active': true});
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

	$scope.loadSubcategories = function() {
		$scope.subcategories = [];
		for (var i = 0; i < $scope.allsubcategories.length; ++i) {
            console.log($scope.wikiModel);
			if ($scope.allsubcategories[i].CategoryId == $scope.wikiModel.CategoryId) {
				$scope.subcategories.push($scope.allsubcategories[i]);
			}
		}
	};

	$scope.onCategoryChanged = function() {
		$scope.wikiModel.SubCategoryId = 0;
		$scope.loadSubcategories();
	};

	$scope.saveDisabled = function() {
		return !$scope.form.$valid || angular.toJson($scope.wikiModel) === angular.toJson($scope.initialWikiModel);
	};

	$scope.submitWiki = function() {
		$http({
			url: '/php/wiki/updateWikiPage.php',
			method: 'POST',
			data: $scope.wikiModel
		}).then(function succcessCallback(response) {
			window.location = "/wiki/details.html?id=" + response.data;
		}, function errorCallback(response){

		});
	};

	initialize();
}]);
