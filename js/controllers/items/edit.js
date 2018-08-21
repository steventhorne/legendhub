angular.module("legendwiki-app").requires.push('ng-showdown');

app.controller('items-edit', function($scope, $http, itemConstants, breadcrumb) {
	$scope.slots = itemConstants.slots;
	$scope.weaponTypes = ['Choose a type', 'Bladed (Str)', 'Piercing (Dex)', 'Blunt (Con)'];
	$scope.aligns = itemConstants.aligns;
	$scope.editing = true;

	$scope.itemModel = {};

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

			$scope.getItem();
		}, function errorCallback(response){
		});
	}

	getUrlParameter = function(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	$scope.getItem = function() {
		$http({
			url: '/php/items/getItem.php',
			method: 'POST',
			data: {"id": getUrlParameter("id")}
		}).then(function succcessCallback(response) {
			$scope.itemModel = response.data;
			$scope.itemModel.TwoHanded = Boolean($scope.itemModel.TwoHanded);
			$scope.itemModel.Holdable = Boolean($scope.itemModel.Holdable);
			$scope.itemModel.UniqueWear = Boolean($scope.itemModel.UniqueWear);
			$scope.itemModel.Bonded = Boolean($scope.itemModel.Bonded);
			$scope.itemModel.Weight = Number($scope.itemModel.Weight);
			$scope.initialItemModel = Object.assign({}, $scope.itemModel);

			breadcrumb.links = [{'display': 'Items', 'href': '/items/'},
								{'display': $scope.slots[$scope.itemModel.Slot], 'href': '/items/index.html?slotId=' + $scope.itemModel.Slot},
								{'display': $scope.itemModel.Name, 'href': '/items/details.html?id=' + $scope.itemModel.Id},
								{'display': 'Edit', 'href': '', 'active': true}];
		}, function errorCallback(response){

		});
	}

	$scope.saveDisabled = function() {
		return !$scope.form.$valid || JSON.stringify($scope.itemModel) === JSON.stringify($scope.initialItemModel);
	}

	$scope.submitItem = function() {
		if (!$scope.form.$valid || JSON.stringify($scope.itemModel) === JSON.stringify($scope.initialItemModel)) {
			return;
		}

		$scope.calcNetStat();

		var postData = Object.assign({}, $scope.itemModel);
		delete postData.ModifiedOn;
		delete postData.ModifiedBy;
		delete postData.ModifiedByIP;
		delete postData.ModifiedByIPForward;
		$http({
			url: '/php/items/updateItem.php',
			method: 'POST',
			data: postData
		}).then(function succcessCallback(response) {
			window.location = "/items/details.html?id=" + $scope.itemModel.Id;
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
