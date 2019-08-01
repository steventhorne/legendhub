angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('items-add', ['$scope', '$http', '$q', 'itemConstants', 'breadcrumb', function($scope, $http, $q, itemConstants, breadcrumb) {
    /** Initializes the controller. */
    var initialize = function() {
        $scope.slots = itemConstants.selectOptions.Slot;
	    $scope.aligns = itemConstants.selectOptions.AlignRestriction;
        $scope.selectOptions = itemConstants.selectOptions;

	    $scope.itemModel = {};

	    breadcrumb.links = [{'display': 'Items', 'href': '/items/'},
						    {'display': 'Add', 'href': '', 'active': true}];

        loadPage();
    };

    /** Calls the async functions needed before displaying the page. */
    var loadPage = function() {
        $q.all([getStatCategoriesAsync(), getStatInfoAsync()]).then(
            function(data) {
			    $scope.statCategories = data[0];

                $scope.statInfo = data[1];

                // set defaults
                for (var i = 0; i < $scope.statInfo.length;++i) {
                    var stat = $scope.statInfo[i];
                    $scope.itemModel[stat.var] = stat.default;
                }
                $scope.itemModel.AlignRestriction = 0;
                $scope.itemModel.ModifiedBy = "UNKNOWN";
            }
        );
    };


    /**
     * Gets the stat category information from the server.
     *
     * return {Promise} a promise containing the category info.
     */
	var getStatCategoriesAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItemCategories.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Gets the stat information from the server.
     *
     * return {Promise} a promise containing the stat info.
     */
	var getStatInfoAsync = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItemStats.php'
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Submits the given item to the server.
     *
     * @param {object} itemModel - the item to be submitted.
     */
	$scope.submitItem = function(itemModel) {
		$scope.calcNetStat(itemModel);

		$http({
			url: '/php/items/insertItem.php',
			method: 'POST',
			data: itemModel
		}).then(function succcessCallback(response) {
			window.location = "/items/details.html?id=" + response.data;
		}, function errorCallback(response){

		});
	};

    /**
     * Calculates the net stat for a given item.
     *
     * @param {object} itemModel - The item to calculate for.
     */
	$scope.calcNetStat = function(itemModel) {
		var netStat = 0;

		for (var i = 0; i < $scope.statInfo.length; ++i) {
			var stat = $scope.statInfo[i];
			if (stat.netStat > 0 && stat.type == "int") {
				netStat += itemModel[stat.var] / stat.netStat;
			}
		}

		itemModel['NetStat'] = netStat;
	};

    /**
     * Gets whether we should display a certain stat category.
     *
     * @param {string} category - the category in question.
     * @param {object} itemModel - the item in question.
     * @return {bool} true if the category should be shown.
     */
	$scope.shouldShowCategory = function(category, itemModel) {
		return category["name"] != "Weapon" || itemModel.Slot == 14;
	};

    /**
     * Searches mobs based on their name.
     *
     * @param {string} searchString - the string to use in the search.
     */
	$scope.searchMobs = function(searchString) {
		$http({
			url: '/php/mobs/getMobs.php',
			method: 'POST',
			data: {"searchString": searchString}
		}).then(function succcessCallback(response) {
			$scope.mobSearchResults = response.data;
		}, function errorCallback(response){

		});
	};

    /**
     * Event for when a mob is selected in the search window.
     *
     * @param {object} mob - the mob that was selected.
     */
	$scope.onMobSelected = function(mob) {
		$scope.itemModel['MobName'] = mob.Name;
		$('#mobModal').modal('hide');
	};

    /** Event for when the add mob button is clicked. */
	$scope.onAddMobClicked = function() {
		$scope.itemModel['MobName'] = $scope.mobAddName;
		$('#mobModal').modal('hide');
	};

	$('#mobModal').on('shown.bs.modal', function (e) {
		$('#mobSearchInput').trigger('focus');
	});

    /**
     * Searches quests based on their title.
     *
     * @param {string} searchString - the string to use in the search.
     */
	$scope.searchQuests = function(searchString) {
		$http({
			url: '/php/quests/getQuests.php',
			method: 'POST',
			data: {"searchString": searchString}
		}).then(function succcessCallback(response) {
			$scope.questSearchResults = response.data;
		}, function errorCallback(response){

		});
	};

    /**
     * Event for when a quest is selected in the search window.
     *
     * @param {object} quest - the quest that was selected.
     */
	$scope.onQuestSelected = function(quest) {
		$scope.itemModel['QuestTitle'] = quest.Title;
		$scope.itemModel['QuestId'] = quest.Id;
		$('#questModal').modal('hide');
	};

    initialize();
}]);
