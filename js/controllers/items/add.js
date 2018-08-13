angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('items-add', function($scope, $http, itemConstants, breadcrumb) {
	$scope.slots = itemConstants.slots;
	$scope.weaponTypes = ['Choose a type', 'Bladed (Str)', 'Piercing (Dex)', 'Blunt (Con)'];
	$scope.aligns = itemConstants.aligns;
	$scope.itemModel = {};

	breadcrumb.links = [{'display': 'Items', 'href': '/items/'},
						{'display': 'Add', 'href': '', 'active': true}];

	$scope.getStatCategories = function() {
		$http({
			url: '/php/items/getItemCategories.php'
		}).then(function succcessCallback(response) {
			$scope.statCategories = response.data;
			
			$scope.getStatInfo();
		}, function errorCallback(response){

		});
	}

	$scope.getStatInfo = function() {
		$http({
			url: '/php/items/getItemStats.php'
		}).then(function succcessCallback(response) {
			$scope.statInfo = response.data;

			// set defaults
			for (var i = 0; i < $scope.statInfo.length;++i) {
				var stat = $scope.statInfo[i];
				$scope.itemModel[stat["var"]] = stat["default"];
			}
			$scope.itemModel["AlignRestriction"] = 0;
			$scope.itemModel["ModifiedBy"] = "UNKNOWN";
		}, function errorCallback(response){
		});
	}

	$scope.submitItem = function() {
		$scope.calcNetStat();
		$http({
			url: '/php/items/insertItem.php',
			method: 'POST',
			data: $scope.itemModel
		}).then(function succcessCallback(response) {
			window.location = "/items/details.html?id=" + response.data;
		}, function errorCallback(response){

		});
	}

	$scope.calcNetStat = function() {
		var netStat = 0;
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			var stat = $scope.statInfo[i];
			if (stat.netStat > 0 && stat.type == "int") {
				netStat += $scope.itemModel[stat.var] / stat.netStat;
			}
		}
		$scope.itemModel['NetStat'] = netStat;
	}

	$scope.showCategory = function(category) {
		return category["name"] != "Weapon" || $scope.itemModel.Slot == 14;
	}

	$scope.searchMobs = function() {
		$http({
			url: '/php/mobs/getMobs.php',
			method: 'POST',
			data: {"searchString": $scope.mobSearchName}
		}).then(function succcessCallback(response) {
			$scope.mobSearchResults = response.data;
		}, function errorCallback(response){

		});
	}
	
	$scope.onMobSelected = function(mob) {
		$scope.itemModel['MobName'] = mob.Name;
		$('#mobModal').modal('hide');
	}

	$scope.addMob = function() {
		$scope.itemModel['MobName'] = $scope.mobAddName;
		$('#mobModal').modal('hide');
	}

	$('#mobModal').on('shown.bs.modal', function (e) {
		$('#mobSearchInput').trigger('focus');
	});

	$scope.searchQuests = function() {
		$http({
			url: '/php/quests/getQuests.php',
			method: 'POST',
			data: {"searchString": $scope.questSearchName}
		}).then(function succcessCallback(response) {
			$scope.questSearchResults = response.data;
		}, function errorCallback(response){

		});
	}
	
	$scope.onQuestSelected = function(quest) {
		$scope.itemModel['QuestTitle'] = quest.Title;
		$scope.itemModel['QuestId'] = quest.Id;
		$('#questModal').modal('hide');
	}

	$scope.getStatCategories();
});
