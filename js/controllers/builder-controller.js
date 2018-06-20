app.controller('builder-controller', function($scope, $cookies, $http, itemConstants) {
	//#region ~~~~~~~~~ INITIALIZATION ~~~~~~~~~
	// constants
	$scope.initialize = function() {
		$scope.slots = itemConstants.slots;
		$scope.aligns = itemConstants.aligns;
		$scope.itemsPerPage = 20;
	
		$scope.slotOrder = [0, 1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 11,12,13,13,14,15,15,16,16,17,18,19,20];
		$scope.longhouseList = ["Bear -- ( spi - min )",
								"Beaver -- ( min - dex )",
								"Eagle -- ( per - str )",
								"Moose -- ( str - con )",
								"Snake -- ( dex - per )",
								"Turtle -- ( con - spi )"];
	
		$scope.amuletList = ["Strength", "Mind", "Dexterity", "Constitution", "Perception", "Spirit"];
	
		// item searching vars
		$scope.searchString = "";
		$scope.currentItem = null;
		$scope.itemsBySlot = [];
		$scope.filteredItems = [];
		$scope.sortStat = "Name";
		$scope.sortDir = "+";
	
		for (var i = 0; i < $scope.slots.length; ++i) {
			$scope.itemsBySlot[i] = [];
		}
	
		$scope.getStatCategories();
	}

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

			$scope.loadCookies();
		}, function errorCallback(response){
		});
	}

	$scope.getDefaultList = function(name) {
		list = {};
		list.Name = name;

		// base stats
		list.baseStats = {"Strength": 0, "Mind": 0, "Dexterity": 0, "Constitution": 0, "Perception": 0, "Spirit": 0, "Longhouse": -1, "Amulet": -1};

		// items
		list.items = [];
		for (var i = 0; i < $scope.slotOrder.length; ++i) {
			list.items.push({"Slot": $scope.slotOrder[i], "Name": "-"});
		}

		return list;
	}

	//#endregion

	//#region ~~~~~~~~~ SAVING / LOADING ~~~~~~~~~

	$scope.loadCookies = function() {
		// load columns
		var columnCookie = $cookies.get("sc1");
		if (columnCookie) {
			// wipe initial values
			for (var i = 0; i < $scope.statInfo.length; ++i) {
				$scope.statInfo[i]["showColumn"] = false;
			}

			var columns = columnCookie.split("-");
			for (var i = 0; i < columns.length; ++i) {
				for (var j = 0; j < $scope.statInfo.length; ++j) {
					if (columns[i] == $scope.statInfo[j]["short"]) {
						$scope.statInfo[j]["showColumn"] = true;
					}
				}
			}
		}

		// load lists
		$scope.allLists = [];

		var listCookieStr = $cookies.get("cl1");
		if (listCookieStr) {
			var listStrs = listCookieStr.split("*").filter(function(el) {return el.length != 0});;
			for (var i = 0; i < listStrs.length; ++i) {
				$scope.allLists.push({});

				var listStr = listStrs[i];
				var each = listStr.split("_");
				
				// name
				$scope.allLists[i].Name = each[0];
				each.shift();

				// base stats
				$scope.allLists[i].baseStats = {};
				$scope.allLists[i].baseStats.Strength = Number(each[0]);
				each.shift();

				$scope.allLists[i].baseStats.Mind = Number(each[0]);
				each.shift();

				$scope.allLists[i].baseStats.Dexterity = Number(each[0]);
				each.shift();

				$scope.allLists[i].baseStats.Constitution = Number(each[0]);
				each.shift();

				$scope.allLists[i].baseStats.Perception = Number(each[0]);
				each.shift();

				$scope.allLists[i].baseStats.Spirit = Number(each[0]);
				each.shift();

				$scope.allLists[i].baseStats.Longhouse = Number(each[0]);
				each.shift();

				$scope.allLists[i].baseStats.Amulet = Number(each[0]);
				each.shift();

				// items
				$scope.allLists[i].items = [];
				for (var j = 0; j < each.length; ++j) {
					$scope.allLists[i].items.push({"Id": Number(each[j]), "Slot": $scope.slotOrder[j]});
				}
			}
		}
		if ($scope.allLists.length > 0) {
			var selectedListCookie = $cookies.get("scl1");
			if (selectedListCookie) {
				var found = false;
				for (var i = 0; i < $scope.allLists.length; ++i) {
					if ($scope.allLists[i].Name == selectedListCookie) {
						$scope.selectedListIndex = i;
						found = true;
						break;
					}
				}

				if (!found) {
					$scope.selectedListIndex = 0;
				}
			}
			else {
				$scope.selectedListIndex = 0;
			}
		}
		else {
			$scope.allLists.push($scope.getDefaultList("Untitled"));
			$scope.selectedListIndex = 0;
		}
		$scope.selectList();
	}

	$scope.saveCookies = function() {
		// save columns
		$savedColumns = "";
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			if ($scope.statInfo[i]["showColumn"]) {
				$savedColumns += $scope.statInfo[i]["short"] + "-";
			}
		}
		$cookies.put("sc1", $savedColumns);

		// save lists
		listCookieStr = "";
		for (var i = 0; i < $scope.allLists.length; ++i) {
			listCookieStr += $scope.allLists[i].Name + "_";
			listCookieStr += $scope.allLists[i].baseStats.Strength + "_";
			listCookieStr += $scope.allLists[i].baseStats.Mind + "_";
			listCookieStr += $scope.allLists[i].baseStats.Dexterity + "_";
			listCookieStr += $scope.allLists[i].baseStats.Constitution + "_";
			listCookieStr += $scope.allLists[i].baseStats.Perception + "_";
			listCookieStr += $scope.allLists[i].baseStats.Spirit + "_";
			listCookieStr += $scope.allLists[i].baseStats.Longhouse + "_";
			listCookieStr += $scope.allLists[i].baseStats.Amulet;
			for (var j = 0; j < $scope.allLists[i].items.length; ++j) {
				if ($scope.allLists[i].items[j].Id) {
					listCookieStr += "_" + $scope.allLists[i].items[j].Id;
				}
				else {
					listCookieStr += "_0";
				}
			}
			listCookieStr += "*";
		}
		$cookies.put("cl1", listCookieStr);
		$cookies.put("scl1", $scope.selectedList.Name);
	}

	//#endregion

	//#region ~~~~~~~~~ EVENTS ~~~~~~~~~
	$scope.onRowClicked = function(index) {
		var item = $scope.selectedList.items[index];
		$scope.loadingModal = false;
		$scope.searchString = "";
		$scope.currentItem = item;
		$scope.currentItemIndex = index;
		if ($scope.itemsBySlot[item.Slot].length == 0) {
			$scope.loadingModal = true;
			$http({
				url: '/php/items/getItemsBySlot.php',
				method: 'POST',
				data: {"slot": item.Slot}
			}).then(function succcessCallback(response) {
				// force the items coming in to be the slot we want (for weapons/hold slot shenanigans)
				for (var i = 0; i < response.data.length; ++i) {
					response.data[i].Slot = item.Slot;
				}

				$scope.itemsBySlot[item.Slot] = response.data;
				$scope.itemsBySlot[item.Slot].splice(0, 0, {"Slot": item.Slot, "Id": 0, "Name": "-"});
				$scope.loadingModal = true;

				$scope.filterSearchResults();
			}, function errorCallback(response){
			});
		}
		
		$('#itemChoiceModal').modal();
	}

	$scope.onPreviousClicked = function() {
		$scope.currentPage -= 1;
		if ($scope.currentPage < 1) {
			$scope.currentPage = 1;
		}
	}

	$scope.onNextClicked = function() {
		$scope.currentPage += 1;
		if ($scope.currentPage > $scope.totalPages) {
			$scope.currentPage = $scope.totalPages;
		}
	}

	$scope.onPageClicked = function(num) {
		$scope.currentPage = num + 1;
	}

	$scope.onSearchRowClicked = function(item) {
		$scope.selectedList.items[$scope.currentItemIndex] = item;
		$scope.saveCookies();
		$('#itemChoiceModal').modal('hide');
	}

	$scope.onSearchChange = function() {
		$scope.currentPage = 1;
		$scope.filterSearchResults();
	}

	$scope.onColumnHeaderClicked = function(statVar) {
		if ($scope.sortStat != statVar) {
			$scope.sortStat = statVar;
			$scope.sortDir = "-";
		}
		else {
			if ($scope.sortDir == "+") {
				$scope.sortDir = "-";
			}
			else {
				$scope.sortDir = "+";
			}
		}
		$scope.filteredItems.sort($scope.dynamicSort($scope.sortDir + $scope.sortStat));
	}

	$scope.sortClass = function(statVar) {
		if ($scope.sortStat == "") {
			return "fas fa-sort";
		}

		if ($scope.sortStat != statVar) {
			return "";
		}
		
		if ($scope.sortDir == "+") {
			return "fas fa-sort-up";
		}
		
		return "fas fa-sort-down";
	}
	
	$('#itemChoiceModal').on('shown.bs.modal', function() {
		$scope.currentPage = 1;
		$scope.filterSearchResults();
		$('#itemChoiceSearch').focus();
	});

	$('#addCharacterModal').on('shown.bs.modal', function() {
		$('#addCharacterModalName').focus();
	});

	$('#editCharacterModal').on('shown.bs.modal', function() {
		$('#editCharacterModalName').focus();
	});
	//#endregion
	
	//#region ~~~~~~~~~ COMMANDS ~~~~~~~~~
	$scope.selectList = function() {
		$scope.selectedList = $scope.allLists[$scope.selectedListIndex];
		$scope.editCharacterModel = {"Name": $scope.selectedList.Name};
		var list = $scope.selectedList;

		var ids = [];
		for (var i = 0; i < list.items.length; ++i) {
			if (list.items[i].Id > 0) {
				if (!list.items[i].Name) {
					var slotItems = $scope.itemsBySlot[list.items[i].Slot];
					var found = false;
					if (slotItems.length > 0) {
						for (var j = 0; j < slotItems.length; ++j) {
							if (slotItems[j].Id == list.items[i].Id) {
								found = true;
								list.items[i] = slotItems[j];
								break;
							}
						}
					}
					
					if (!found) {
						list.items[i].Name = "Loading...";
						ids.push(list.items[i].Id);
					}
				}
			}
			else {
				list.items[i].Name = "-";
			}
		}

		if (ids.length > 0) {
			$http({
				url: '/php/items/getItemsInIds.php',
				method: 'POST',
				data: {"ids": ids}
			}).then(function succcessCallback(response) {
				for (var i = 0; i < list.items.length; ++i) {
					for (var j = 0; j < response.data.length; ++j) {
						if (list.items[i].Id == response.data[j].Id) {
							var slot = list.items[i].Slot;
							list.items[i] = response.data[j];
							list.items[i].Slot = slot;
						}
					}
				}
			}, function errorCallback(response){
			});
		}

		$scope.characterName = list.Name;
		$scope.saveCookies();
	}

	$scope.addCharacter = function() {
		// add new list
		$scope.allLists.push($scope.getDefaultList($scope.addCharacterModel.Name));
		$scope.selectedListIndex = $scope.allLists.length - 1;
		$scope.selectList();

		// reset modal
		$("#addCharacterModal").modal("hide");
		$scope.addCharacterModel.Name = "";
	}

	$scope.editCharacter = function() {
		$scope.selectedList.Name = $scope.editCharacterModel.Name;

		$("#editCharacterModal").modal("hide");
	}

	$scope.deleteCharacter = function() {
		var index = $scope.allLists.indexOf($scope.selectedList);
		if (index > -1) {
			$scope.allLists.splice(index, 1);
			if ($scope.allLists.length == 0) {
				$scope.allLists.push($scope.getDefaultList("Untitled"));
				$scope.selectedListIndex = 0;
			}
			if ($scope.selectedListIndex >= $scope.allLists.length) {
				$scope.selectedListIndex = $scope.allLists.length - 1;
			}
			$scope.selectList();
		}
	}

	$scope.openDeleteModal = function() {
		$scope.confirmMessage = "Are you sure you want to delete " + $scope.selectedList.Name + "?";

		$scope.confirmFunc = $scope.deleteCharacter;
		$("#confirmModal").modal("show");
	}

	$scope.clearItemsFromList = function() {
		for (var i = 0; i < $scope.selectedList.items.length; ++i) {
			$scope.selectedList.items[i] = {"Slot": $scope.selectedList.items[i].Slot, "Id": 0, "Name": "-"};
		}
		$scope.saveCookies();
	}

	$scope.openClearModal = function() {
		$scope.confirmMessage = "Are you sure you want to clear all of " + $scope.selectedList.Name + "'s items?";

		$scope.confirmFunc = $scope.clearItemsFromList;
		$("#confirmModal").modal("show");
	}

	$scope.confirm = function() {
		$scope.confirmFunc();

		$("#confirmModal").modal("hide");
	}

	$scope.deleteAllLists = function() {
		$cookies.remove("scl1");
		$cookies.remove("cl1");
		window.location.reload();
	}
	//#endregion

	//#region ~~~~~~~~~ VALIDATION ~~~~~~~~~
	$scope.validateAddCharacter = function() {
		$scope.addCharacterForm.nameInput.$setValidity("duplicate", null);
		$scope.addCharacterForm.nameInput.$setValidity("limit", null);
		for (var i = 0; i < $scope.allLists.length; ++i) {
			if ($scope.allLists[i].Name === $scope.addCharacterModel.Name) {
				$scope.addCharacterForm.nameInput.$setValidity("duplicate", false);
				break;
			}
		}
		if ($scope.allLists.length == 20) {
			$scope.addCharacterForm.nameInput.$setValidity("limit", false);
		}
	}

	$scope.validateEditCharacter = function() {
		$scope.editCharacterForm.nameInput.$setValidity("duplicate", null);
		for (var i = 0; i < $scope.allLists.length; ++i) {
			if ($scope.allLists[i].Name === $scope.selectedList.Name) {
				continue;
			}
			if ($scope.allLists[i].Name === $scope.editCharacterModel.Name) {
				$scope.editCharacterForm.nameInput.$setValidity("duplicate", false);
				break;
			}
		}
	}
	//#endregion

	$scope.sumStats = function(statName) {
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			if ($scope.statInfo[i].var == statName) {
				if ($scope.statInfo[i].type != "int") {
					return "";
				}
				break;
			}
		}
		var total = 0;
		for (var i = 0; i < $scope.selectedList.items.length; ++i) {
			if ($scope.selectedList.items[i][statName]) {
				total += $scope.selectedList.items[i][statName];
			}
		}
		if ($scope.selectedList.baseStats[statName]) {
			total += $scope.selectedList.baseStats[statName];
		}
		switch (statName) {
			case "Strength":
				if ($scope.selectedList.baseStats["Amulet"] == 0) {
					total += 10;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 3) {
					total += 5;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 2) {
					total += 3;
				}
				break;
			case "Mind":
				if ($scope.selectedList.baseStats["Amulet"] == 1) {
					total += 10;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 1) {
					total += 5;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 0) {
					total += 3;
				}
				break;
			case "Dexterity":
				if ($scope.selectedList.baseStats["Amulet"] == 2) {
					total += 10;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 4) {
					total += 5;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 1) {
					total += 3;
				}
				break;
			case "Constitution":
				if ($scope.selectedList.baseStats["Amulet"] == 3) {
					total += 10;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 5) {
					total += 5;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 3) {
					total += 3;
				}
				break;
			case "Perception":
				if ($scope.selectedList.baseStats["Amulet"] == 4) {
					total += 10;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 2) {
					total += 5;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 4) {
					total += 3;
				}
				break;
			case "Spirit":
				if ($scope.selectedList.baseStats["Amulet"] == 5) {
					total += 10;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 0) {
					total += 5;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 5) {
					total += 3;
				}
				break;
		}

		// bonus stats
		if (statName == "Spelldam") {
			total += Math.floor(($scope.sumStats("Mind") - 52) / 2);
		}
		if (statName == "Spellcrit") {
			total += Math.floor(($scope.sumStats("Mind") - 60) / 4);
			total += Math.floor(Math.max($scope.sumStats("Perception") - 60, 0) / 8);
			total += Math.floor(Math.max($scope.sumStats("Spirit") - 60, 0) / 8);
			total += 5;
		}
		if (statName == "Dam") {
			total += Math.floor(($scope.sumStats("Strength") - 15) / 3);
		}
		if (statName == "Mitigation") {
			total += Math.floor(Math.max($scope.sumStats("Constitution") - 70, 0) / 3);
		}
		if (statName == "Ac") {
			var dex = $scope.sumStats("Dexterity");

			var startingPoint = 82;
			var fromDex = Math.floor(Math.max(dex - 40, 0)) * -0.5;
			if (dex >= 20) {
				fromDex -= 5;
				if (dex >= 40) {
					fromDex -= 5;
				}
			}
			
			total += (startingPoint + fromDex);
		}
		return total;
	}

	$scope.dynamicSort = function(property) {
		var sortOrder = 1;
		if (property[0] === "+") {
			property = property.substr(1);
		}
		else if (property[0] === "-") {
			sortOrder = -1;
			property = property.substr(1);
		}
		return function(a,b) {
			if (a[property] === undefined) {
				return -1;
			}
			else if (b[property] === undefined) {
				return 1;
			}

			var a = a[property];
			var b = b[property];
			if (typeof(a) == "string") {
				a = a.toUpperCase();
			}
			if (typeof(b) == "string") {
				b = b.toUpperCase();
			}
			var result = (a < b) ? -1 : (a > b) ? 1 : 0;
			return result * sortOrder;
		}
	}

	$scope.getFilteredSearchResults = function() {
		$scope.totalPages = Math.floor(($scope.filteredItems.length - 1) / $scope.itemsPerPage) + 1;
				
		var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
		return $scope.filteredItems.slice(start, start + $scope.itemsPerPage);
	}

	$scope.filterSearchResults = function() {
		var items = $scope.itemsBySlot[$scope.currentItem.Slot];
		if (items) {
			var filteredItems = items.slice(0);
			var i = filteredItems.length;
			while (i--) {
				if ($scope.searchString != '' && !filteredItems[i].Name.toLowerCase().includes($scope.searchString.toLowerCase())) {
					filteredItems.splice(i, 1);
				}
			}
			
			$scope.filteredItems = filteredItems;
		}
		else {
			$scope.filteredItems = items;
		}

	}

	$scope.getNumberArray = function(num) {
		return new Array(num);
	}

	$scope.initialize();
});
