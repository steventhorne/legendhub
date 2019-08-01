angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('wiki-add', ['$scope', '$http', '$q', 'breadcrumb', function($scope, $http, $q, breadcrumb) {
	var initialize = function() {
		$scope.wikiModel = {Title: "", CategoryId: 0, SubCategoryId: 0, Tags: "", Content: ""};
		$scope.categories = [];
		$scope.allsubcategories = [];
		$scope.subcategories = [];

        loadPage();
	};

    var loadPage = function() {
        $q.all([getCategoriesAsync(), getSubcategoriesAsync()]).then(
            function(data) {
                // getCategoriesAsync
			    $scope.categories = data[0];

                // getSubcategoriesAsync
			    $scope.allsubcategories = data[1];

                breadcrumb.links = [{'display': 'Wiki', 'href': '/wiki/'},
						            {'display': 'Add', 'href': '', 'active': true}];
            }
        );
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

	$scope.onCategoryChanged = function() {
		$scope.subcategories = [];
		$scope.wikiModel.SubCategoryId = 0;
		for (var i = 0; i < $scope.allsubcategories.length; ++i) {
			if ($scope.allsubcategories[i].CategoryId == $scope.wikiModel.CategoryId) {
				$scope.subcategories.push($scope.allsubcategories[i]);
			}
		}
	};

	$scope.submitWiki = function() {
		$http({
			url: '/php/wiki/insertWikiPage.php',
			method: 'POST',
			data: $scope.wikiModel
		}).then(function succcessCallback(response) {
			window.location = "/wiki/details.html?id=" + response.data;
		}, function errorCallback(response){

		});
	};

	initialize();
}]);
