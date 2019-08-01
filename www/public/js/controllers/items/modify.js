app.controller('items-modify', ['$scope', '$http', '$q', '$cookies', function($scope, $http, $q, $cookies) {
    /** Initializes the controller. */
    var initialize = function() {
        loadPage();
    };

    var loadPage = function() {
        getItemAsync(getUrlParameter("id")).then(
            function(data) {
                $scope.item = data.data.getItemById;
                $scope.initialItem = angular.copy($scope.item);
            }
        );
    };

    /**
     * Gets the item by the given Id.
     *
     * @param {int} id - the id of the item to be retrieved.
     * @return {Promise} a promise containing the item data.
     */
	var getItemAsync = function(id) {
        var deferred = $q.defer();

        let query = "{getItemById(id:" + id + "){" +
            "id " +
            "name " +
            "slot " +
            "strength " +
            "mind " +
            "dexterity " +
            "constitution " +
            "perception " +
            "spirit " +
            "ac " +
            "hit " +
            "dam " +
            "hp " +
            "hpr " +
            "ma " +
            "mar " +
            "mv " +
            "mvr " +
            "spelldam " +
            "spellcrit " +
            "manaReduction " +
            "mitigation " +
            "accuracy " +
            "ammo " +
            "twoHanded " +
            "quality " +
            "maxDam " +
            "avgDam " +
            "minDam " +
            "parry " +
            "holdable " +
            "rent " +
            "value " +
            "weight " +
            "speedFactor " +
            "notes " +
            "modifiedBy " +
            "modifiedOn " +
            "uniqueWear " +
            "modifiedByIP " +
            "modifiedByIPForward " +
            "alignRestriction " +
            "bonded " +
            "casts " +
            "level " +
            "netStat " +
            "concentration " +
            "rangedAccuracy " +
            "mobId " +
            "questId " +
            "weaponType " +
            "weaponStat " +
            "isLight " +
            "isHeroic " +
            "getMob{name areaName} " +
            "getQuest{title areaName}}}";

		$http({
			url: '/api',
			method: 'POST',
			data: {"query": query}
		}).then(function succcessCallback(response) {
            deferred.resolve(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Whether the save button should be enabled for editing.
     *
     * @return {bool} true if the save button should be enabled.
     */
    $scope.canEdit = function() {
        return $scope.itemForm.$valid && angular.toJson($scope.item) !== angular.toJson($scope.initialItem);
    };

    /**
     * Whether the save button should be enabled for adding.
     *
     * @return {bool} true if the save button should be enabled.
     */
    $scope.canAdd = function() {
        return $scope.itemForm.$valid;
    };

    /**
     * Submits the item for edit.
     *
     * @param {object} item - the item model to submit.
     */
    $scope.editItem = function(item) {
        let query = ["mutation{updateItem(id:",item.id,","];
        query.push("name:'",item.name.replace(/'/g, "\\'"),"',");
        query.push("slot:",item.slot,",");
        query.push("strength:",item.strength,",");
        query.push("mind:",item.mind,",");
        query.push("dexterity:",item.dexterity,",");
        query.push("constitution:",item.constitution,",");
        query.push("perception:",item.perception,",");
        query.push("spirit:",item.spirit,",");
        query.push("ac:",item.ac,",");
        query.push("hit:",item.hit,",");
        query.push("dam:",item.dam,",");
        query.push("hp:",item.hp,",");
        query.push("hpr:",item.hpr,",");
        query.push("ma:",item.ma,",");
        query.push("mar:",item.mar,",");
        query.push("mv:",item.mv,",");
        query.push("mvr:",item.mvr,",");
        query.push("spelldam:",item.spelldam,",");
        query.push("spellcrit:",item.spellcrit,",");
        query.push("manaReduction:",item.manaReduction,",");
        query.push("mitigation:",item.mitigation,",");
        query.push("accuracy:",item.accuracy,",");
        query.push("ammo:",item.ammo,",");
        query.push("twoHanded:",item.twoHanded,",");
        query.push("quality:",item.quality,",");
        query.push("maxDam:",item.maxDam,",");
        query.push("avgDam:",item.avgDam,",");
        query.push("minDam:",item.minDam,",");
        query.push("parry:",item.parry,",");
        query.push("holdable:",item.holdable,",");
        query.push("rent:",item.rent,",");
        query.push("value:",item.value,",");
        query.push("weight:",item.weight,",");
        query.push("speedFactor:",item.speedFactor,",");
        query.push("notes:'",(item.notes||"").replace(/'/g, "\\'"),"',");
        query.push("uniqueWear:",item.uniqueWear,",");
        query.push("alignRestriction:",item.alignRestriction,",");
        query.push("bonded:",item.bonded,",");
        query.push("casts:'",(item.casts||"").replace(/'/g, "\\'"),"',");
        query.push("level:",item.level,",");
        query.push("concentration:",item.concentration,",");
        query.push("rangedAccuracy:",item.rangedAccuracy,",");
        query.push("mobId:",item.mobId,",");
        query.push("questId:",item.questId,",");
        query.push("weaponType:",item.weaponType,",");
        query.push("weaponStat:",item.weaponStat,",");
        query.push("isLight:",item.isLight,",");
        query.push("isHeroic:",item.isHeroic,"){token expires}}");

        $http({
			url: '/api',
			method: 'POST',
			data: {"query": query.join("")}
		}).then(function succcessCallback(response) {
            console.log(response);
		}, function errorCallback(response){
		});
    };

    /**
     * Submits the item for add.
     *
     * @param {object} item - the item model to submit.
     */
    $scope.addItem = function(item) {
        console.log($cookies.get("authToken"));
        return;
        let query = ["mutation{insertItem(id:",item.id,","];
        query.push("token:'",$cookies.token,"',");
        query.push("name:'",item.name.replace(/'/g, "\\'"),"',");
        query.push("slot:",item.slot,",");
        query.push("strength:",item.strength,",");
        query.push("mind:",item.mind,",");
        query.push("dexterity:",item.dexterity,",");
        query.push("constitution:",item.constitution,",");
        query.push("perception:",item.perception,",");
        query.push("spirit:",item.spirit,",");
        query.push("ac:",item.ac,",");
        query.push("hit:",item.hit,",");
        query.push("dam:",item.dam,",");
        query.push("hp:",item.hp,",");
        query.push("hpr:",item.hpr,",");
        query.push("ma:",item.ma,",");
        query.push("mar:",item.mar,",");
        query.push("mv:",item.mv,",");
        query.push("mvr:",item.mvr,",");
        query.push("spelldam:",item.spelldam,",");
        query.push("spellcrit:",item.spellcrit,",");
        query.push("manaReduction:",item.manaReduction,",");
        query.push("mitigation:",item.mitigation,",");
        query.push("accuracy:",item.accuracy,",");
        query.push("ammo:",item.ammo,",");
        query.push("twoHanded:",item.twoHanded,",");
        query.push("quality:",item.quality,",");
        query.push("maxDam:",item.maxDam,",");
        query.push("avgDam:",item.avgDam,",");
        query.push("minDam:",item.minDam,",");
        query.push("parry:",item.parry,",");
        query.push("holdable:",item.holdable,",");
        query.push("rent:",item.rent,",");
        query.push("value:",item.value,",");
        query.push("weight:",item.weight,",");
        query.push("speedFactor:",item.speedFactor,",");
        query.push("notes:'",(item.notes||"").replace(/'/g, "\\'"),"',");
        query.push("uniqueWear:",item.uniqueWear,",");
        query.push("alignRestriction:",item.alignRestriction,",");
        query.push("bonded:",item.bonded,",");
        query.push("casts:'",(item.casts||"").replace(/'/g, "\\'"),"',");
        query.push("level:",item.level,",");
        query.push("concentration:",item.concentration,",");
        query.push("rangedAccuracy:",item.rangedAccuracy,",");
        query.push("mobId:",item.mobId,",");
        query.push("questId:",item.questId,",");
        query.push("weaponType:",item.weaponType,",");
        query.push("weaponStat:",item.weaponStat,",");
        query.push("isLight:",item.isLight,",");
        query.push("isHeroic:",item.isHeroic,"){id tokenRenewal{token expires}}}");

        $http({
			url: '/api',
			method: 'POST',
			data: {"query": query.join("")}
		}).then(function succcessCallback(response) {
            console.log(response);
		}, function errorCallback(response){
		});
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
