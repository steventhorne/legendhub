angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('items-edit', ['$scope', '$http', '$q', 'itemConstants', 'breadcrumb', function($scope, $http, $q, itemConstants, breadcrumb) {
    /** Initializes the controller. */
    var initialize = function() {
        $scope.slots = itemConstants.selectOptions.Slot;
        $scope.aligns = itemConstants.selectOptions.AlignRestriction;
        $scope.selectOptions = itemConstants.selectOptions;

        loadPage();
    };

    var loadPage = function() {
        $q.all([getStatCategoriesAsync(), getStatInfoAsync()]).then(
            function(data) {
			    $scope.statCategories = data[0];
                $scope.statInfo = data[1];

                getItemAsync(getUrlParameter("id")).then(
                    function(data) {
                        $scope.itemModel = data;

                        if (data == null) {
                            breadcrumb.links = [{'display': 'Items', 'href': '/items/'},
                                                {'display': 'Not Found', 'href': '', 'active': true}];
                            return;
                        }

                        for (var i = 0; i < $scope.statInfo.length; ++i) {
                            if ($scope.statInfo[i].type === "bool") {
                                $scope.itemModel[$scope.statInfo[i].var] = Boolean($scope.itemModel[$scope.statInfo[i].var]);
                            }
                            else if ($scope.statInfo[i].type === "decimal") {
                                $scope.itemModel[$scope.statInfo[i].var] = Number($scope.itemModel[$scope.statInfo[i].var]);
                            }
                        }

                        $scope.initialItemModel = angular.copy($scope.itemModel);

                        breadcrumb.links = [{'display': 'Items', 'href': '/items/'},
                                            {'display': $scope.slots[$scope.itemModel.Slot], 'href': '/items/index.html?slotId=' + $scope.itemModel.Slot},
                                            {'display': $scope.itemModel.Name, 'href': '/items/details.html?id=' + $scope.itemModel.Id},
                                            {'display': 'Edit', 'href': '', 'active': true}];
                    }
                )
            }
        );
    };

    /**
     * Gets the stat category information from the server.
     *
     * @return {Promise} a promise containing the category info.
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
     * @return {Promise} a promise containing the stat info.
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
     * Gets the item by the given Id.
     *
     * @param {int} id - the id of the item to be retrieved.
     * @return {Promise} a promise containing the item data.
     */
	var getItemAsync = function(id) {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItem.php',
			method: 'POST',
			data: {"id": id}
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Whether the save button should be disabled
     *
     * @return {bool} true is the save button should be disabled.
     */
	$scope.shouldDisableSave = function() {
		return !$scope.form.$valid || angular.toJson($scope.itemModel) === angular.toJson($scope.initialItemModel);
	};

    /**
     * Submits the item data to the server.
     *
     * @param {object} itemModel - the item model to submit.
     */
	$scope.submitItem = function(itemModel) {
		if (!$scope.form.$valid || angular.toJson(itemModel) === angular.toJson($scope.initialItemModel)) {
			return;
		}

		itemModel['NetStat'] = calcNetStat(itemModel);

		var postData = angular.copy(itemModel);
		delete postData.ModifiedOn;
		delete postData.ModifiedBy;
		delete postData.ModifiedByIP;
		delete postData.ModifiedByIPForward;
		$http({
			url: '/php/items/updateItem.php',
			method: 'POST',
			data: postData
		}).then(function succcessCallback(response) {
			window.location = "/items/details.html?id=" + itemModel.Id;
		}, function errorCallback(response){

		});
	};

    /**
     * Calculates the net stat for the given item.
     *
     * @param {object} itemModel - the item to calculate for.
     * @return {int} the net stat value.
     */
	var calcNetStat = function(itemModel) {
		var netStat = 0;
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			var stat = $scope.statInfo[i];
			if (stat.netStat > 0 && stat.type == "int") {
				netStat += itemModel[stat.var] / stat.netStat;
			}
		}

        return netStat;
	};

    /**
     * Whether the specified category should be shown for the given item.
     *
     * @param {string} category - the category in question.
     * @param {object} itemModel - the item in question.
     * @return {bool} true if the category should be shown.
     */
	$scope.shouldShowCategory = function(category, itemModel) {
		return itemModel && (category["name"] != "Weapon" || itemModel.Slot == 14);
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
	$scope.addMob = function() {
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
