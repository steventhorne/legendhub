app.controller('builder', ["$scope", "$cookies", "$http", "$q", "$timeout", "itemConstants", function($scope, $cookies, $http, $q, $timeout, itemConstants) {
	//#region ~~~~~~~~~ INITIALIZATION ~~~~~~~~~

    /** Initializes the controller. */
	$scope.initialize = function() {
		$scope.slots = itemConstants.selectShortOptions.Slot;
        $scope.selectShortOptions = itemConstants.selectShortOptions;

		$scope.itemsPerPage = 20;

		$scope.slotOrder = [0,1,1,2,2,3,4,5,6,7,8,9,11,12,13,13,14,15,15,16,16,17,18,19,20,21,21,21,21];
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
		$scope.sortStat = "";
		$scope.sortDir = "";

		for (var i = 0; i < $scope.slots.length; ++i) {
			$scope.itemsBySlot[i] = [];
		}

        loadPage();
	};

    /**
     * Loads information necessary for displaying the page
     */
    var loadPage = function() {
        $q.all([getStatCategories(), getStatInfo()]).then(
            function(data) {
                $scope.statCategories = data[0];
                $scope.statInfo = data[1]
                $scope.defaultStatInfo = angular.copy(data[1])

                loadClientSideData();
            }
        );
    };

    /**
     * Gets the stat category information from the server.
     *
     * @return {Promise} the promise that contains the category info.
     */
	var getStatCategories = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItemCategories.php'
		}).then(function successCallback(response) {
            deferred.resolve(response.data);
			//$scope.statCategories = response.data;
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Gets the stat information from the server.
     *
     * @return {Promise} the promise that contains the stat info.
     */
	var getStatInfo = function() {
        var deferred = $q.defer();

		$http({
			url: '/php/items/getItemStats.php'
		}).then(function successCallback(response) {
            deferred.resolve(response.data);
			// $scope.statInfo = response.data;
			// $scope.defaultStatInfo = angular.copy(response.data);
		}, function errorCallback(response){
            deferred.reject(response);
		});

        return deferred.promise;
	};

    /**
     * Gets a blank list for use when adding a new list
     *
     * @param {string} name - the name for the list.
     */
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
	};

	//#endregion

	//#region ~~~~~~~~~ SAVING / LOADING ~~~~~~~~~
    /**
     * Loads the selected columns from a cookie and
     * replaces the info in the provided array.
     *
     * @param {string} cookie - the cookie for loading the columns
     * @param {array} statInfo - the statInfo array to set the settings in
     */
    var loadSelectedColumns = function(cookie, statInfo) {
        if (cookie) {
			// wipe initial values
			for (var i = 0; i < statInfo.length; ++i) {
				statInfo[i]["showColumn"] = false;
			}

			var columns = cookie.split("-");
			for (var i = 0; i < columns.length; ++i) {
				for (var j = 0; j < statInfo.length; ++j) {
					if (columns[i] == statInfo[j]["short"]) {
						statInfo[j]["showColumn"] = true;
					}
				}
			}
		}
    };

    /**
     * Loads the users lists from the cookie
     *
     * @param {string} listCookie - the cookie string that contains the saved lists.
     * @return {array} The array of character lists.
     */
    var loadCharacterLists = function(listCookie) {
        var lists = [];

        if (listCookie) {
			var listStrs = listCookie.split("*").filter(function(el) {return el.length != 0});
			for (var i = 0; i < listStrs.length; ++i) {
				var newList = createListFromString(listStrs[i]);

                var found = false;
                for (let j = 0; j < lists.length; ++j) {
                    if (newList.Name === lists[j].Name) {
                        foundList = lists[j];
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    lists.push({Name: newList.Name, Variants: []});
                    foundList = lists[lists.length - 1];
                }

                foundList.Variants.push(newList.Variants[0]);
			}
		}


        return lists;
    };

    var createListFromString = function(listStr) {
        var each = listStr.split("_");

        var nameParts = each[0].split("!");
        var name = nameParts[0];
        if (nameParts.length === 2) {
            var variantName = nameParts[1];
        }
        else {
            var variantName = "Original";
        }

        // name
        newList = {Name: variantName};
        each.shift();

        // base stats
        newList.baseStats = {};
        newList.baseStats.Strength = Number(each[0]);
        each.shift();

        newList.baseStats.Mind = Number(each[0]);
        each.shift();

        newList.baseStats.Dexterity = Number(each[0]);
        each.shift();

        newList.baseStats.Constitution = Number(each[0]);
        each.shift();

        newList.baseStats.Perception = Number(each[0]);
        each.shift();

        newList.baseStats.Spirit = Number(each[0]);
        each.shift();

        newList.baseStats.Longhouse = Number(each[0]);
        each.shift();

        newList.baseStats.Amulet = Number(each[0]);
        each.shift();

        // items
        newList.items = [];
        for (var j = 0; j < each.length; ++j) {
            var isLocked = each[j][0] === "!";
            if (isLocked) {
                each[j] = each[j].substr(1);
            }
            newList.items.push({"Id": Number(each[j]), "Slot": $scope.slotOrder[j], "Locked": isLocked});
        }

        if (each.length < 29) {
            for (var k = 0; k < (29 - each.length); ++k) {
                newList.items.push({"Id": Number(each[j]), "Slot": 21});
            }
        }

        return {Name: name, Variants: [newList]};
    };

    /**
     * Selects a character list via the name of the character.
     *
     * @param {string} name - The name of the character.
     */
    var selectListByName = function(name, variantName) {
        var listIndex = 0;
        var variantIndex = 0;
        if ($scope.allLists.length > 0) {
			if (name) {
				for (let i = 0; i < $scope.allLists.length; ++i) {
					if ($scope.allLists[i].Name === name) {
						listIndex = i;

                        if (variantName) {
                            for (let j = 0; j < $scope.allLists[i].Variants.length; ++j) {
                                if ($scope.allLists[i].Variants[j].Name === variantName) {
                                    variantIndex = j;
                                    break;
                                }
                            }
                        }
						break;
					}
				}
			}
		}
		else {
			addCharacterList("Untitled");
		}

        selectListByIndex(listIndex, variantIndex);
    };

    /**
     * Selects a character list via the index of the list in the array.
     *
     * @param {int} index - The index of the list in the character list array.
     */
    var selectListByIndex = function(index, variantIndex = 0) {
        $scope.selectedListIndex = index;
        selectListVariantByIndex(index, variantIndex);

    };

    /**
     * Selects a character variant list via the index of both the list and variant in the arrays.
     *
     * @param {int} listIndex - The index of the list in the character list array.
     * @param {int} variantIndex - The index of the variant in the variant array of the character list.
     */
    var selectListVariantByIndex = function(listIndex, variantIndex) {
        $scope.selectedListVariantIndex = variantIndex;
        $scope.selectedList = $scope.allLists[listIndex].Variants[variantIndex];
		$scope.editCharacterModel = {"Name": $scope.allLists[listIndex].Name};
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
                                var isLocked = list.items[i].Locked;
								list.items[i] = slotItems[j];
                                list.items[i].Locked = isLocked;
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
            getItemsInId(ids).then(
                function(data) {
                    for (var i = 0; i < list.items.length; ++i) {
                        for (var j = 0; j < data.length; ++j) {
                            if (list.items[i].Id == data[j].Id) {
                                var isLocked = list.items[i].Locked;
                                list.items[i] = angular.copy(data[j]);
                                list.items[i].Locked = isLocked;
                                list.items[i].Slot = $scope.slotOrder[i];
                                break;
                            }
                        }

                        if (list.items[i].Name == "Loading...") {
                            list.items[i].Name = "DELETED";
                        }
                    }

                    applyItemRestrictions(); // to apply restrictions
                }
            );
		}
		applyItemRestrictions(); // to apply restrictions

		$scope.characterName = list.Name;
		$scope.saveClientSideData();
    };

    /**
     * Gets the items for each id provided
     *
     * @param {array} ids - the array of ids for each item needed.
     * @return {Promise} the promise that contains the item response.
     */
    var getItemsInId = function(ids) {
        var deferred = $q.defer();

        $http({
            url: '/php/items/getItemsInIds.php',
            method: 'POST',
            data: {"ids": ids}
        }).then(function successCallback(response) {
            deferred.resolve(response.data);
        }, function errorCallback(response){
            deferred.reject(response);
        });

        return deferred.promise;
    };

    /**
     * Loads the user data from cookies and local storage
     */
	var loadClientSideData = function() {
		// remove old cookies
		$cookies.remove("sc1", {"path": "/"});

		// load columns
		if ($cookies.get("cookie-consent")) {
			var columnCookie = $cookies.get("sc2");
		}
        loadSelectedColumns(columnCookie, $scope.statInfo);

		// load lists
		if ($cookies.get("cookie-consent")) {
			var listCookieStr = localStorage.getItem("cl");
			if (!listCookieStr) {
				listCookieStr = $cookies.get("cl1");
			}
		}
		$scope.allLists = loadCharacterLists(listCookieStr);

		// load selected list
		if ($cookies.get("cookie-consent")) {
			var selectedListCookie = localStorage.getItem("scl");
			if (!selectedListCookie) {
				selectedListCookie = $cookies.get("scl1");
			}
		}

        if (selectedListCookie) {
            var splitListCookie = selectedListCookie.split("!");
            if (splitListCookie.length === 1) {
                selectListByName(splitListCookie[0]);
            }
            else if (splitListCookie.length === 2) {
                selectListByName(splitListCookie[0], splitListCookie[1]);
            }
        }
        else {
            selectListByName();
        }

	};

    /**
     * Saves the user info to client side storage
     */
	$scope.saveClientSideData = function() {
		if (!$cookies.get("cookie-consent")) {
			return;
		}
		// save columns
		var cookieDate = new Date();
		cookieDate.setFullYear(cookieDate.getFullYear() + 20);

		$savedColumns = "";
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			if ($scope.statInfo[i]["showColumn"]) {
				$savedColumns += $scope.statInfo[i]["short"] + "-";
			}
		}
		$cookies.put("sc2", $savedColumns, {"path": "/", 'expires': cookieDate});

		// save lists
		listCookieStr = "";
		for (let i = 0; i < $scope.allLists.length; ++i) {
            for (let j = 0; j < $scope.allLists[i].Variants.length; ++j) {
                listCookieStr += createStringFromList(
                    $scope.allLists[i].Name,
                    $scope.allLists[i].Variants[j]
                );

                listCookieStr += "*";
            }
        }

		localStorage.setItem("cl", listCookieStr);
		localStorage.setItem("scl", $scope.allLists[$scope.selectedListIndex].Name + "!" + $scope.selectedList.Name);

		if ($cookies.get("cl1")) {
			$cookies.remove("cl1");
			$cookies.remove("scl1");
		}
	};

    var createStringFromList = function(listName, list) {
        var listCookieStr = listName + "!" + list.Name + "_";
        listCookieStr += list.baseStats.Strength + "_";
        listCookieStr += list.baseStats.Mind + "_";
        listCookieStr += list.baseStats.Dexterity + "_";
        listCookieStr += list.baseStats.Constitution + "_";
        listCookieStr += list.baseStats.Perception + "_";
        listCookieStr += list.baseStats.Spirit + "_";
        listCookieStr += list.baseStats.Longhouse + "_";
        listCookieStr += list.baseStats.Amulet;
        for (let k = 0; k < list.items.length; ++k) {
            if (list.items[k].Id) {
                listCookieStr += "_" + (list.items[k].Locked ? "!" : "") + list.items[k].Id;
            }
            else {
                listCookieStr += "_0";
            }
        }

        return listCookieStr;
    };

    var addCharacterList = function(name) {
		$scope.allLists.push({Name: name, Variants: []});
        $scope.selectedListIndex = $scope.allLists.length - 1;
        $scope.addCharacterVariant($scope.allLists.length - 1);
    };

    $scope.addCharacterVariant = function(listIndex) {
        var variantCount = $scope.allLists[$scope.selectedListIndex].Variants.length;

        if (listIndex === $scope.selectedListIndex && variantCount > 0) {
            var variantCopy = angular.copy($scope.allLists[$scope.selectedListIndex].Variants[$scope.selectedListVariantIndex]);
            variantCopy.Name += " Copy";
        }
        else {
            var variantCopy = $scope.getDefaultList("Original");
        }

        $scope.allLists[listIndex].Variants.push(variantCopy);
        selectListVariantByIndex(listIndex, $scope.allLists[listIndex].Variants.length - 1);
    };
	//#endregion

	//#region ~~~~~~~~~ EVENTS ~~~~~~~~~
    /** Event for when a different character list is chosen from the dropdown. */
    $scope.onListChanged = function() {
        selectListByIndex($scope.selectedListIndex);
    };

    /** Event for when a different character variant list is chosen from the dropdown. */
    $scope.onListVariantChanged = function() {
        selectListVariantByIndex($scope.selectedListIndex, $scope.selectedListVariantIndex);
    };

    /** Event for when a stat is changed in the view. */
	$scope.onStatChanged = function() {
		// check stat total
		$scope.showStatError = false;
		if ($scope.selectedList.baseStats) {
			var total = $scope.selectedList.baseStats.Strength + $scope.selectedList.baseStats.Mind + $scope.selectedList.baseStats.Dexterity + $scope.selectedList.baseStats.Constitution + $scope.selectedList.baseStats.Perception + $scope.selectedList.baseStats.Spirit;

			if (total != 198 && total != 244) {
				$scope.showStatError = true;
			}

            if (total === 244) {
                $scope.selectedList.baseStats.Longhouse = -1;
                $scope.selectedList.baseStats.Amulet = -1;
            }
		}

		applyItemRestrictions();
		$scope.saveClientSideData();
	};

    /**
     * Event for when a row is clicked in the builder.
     * Opens the item search modal
     *
     * @param {int} index - the index of the item slot.
     */
	$scope.onRowClicked = function(index) {
		var item = $scope.selectedList.items[index];

		$scope.loadingModal = false;
		$scope.searchString = "";
		$scope.sortStat = "";
		$scope.sortDir = "";
		$scope.currentItem = item;
		$scope.currentItemIndex = index;

		if ($scope.itemsBySlot[item.Slot].length == 0) {
			$scope.loadingModal = true;
            getItemsBySlotAsync(item.Slot).then(
                function(data) {
				    // force the items coming in to be the slot we want (for weapons/hold slot shenanigans)
                    for (var i = 0; i < data.length; ++i) {
                        data[i].Slot = item.Slot;
                    }

                    $scope.itemsBySlot[item.Slot] = data;
                    $scope.itemsBySlot[item.Slot].splice(0, 0,
                        {
                            "Slot": item.Slot,
                            "Id": 0,
                            "Name": "-"
                        }
                    );

                    $scope.loadingModal = true;
				    $scope.filterSearchResults();
                }
            );
		}

		$('#itemChoiceModal').modal();
	};

    /**
     * Event for when the lock button is clicked.
     * Used on each row of the builder and in
     * the item search modal.
     *
     * @param {int} index - the index of the item slot.
     */
    $scope.onRowLockClicked = function(index) {
        var item = $scope.selectedList.items[index];
        item.Locked = !item.Locked;
		$scope.saveClientSideData();
    };

    /** Event for when the lock button is clicked for the whole column. */
    $scope.onColumnLockClicked = function() {
        var allLocked = true;
        for (let i = 0; i < $scope.selectedList.items.length; ++i) {
            if (!$scope.selectedList.items[i].Locked) {
                allLocked = false;
                break;
            }
        }

        $scope.confirmMessage = "Are you sure you want to " + (allLocked ? "unlock" : "lock") + " all items?";
        $scope.confirmFunc = toggleColumnLock;
        $("#confirmModal").modal("show");
    };

    /** Event for when the Import button is clicked. */
    $scope.onImportClicked = function() {
        $scope.importModel = {Input: "", Lists: [], Message: "", Loading: true};
        $("#importModal").modal("show");
    };

    /** Event for when the Import input changes. */
    $scope.onImportInputChanged = function() {
        $scope.importModel.Lists = [];
        $scope.importModel.Loading = true;
        if ($scope.importModel.Input) {
			var listStrs = $scope.importModel.Input.split("*").filter(function(el) {return el.length != 0});;
			for (let i = 0; i < listStrs.length; ++i) {
				var newList = createListFromString(listStrs[i]);

                // check if list exists
                for (let j = 0; j < $scope.allLists.length; ++j) {
                    if ($scope.allLists[j].Name === newList.Name) {
                        for (let k = 0; k < $scope.allLists[j].Variants.length; ++k) {
                            if ($scope.allLists[j].Variants[k].Name === newList.Variants[0].Name) {
                                newList.Exists = true;
                                newList.Overwrite = true;
                                break;
                            }
                        }
                        break;
                    }
                }

                $scope.importModel.Lists.push(newList);
            }
        }

        if ($scope.importModel.Lists.filter(l => l.Exists).length > 0) {
            $scope.importModel.Exists = true;
            $scope.importModel.Message = "The following lists already exist and will be overwritten unless otherwise specified:";
        }

        $scope.importModel.Loading = false;
    };

    /** Event for when the user submits the import. */
    $scope.onImportSubmitClicked = function() {
        var lists = $scope.importModel.Lists;
        for (let i = 0; i < lists.length; ++i) {
            if (!lists[i].Exists || lists[i].Overwrite) {
                var foundList = false;
                for (let j = 0; j < $scope.allLists.length; ++j) {
                    if ($scope.allLists[j].Name === lists[i].Name) {
                        foundList = true;
                        var foundVariant = false;
                        for (let k = 0; k < $scope.allLists[j].Variants.length; ++k) {
                            if ($scope.allLists[j].Variants[k].Name === lists[i].Variants[0].Name) {
                                foundVariant = true;
                                $scope.allLists[j].Variants[k] = angular.copy(lists[i].Variants[0]);

                                break;
                            }
                        }

                        if (!foundVariant) {
                            $scope.allLists[j].Variants.push(angular.copy(lists[i].Variants[0]));
                        }

                        break;
                    }
                }

                if (!foundList) {
                    $scope.allLists.push(
                        {
                            Name: lists[i].Name,
                            Variants: [angular.copy(lists[i].Variants[0])]
                        }
                    );
                }
            }
        }

        $scope.saveClientSideData();
        selectListVariantByIndex(
            $scope.selectedListIndex,
            $scope.selectedListVariantIndex
        );
        $("#importModal").modal("hide");
    };

    /** Event for when the Export button is clicked. */
    $scope.onExportClicked = function() {
        // generate all lists string
        var allListsStr = "";
		for (let i = 0; i < $scope.allLists.length; ++i) {
            for (let j = 0; j < $scope.allLists[i].Variants.length; ++j) {
                allListsStr += createStringFromList(
                    $scope.allLists[i].Name,
                    $scope.allLists[i].Variants[j]
                );

                allListsStr += "*";
            }
        }

        var curListStr = "";
        for (let i = 0; i < $scope.allLists[$scope.selectedListIndex].Variants.length; ++i) {
            curListStr += createStringFromList(
                $scope.allLists[$scope.selectedListIndex].Name,
                $scope.allLists[$scope.selectedListIndex].Variants[i]
            );

            curListStr += "*";
        }

        var curVariantStr = createStringFromList(
            $scope.allLists[$scope.selectedListIndex].Name,
            $scope.selectedList
        );

        $scope.exportModel = {
            "allLists": allListsStr,
            "curList": curListStr,
            "curVariant": curVariantStr
        };

        $("#exportModal").modal("show");
    };

    /** Event for when a copy button is clicked. */
    $scope.onCopyClicked = function(elemId, clickEvent) {
        var copyText = document.getElementById(elemId);
        copyText.select();
        document.execCommand("copy");

        if (clickEvent) {
            clickEvent.target.innerHTML = "Copied!";
            $timeout(() => clickEvent.target.innerHTML = "Copy", 1500);
        }
    };

    /** Toggles the locks on all items. */
    var toggleColumnLock = function() {
        var allLocked = true;
        for (let i = 0; i < $scope.selectedList.items.length; ++i) {
            if (!$scope.selectedList.items[i].Locked) {
                allLocked = false;
                break;
            }
        }

        for (let i = 0; i < $scope.selectedList.items.length; ++i) {
            $scope.selectedList.items[i].Locked = !allLocked;
        }

        $scope.saveClientSideData();
    };

    /** Returns the classes for the column lock symbol. */
    $scope.getColumnLockedClasses = function() {
        if (!$scope.selectedList) {
            return "";
        }

        var allLocked = true;
        for (let i = 0; i < $scope.selectedList.items.length; ++i) {
            if (!$scope.selectedList.items[i].Locked) {
                allLocked = false;
                break;
            }
        }

        if (allLocked) {
            return "fa-lock text-success";
        }
        else {
            return "fa-unlock text-white";
        }
    };

    /**
     * Gets the items for a specified slot
     *
     * @param {int} slot - the slot you want to get items for.
     * @return {Promise} the promise containing the items.
     */
    var getItemsBySlotAsync = function(slot) {
        var deferred = $q.defer();

        $http({
            url: '/php/items/getItemsBySlot.php',
            method: 'POST',
            data: {"slot": slot}
        }).then(function successCallback(response) {
            deferred.resolve(response.data);
        }, function errorCallback(response){
            deferred.reject(response);
        });

        return deferred.promise;
    };

    /**
     * Event for when the previous page button is clicked in pagination.
     */
	$scope.onPreviousClicked = function() {
		$scope.currentPage -= 1;
		if ($scope.currentPage < 1) {
			$scope.currentPage = 1;
		}
	};

    /**
     * Event for when the next page button is clicked in pagination.
     */
	$scope.onNextClicked = function() {
		$scope.currentPage += 1;
		if ($scope.currentPage > $scope.totalPages) {
			$scope.currentPage = $scope.totalPages;
		}
	};

    /**
     * Event for when a particular page button is clicked in pagination.
     *
     * @param {int} num - the page number that was clicked.
     */
	$scope.onPageClicked = function(num) {
		$scope.currentPage = num + 1;
	};

    /**
     * Event for when an item row is clicked when searching for an
     * item in the item search modal.
     *
     * @param {object} item - the item that was selected.
     */
	$scope.onSearchRowClicked = function(item) {
        if ($scope.currentItem.Locked) {
            var lockElem = document.getElementById("itemSearchLock");

            lockElem.classList.remove("shake-horizontal");
            void lockElem.offsetWidth;
            lockElem.classList.add("shake-horizontal");

            if ($scope.shakeTimeout) {
                $timeout.cancel($scope.shakeTimeout);
            }
            $scope.shakeTimeout = $timeout(() => lockElem.classList.remove("shake-horizontal"), 600);

            return;
        }
		$scope.selectedList.items[$scope.currentItemIndex] = item;
		$scope.saveClientSideData();
		applyItemRestrictions();
		$('#itemChoiceModal').modal('hide');
	};

    /**
     * Event for when the text changes in the item search modal.
     */
	$scope.onSearchChange = function() {
		$scope.currentPage = 1;
		$scope.filterSearchResults();
	};

    /**
     * Event for when a column header is clicked in the item search modal.
     * This is used for sorting the item results.
     *
     * @param {string} statVar - the variable name for the stat that was clicked.
     */
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
	};

    /**
     * Gets the html class for sorting the given stat.
     *
     * @param {string} statVar - the variable name for the specified stat.
     * @return {string} the html class for the font awesome arrow needed to display sorting.
     */
	$scope.getSortClass = function(statVar) {
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
	};

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

    /** Confirm function for the edit character modal. */
	var editCharacter = function() {
        if (validateEditCharacter()) {
            $scope.allLists[$scope.selectedListIndex].Name = $scope.textInputModalModel.Input;
            $scope.saveClientSideData();

            $("#textInputModal").modal("hide");
        }
	};

    /** Opens the modal for editing characters. */
    $scope.openEditCharacterModal = function() {
        $scope.textInputModalModel = {
            Title: "Edit Character",
            Action: editCharacter,
            Label: "Name",
            Pattern: /^[A-Za-z\s\d]+$/,
            Validate: validateEditCharacter,
            Input: $scope.allLists[$scope.selectedListIndex].Name
        };

        $("#textInputModal").modal("show");
    };

    /** Confirm function for the add character modal. */
	var addCharacter = function() {
        if (validateAddCharacter()) {
            addCharacterList($scope.textInputModalModel.Input);

            $("#textInputModal").modal("hide");
	    }
    };

    /** Opens the modal for adding characters. */
    $scope.openAddCharacterModal = function() {
        $scope.textInputModalModel = {
            Title: "Add Character",
            Action: addCharacter,
            Label: "Name",
            Pattern: /^[A-Za-z\s\d]+$/,
            Validate: validateAddCharacter,
            Input: ""
        };

        $("#textInputModal").modal("show");
    };

    /** Confirm function for the edit variant modal. */
    var editVariant = function() {
        if (validateEditVariant()) {
            $scope.selectedList.Name = $scope.textInputModalModel.Input;
            $scope.saveClientSideData();

            $("#textInputModal").modal("hide");
        }
    };

    /** Opens the modal for editing variants. */
    $scope.openEditVariantModal = function() {
        $scope.textInputModalModel = {
            Title: "Edit Variant",
            Action: editVariant,
            Label: "Name",
            Pattern: /^[A-Za-z\s\d]+$/,
            Validate: validateEditVariant,
            Input: $scope.selectedList.Name
        };

        $("#textInputModal").modal("show");
    };

    /** Deletes the currently selected character. */
	var deleteCharacter = function() {
		var index = $scope.selectedListIndex;
		if (index > -1) {
			$scope.allLists.splice(index, 1);
			if ($scope.allLists.length == 0) {
				addCharacterList("Untitled");
                selectListByIndex(0);
			}
            else if ($scope.selectedListIndex >= $scope.allLists.length) {
                selectListByIndex($scope.allLists.length - 1);
			}
            else {
                selectListByIndex($scope.selectedListIndex);
            }
		}
	}

    /** Opens the modal for deleting an existing character. */
	$scope.openDeleteModal = function() {
		$scope.confirmMessage = "Are you sure you want to delete " + $scope.allLists[$scope.selectedListIndex].Name + "?";

		$scope.confirmFunc = deleteCharacter;
		$("#confirmModal").modal("show");
	};

    /** Clears all items from the currently selected character list. */
	$scope.clearItemsFromList = function() {
		for (var i = 0; i < $scope.selectedList.items.length; ++i) {
            if (!$scope.selectedList.items[i].Locked) {
			    $scope.selectedList.items[i] = {"Slot": $scope.selectedList.items[i].Slot, "Id": 0, "Name": "-"};
		    }
        }
		$scope.saveClientSideData();
	};

    /** Opens the modal for clearing items from a list. */
	$scope.openClearModal = function() {
		$scope.confirmMessage = "Are you sure you want to clear all of " + $scope.selectedList.Name + "'s items?";

		$scope.confirmFunc = $scope.clearItemsFromList;
		$("#confirmModal").modal("show");
	};

    /** Deletes the currently selected list variant. */
    var deleteVariant = function() {
        var index = $scope.selectedListVariantIndex;
        if (index > -1) {
            $scope.allLists[$scope.selectedListIndex].Variants.splice(index, 1);

            if ($scope.allLists[$scope.selectedListIndex].Variants.length === 0) {
                $scope.addCharacterVariant($scope.selectedListIndex);
            }
            else if ($scope.selectedListVariantIndex >= $scope.allLists[$scope.selectedListIndex].Variants.length) {
                selectListVariantByIndex($scope.selectedListIndex, $scope.allLists[$scope.selectedListIndex].Variants.length - 1);
            }
            else {
                selectListVariantByIndex($scope.selectedListIndex, $scope.selectedListVariantIndex);
            }
        }
    };

    /** Opens the confirm modal for deleting a list variant. */
    $scope.openDeleteVariantModal = function() {
        $scope.confirmMessage = "Are you sure you want to delete the current list variant?";

        $scope.confirmFunc = deleteVariant;
        $("#confirmModal").modal("show");
    };

    /** Closes the confirm modal and calls the confirm callback. */
	$scope.confirm = function() {
		$scope.confirmFunc();

		$("#confirmModal").modal("hide");
	};

    /** Deletes all lists. */
	$scope.deleteAllLists = function() {
		if ($cookies.get("cookie-consent")) {
			localStorage.remove("cl")
			localStorage.remove("scl");
			window.location.reload();
		}
	};
	//#endregion

	//#region ~~~~~~~~~ VALIDATION ~~~~~~~~~
    /** Validates the add character form. */
	var validateAddCharacter = function() {
		$scope.textInputModalForm.textInput.$setValidity("duplicate", null);
		$scope.textInputModalForm.textInput.$setValidity("limit", null);

        if ($scope.textInputModalModel.Input.length === 0) {
            return false;
        }

		for (let i = 0; i < $scope.allLists.length; ++i) {
			if ($scope.allLists[i].Name === $scope.textInputModalModel.Input) {
				$scope.textInputModalForm.textInput.$setValidity("duplicate", false);
                return false;
			}
		}
		if ($scope.allLists.length == 20000) {
			$scope.textInputModalForm.textInput.$setValidity("limit", false);
            return false;
		}

        return true;
	};

    /** Validates the edit character form. */
	var validateEditCharacter = function() {
		$scope.textInputModalForm.textInput.$setValidity("duplicate", null);
		$scope.textInputModalForm.textInput.$setValidity("limit", null);

        if ($scope.textInputModalModel.Input.length === 0) {
            return false;
        }

		for (let i = 0; i < $scope.allLists.length; ++i) {
			if ($scope.allLists[i].Name === $scope.allLists[$scope.selectedListIndex].Name) {
				continue;
			}
			if ($scope.allLists[i].Name === $scope.textInputModalModel.Input) {
				$scope.textInputModalForm.textInput.$setValidity("duplicate", false);
                return false;
			}
		}

        return true;
	};

    /** Validates the edit variant modal. */
    var validateEditVariant = function() {
        $scope.textInputModalForm.textInput.$setValidity("duplicate", null);
		$scope.textInputModalForm.textInput.$setValidity("limit", null);

        if ($scope.textInputModalModel.Input.length === 0) {
            return false;
        }

        var variants = $scope.allLists[$scope.selectedListIndex].Variants;
        for (let i = 0; i < variants.length; ++i) {
            if (variants[i].Name === $scope.selectedList.Name) {
                continue;
            }

            if (variants[i].Name === $scope.textInputModalModel.Input) {
                $scope.textInputModalForm.textInput.$setValidity("duplicate", false);
                return false;
            }
        }

        return true;
    };
	//#endregion

    /**
     * Gets the total for alignment. This is a special case.
     *
     * @return {string} The total alignment restriction for the list.
     */
    var getAlignmentTotal = function() {
        var canUseG = true;
        var canUseN = true;
        var canUseE = true;

        for (var i = 0; i < $scope.selectedList.items.length; ++i) {
            switch($scope.selectedList.items[i].AlignRestriction) {
                case 0:
                    break;
                case 1:
                    canUseN = false;
                    canUseE = false;
                    break;
                case 2:
                    canUseG = false;
                    canUseE = false;
                    break;
                case 3:
                    canUseG = false;
                    canUseN = false;
                    break;
                case 4:
                    canUseG = false;
                    break;
                case 5:
                    canUseN = false;
                    break;
                case 6:
                    canUseE = false;
                    break;
                default:
                    break;
            }
        }

        if (!canUseG && !canUseN && !canUseE) {
            return "ERROR";
        }

        return (canUseG ? "G " : "  ") + (canUseN ? "N " : "  ") + (canUseE ? "E" : " ");
    };

    /** Calculates the total from stat quests for a given stat.
     *
     * @param {string} statName - the variable name of the stat to be totalled.
     * @return {int} the total acquired via stat quests.
     */
    var getTotalFromStatQuests = function(statName) {
        var fromStatQuests = 0;

		var totalBaseStats = $scope.selectedList.baseStats.Strength + $scope.selectedList.baseStats.Mind + $scope.selectedList.baseStats.Dexterity + $scope.selectedList.baseStats.Constitution + $scope.selectedList.baseStats.Perception + $scope.selectedList.baseStats.Spirit;

        switch (statName) {
			case "Strength":
				if (totalBaseStats < 244) {
					fromStatQuests += 3;
				}
				if ($scope.selectedList.baseStats["Amulet"] == 0) {
					fromStatQuests += 10;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 3) {
					fromStatQuests += 5;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 2) {
					fromStatQuests += 3;
				}
				break;
			case "Mind":
				if (totalBaseStats < 244) {
					fromStatQuests += 3;
				}
				if ($scope.selectedList.baseStats["Amulet"] == 1) {
					fromStatQuests += 10;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 1) {
					fromStatQuests += 5;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 0) {
					fromStatQuests += 3;
				}
				break;
			case "Dexterity":
				if (totalBaseStats < 244) {
					fromStatQuests += 3;
				}
				if ($scope.selectedList.baseStats["Amulet"] == 2) {
					fromStatQuests += 10;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 4) {
					fromStatQuests += 5;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 1) {
					fromStatQuests += 3;
				}
				break;
			case "Constitution":
				if (totalBaseStats < 244) {
					fromStatQuests += 3;
				}
				if ($scope.selectedList.baseStats["Amulet"] == 3) {
					fromStatQuests += 10;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 5) {
					fromStatQuests += 5;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 3) {
					fromStatQuests += 3;
				}
				break;
			case "Perception":
				if (totalBaseStats < 244) {
					fromStatQuests += 3;
				}
				if ($scope.selectedList.baseStats["Amulet"] == 4) {
					fromStatQuests += 10;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 2) {
					fromStatQuests += 5;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 4) {
					fromStatQuests += 3;
				}
				break;
			case "Spirit":
				if (totalBaseStats < 244) {
					fromStatQuests += 13;
				}
				if ($scope.selectedList.baseStats["Amulet"] == 5) {
					fromStatQuests += 10;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 0) {
					fromStatQuests += 5;
				}
				if ($scope.selectedList.baseStats["Longhouse"] == 5) {
					fromStatQuests += 3;
				}
				break;
            default:
                break;
		}

        return fromStatQuests;
    };

    /**
     * Gets the total bonuses generated by other stats.
     * WARNING: be careful of stack overflow errors when calling getStatTotal in here.
     *
     * @param {string} statName - the variable name of the stat to be totalled.
     * @return {int} the total bonuses gained from other stats.
     */
    var getTotalFromStatBonuses = function(statName) {
        var fromBonus = 0;

		switch (statName)
		{
			case "Spelldam":
			    fromBonus += parseInt(($scope.getStatTotal("Mind") - 52) / 2);
				break;
			case "Spellcrit":
				fromBonus += parseInt(($scope.getStatTotal("Mind") - 60) / 4);
				fromBonus += parseInt(Math.max($scope.getStatTotal("Perception") - 60, 0) / 8);
				fromBonus += parseInt(Math.max($scope.getStatTotal("Spirit") - 60, 0) / 8);
				fromBonus += 5;
				break;
			case "Hit":
				var str = $scope.getStatTotal("Strength");
				var dex = $scope.getStatTotal("Dexterity");
				var con = $scope.getStatTotal("Constitution");

				var bestStat = dex;
				var wearingStrWeap = false;
				var wearingConWeap = false;
				for (var i = 0; i < $scope.selectedList.items.length; ++i) {
					if ($scope.selectedList.items[i].Slot == 14 || $scope.selectedList.items[i].Slot == 15) {
						if ($scope.selectedList.items[i].WeaponType == 1) {
							wearingStrWeap = true;
						}
						else if ($scope.selectedList.items[i].WeaponType == 3) {
							wearingConWeap = true;
						}
					}
				}
				if (wearingStrWeap && str > bestStat) { // replace false with wearingStrWeap
					bestStat = str;
				}
				if (wearingConWeap && con > bestStat) { // replace false with wearingConWeap
					bestStat = con;
				}

				fromBonus += parseInt((bestStat - 30) / 3);
				fromBonus += parseInt(Math.max(dex - 70, 0) / 6);
				break;
			case "Dam":
				fromBonus += parseInt(($scope.getStatTotal("Strength") - 30) / 3);
				break;
			case "Mitigation":
				var con = $scope.getStatTotal("Constitution");
				var hasBattleTraining = false;
				for (var i = 25; i < $scope.selectedList.items.length; ++i) { // loop through Other slots
					if ($scope.selectedList.items[i].Id == 1144 || $scope.selectedList.items[i].Id == 1137) {
						hasBattleTraining = true;
						break;
					}
				}

				if (hasBattleTraining) {
					fromBonus += parseInt(Math.max(con - 75, 0) / 5);
				}
				break;
			case "Ac":
				var str = $scope.getStatTotal("Strength");
				var dex = $scope.getStatTotal("Dexterity");
				var con = $scope.getStatTotal("Constitution");
				var per = $scope.getStatTotal("Perception");

				var totalAC = 83;
				totalAC += parseInt(Math.max(dex - 40, 0) * -0.5);
				totalAC += parseInt(Math.max(per - 30, 0) * -0.5);
				if (str >= 20 && dex >= 20 && con >= 20) {
					totalAC -= 5;
					if (dex >= 40 && con >= 40) {
						totalAC -= 5;
					}
				}

				fromBonus += totalAC;
				break;
            default:
                break;
		}

        return fromBonus;
    };

    /**
     * Gets the bonus that should be applied to the stat total.
     *
     * @param {string} statName - the variable name of the stat to get the total bonus for.
     * @param {int} curTotal - the current total for the stat.
     * @return {int} the bonus amount based on the current total.
     */
    var getStatTotalBonus = function(statName, curTotal) {
        switch (statName) {
            case "Dam":
                for (var i = 0; i < $scope.selectedList.items.length; ++i) {
					if ($scope.selectedList.items[i].Slot == 14 && $scope.selectedList.items[i].TwoHanded) {
                        return parseInt(curTotal / 3);
					}
				}
                break;
            default:
                break;
        }

        return 0;
    };

    /**
     * Gets the max total from items for a given stat.
     *
     * @param {string} statName - the variable name of the stat to get the max item total for.
     * @return {int} the max total a stat can gain from items.
     */
    var getItemTotalMax = function(statName) {
        var max = null;

        switch (statName) {
            case "Hit":
            case "Dam":
                max = 27;
			default:
				break;
		}

        return max;
    };

    /**
     * Gets the max total for a given stat.
     *
     * @param {string} statName - the variable name of the stat to get the max total for.
     * @return {int} the max total for the given stat.
     */
    var getStatTotalMax = function(statName) {
    	var max = null;

		switch (statName) {
            case "Strength":
            case "Mind":
            case "Dexterity":
            case "Constitution":
            case "Perception":
            case "Spirit":
                max = 110;
                break;
            case "Spelldam":
            case "Spellcrit":
            case "ManaReduction":
                max = 50;
                break;
			case "Mitigation":
				var hasBattleTraining = false;
				for (var i = 25; i < $scope.selectedList.items.length; ++i) { // loop through Other slots
					if ($scope.selectedList.items[i].Id == 1144 || $scope.selectedList.items[i].Id == 1137) {
						hasBattleTraining = true;
						break;
					}
				}

				var max = parseInt(Math.max(Math.min($scope.getStatTotal("Constitution"), 70) - 30, 0) / 2);
				if (hasBattleTraining) {
					max += 10;
				}
				break;
		}

        return max;
    };

    /**
     * Gets the min total for a given stat.
     *
     * @param {string} statName - the variable name of the stat to get the min total for.
     * @return {int} the min total for the given stat.
     */
    var getStatTotalMin = function(statName) {
        var min = null;

        switch (statName) {
            case "Ac":
                min = -250;
                break;
            default:
                break;
        }

        return min;
    };

    /**
     * Calculates the total for a given stat.
     * Applies bonuses from items, spells, and other stats.
     *
     * @param {string} statName - the variable name of the stat to be totalled.
     * @return {int|string|decimal} the total for the given stat.
     */
	$scope.getStatTotal = function(statName) {
		if (!$scope.selectedList) {
			return '';
		}

        // Handle special case.
		if (statName == 'AlignRestriction') {
			return getAlignmentTotal();
		}

        // Only get totals for number fields.
		for (var i = 0; i < $scope.statInfo.length; ++i) {
			if ($scope.statInfo[i].var == statName) {
				if ($scope.statInfo[i].type != "int") {
					return "";
				}
				break;
			}
		}

        // Base stats
		var fromBaseStats = 0;
		if ($scope.selectedList.baseStats[statName]) {
			fromBaseStats += $scope.selectedList.baseStats[statName];
		}

        // Stat quests
		var fromStatQuests = getTotalFromStatQuests(statName);

        // Item stats
		var fromItems = 0;
		for (let i = 0; i < 24; ++i) {
			if ($scope.selectedList.items[i][statName]) {
				fromItems += $scope.selectedList.items[i][statName];
			}
		}

		// limit stats from items
        itemTotalMax = getItemTotalMax(statName);
        if (itemTotalMax != null) {
            fromItems = Math.min(fromItems, itemTotalMax);
        }

        // Spell/Familiar stats
        var fromSpells = 0;
        for (let i = 24; i < $scope.selectedList.items.length; ++i) {
            if ($scope.selectedList.items[i][statName]) {
				fromItems += $scope.selectedList.items[i][statName];
			}
        }

        // stat bonuses
		var fromBonus = getTotalFromStatBonuses(statName);

        // sum up the different sections
		var total = fromBaseStats + fromStatQuests + fromItems + fromSpells + fromBonus;

        // apply total bonuses
        total += getStatTotalBonus(statName, total);

        // apply min and max
        totalMax = getStatTotalMax(statName);
        totalMin = getStatTotalMin(statName);

        if (totalMax != null) {
            total = Math.min(total, totalMax);
        }

		if (totalMin != null) {
			total = Math.max(total, totalMin);
		}

		return total;
	};

    /** Applies item restrictions. */
	var applyItemRestrictions = function() {
		// initialize restriction array
		$scope.itemRestrictions = [];
		for (var i = 0; i < $scope.selectedList.items.length; ++i) {
			$scope.itemRestrictions.push([]);
		}

		var handCount = 0;
		var handApplied = false;
		for (var i = 0; i < $scope.selectedList.items.length; ++i) {
			var curItem = $scope.selectedList.items[i];
			// unique
			if (curItem.Slot == 1 || curItem.Slot == 2 || curItem.Slot == 13 || curItem.Slot == 14 || curItem.Slot == 15 || curItem.Slot == 16) {
				if (curItem.UniqueWear) {
					for (var j = 0; j < $scope.selectedList.items.length; ++j) {
						if (i == j) {
							continue;
						}
						if (curItem.Id != 0 && curItem.Id == $scope.selectedList.items[j].Id) {
							$scope.itemRestrictions[i].push("unique");
							break;
						}
					}
				}
			}

			var strength = $scope.getStatTotal("Strength");

			// weight
			if (curItem.Slot == 14) {
				if (curItem.Weight * 4 > strength) {
					$scope.itemRestrictions[i].push("weight");
				}
			}
			else if (curItem.Slot == 15) {
				if (curItem.Weight * 5 > strength) {
					$scope.itemRestrictions[i].push("holdWeight");
				}
			}

			// hand limit
			if (!handApplied && curItem.Slot == 14 || curItem.Slot == 15) {
				if (curItem.TwoHanded !== undefined) {
					handCount += curItem.TwoHanded ? 2 : 1;
				}
				if (handCount > 3) {
					for (var j = 0; j < $scope.selectedList.items.length; ++j) {
						if ($scope.selectedList.items[j].Slot == 14 ||
						    $scope.selectedList.items[j].Slot == 15) {
							$scope.itemRestrictions[j].push("twohanded");
						}
					}
					handApplied = true;
				}
			}
		}
	};

	$scope.anyItemRestrictions = function(index) {
		return $scope.itemRestrictions[index].length > 0;
	};

	$scope.hasItemRestriction = function(index, name) {
		return $scope.itemRestrictions[index].includes(name);
	};

	$scope.getItemRestrictionText = function(index) {
		var text = "";
		for (var i = 0; i < $scope.itemRestrictions[index].length; ++i) {
			switch($scope.itemRestrictions[index][i]) {
				case "unique":
					text += "You cannot wear two of this item.";
					break;
				case "weight":
					var req = $scope.selectedList.items[index].Weight * 4;
					text += "You need " + req + " strength to wield this.";
					break;
				case "holdWeight":
					var req = $scope.selectedList.items[index].Weight * 5;
					text += "You need " + req + " strength to hold this with one hand.";
					break;
				case "twohanded":
					text += "You do not have enough hands to hold this item.";
					break;
				default:
					break;
			}
			if (i != $scope.itemRestrictions[index].length - 1) {
				text += "<br /><br />";
			}
		}
		return text;
	};

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
	};

	$scope.getFilteredSearchResults = function() {
		$scope.totalPages = Math.floor(($scope.filteredItems.length - 1) / $scope.itemsPerPage) + 1;

		var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
		return $scope.filteredItems.slice(start, start + $scope.itemsPerPage);
	};

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

	};

    $scope.resetColumns = function() {
        for (var i = 0; i < $scope.defaultStatInfo.length; ++i) {
			for (var j = 0; j < $scope.statInfo.length; ++j) {
                if ($scope.defaultStatInfo[i].var === $scope.statInfo[j].var) {
				    $scope.statInfo[j].showColumn = $scope.defaultStatInfo[i].showColumn;
                    break;
                }
			}
		}

        $scope.saveClientSideData();
	};

    $scope.resetFilters = function() {
		for (var i = 0; i < $scope.defaultStatInfo.length; ++i) {
			for (var j = 0; j < $scope.statInfo.length; ++j) {
                if ($scope.defaultStatInfo[i].var === $scope.statInfo[j].var) {
				    $scope.statInfo[j].filter = $scope.defaultStatInfo[i].filter;
                }
			}
		}
	};

	$scope.getNumberArray = function(num) {
		return new Array(num);
	};

	$scope.showStatQuests = function() {
		if (!$scope.selectedList || !$scope.selectedList.baseStats) {
			return false;
		}
		var total = $scope.selectedList.baseStats.Strength + $scope.selectedList.baseStats.Mind + $scope.selectedList.baseStats.Dexterity + $scope.selectedList.baseStats.Constitution + $scope.selectedList.baseStats.Perception + $scope.selectedList.baseStats.Spirit;

		return total < 244;
	};

	$scope.initialize();
}]);
