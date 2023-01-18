(function() {
    function builderController($scope, $cookies, $http, $q, $timeout, itemConstants, encoder, exceptionService) {
        //#region ~~~~~~~~~ INITIALIZATION ~~~~~~~~~

        /** Initializes the controller. */
        $scope.initialize = function() {
            $scope.exceptionEncountered = false;
            $scope.listVer = -1;
            exceptionService.addCallback(function (exception, cause) {
                $scope.exceptionEncountered = true;
            });

            $scope.slots = itemConstants.selectShortOptions.slot;
            $scope.selectShortOptions = itemConstants.selectShortOptions;

            $scope.itemsPerPage = 20;
            $scope.itemsPerPageOptions = [20, 50, 100, 200, 500, 1000];

            $scope.slotOrder = [0,1,1,2,2,3,4,5,6,7,8,9,11,12,13,13,14,15,15,16,16,17,18,19,20,21,21,21,21,21,21,21,21,21,21];
            $scope.longhouseList = ["Bear   -- ( +5 spi - +3 min )",
                                    "Beaver -- ( +5 min - +3 dex )",
                                    "Eagle  -- ( +5 per / +3 str )",
                                    "Moose  -- ( +5 str / +3 con )",
                                    "Snake  -- ( +5 dex / +3 per )",
                                    "Turtle -- ( +5 con / +3 spi )",
                                    "Dragon -- ( +5 dex / +3 con )",
                                    "Hydra  -- ( +5 per / +3 dex )",
                                    "Wyvern -- ( +5 min / +3 spi )",
                                    "Beetle -- ( +8 spi )",
                                    "Falcon -- ( +8 dex )",
                                    "Sphinx -- ( +8 per )",
                                    "Merlin -- ( +10 min / -2 dex )"];

            $scope.amuletList = ["Strength", "Mind", "Dexterity", "Constitution", "Perception", "Spirit"];

            $scope.hazelnutList = ["Strength", "Mind", "Dexterity", "Constitution", "Perception", "Spirit"];

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
            let query = [
                "{",
                    "getItemStatInfo {",
                        "display ",
                        "short ",
                        "var ",
                        "type ",
                        "filterString ",
                        "defaultValue ",
                        "netStat ",
                        "showColumnDefault",
                    "}",
                    "getItemFragment",
                "}"
            ];

            $http({
                url: "/api",
                method: "POST",
                data: {query: query.join("")}
            }).then(function successCallback(response) {
                $scope.statInfo = response.data.data.getItemStatInfo;
                $scope.defaultStatInfo = angular.copy($scope.statInfo);

                $scope.itemFragment = response.data.data.getItemFragment;
                $timeout(loadClientSideData());
            });
        };

        /**
         * Gets a blank list for use when adding a new list
         *
         * @param {string} name - the name for the list.
         */
        $scope.getDefaultList = function(name) {
            list = {};
            list.name = name;

            // base stats
            list.baseStats = {"strength": 0, "mind": 0, "dexterity": 0, "constitution": 0, "perception": 0, "spirit": 0, "longhouse": -1, "amulet": -1, "hazelnut": -1};
            list.ksmStats = {"strength": 0, "mind": 0, "dexterity": 0, "constitution": 0, "perception": 0, "spirit": 0};

            // items
            list.items = [];
            for (var i = 0; i < $scope.slotOrder.length; ++i) {
                list.items.push({"slot": $scope.slotOrder[i], "name": "-"});
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
            // wipe initial values
            for (var i = 0; i < statInfo.length; ++i) {
                if (cookie)
                    statInfo[i].showColumn = false;
                else
                    statInfo[i].showColumn = statInfo[i].showColumnDefault;
            }

            if (cookie) {
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
         * @return {array} The array of character lists.
         */
        var loadCharacterLists = function() {
            var lists = [];

            // load lists
            if ($cookies.get("cookie-consent")) {
                var listVersion = -1;
                var listCookieStr = localStorage.getItem("cl3")
                
                // version check
                if (localStorage.getItem("cl1")) {
                    listCookieStr = localStorage.getItem("cl1");
                    listVersion = 1;
                } 
                if (localStorage.getItem("cl2")) {
                    listCookieStr = localStorage.getItem("cl2");
                    listVersion = 2;
                }
                if (localStorage.getItem("cl3")) {
                    listCookieStr = localStorage.getItem("cl3");
                    listVersion = 3;
                }                    

                if (listCookieStr) {
                    var listStrs = listCookieStr.split("*").filter(function(el) {return el.length != 0});
                    for (var i = 0; i < listStrs.length; ++i) {
                        switch (listVersion) {
                            case 3:
                                var newList = createListFromStringV2(listStrs[i], listVersion);
                                break;
                            case 2:
                                var newList = createListFromStringV2(listStrs[i], listVersion);
                                break;
                            case 1:
                                var newList = createListFromString(listStrs[i]);
                                break;
                            default:
                                break;
                        }

                        var found = false;
                        for (let j = 0; j < lists.length; ++j) {
                            if (newList.name === lists[j].name) {
                                foundList = lists[j];
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            lists.push({name: newList.name, variants: []});
                            foundList = lists[lists.length - 1];
                        }

                        foundList.variants.push(newList.variants[0]);
                    }
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
            newList = {name: variantName};
            each.shift();

            // base stats
            newList.baseStats = {};
            newList.baseStats.strength = each[0] == 'NaN' ? 0 : Number(each[0]);
            each.shift();

            newList.baseStats.mind = each[0] == 'NaN' ? 0 : Number(each[0]);
            each.shift();

            newList.baseStats.dexterity = each[0] == 'NaN' ? 0 : Number(each[0]);
            each.shift();

            newList.baseStats.constitution = each[0] == 'NaN' ? 0 : Number(each[0]);
            each.shift();

            newList.baseStats.perception = each[0] == 'NaN' ? 0 : Number(each[0]);
            each.shift();

            newList.baseStats.spirit = each[0] == 'NaN' ? 0 : Number(each[0]);
            each.shift();

            newList.baseStats.longhouse = Number(each[0]);
            each.shift();

            newList.baseStats.amulet = Number(each[0]);
            each.shift();

            newList.baseStats.hazelnut = Number(each[0]);
            each.shift();

            newList.ksmStats = {
                strength: 0,
                mind: 0,
                dexterity: 0,
                constitution: 0,
                perception: 0,
                spirit: 0
            };

            // items
            newList.items = [];
            for (var j = 0; j < each.length; ++j) {
                var isLocked = each[j][0] === "!";
                if (isLocked) {
                    each[j] = each[j].substr(1);
                }
                newList.items.push({"id": Number(each[j]), "slot": $scope.slotOrder[j], "locked": isLocked});
            }

            if (each.length < 35) {
                for (var k = 0; k < (35 - each.length); ++k) {
                    newList.items.push({"id": Number(each[j]), "slot": 21});
                }
            }

            return {name: name, variants: [newList]};
        };

        var createListFromStringV2 = function(listStr, listVersion) {
            var index = listStr.indexOf('~');
            var name = listStr.slice(0, index);
            if (!(/^[A-Za-z\s\d]+$/).test(name)) {
                throw "Invalid list.";
            }

            listStr = listStr.substring(++index);

            index = listStr.indexOf('~');
            var variantName = listStr.slice(0, index);
            if (!(/^[A-Za-z\s\d]+$/).test(variantName)) {
                throw "Invalid list.";
            }
            listStr = listStr.substring(++index);

            var baseStats = {};
            var statList = ["strength", "mind", "dexterity", "constitution", "perception", "spirit"];
            var takeAmt;
            for (var i = 0; i < statList.length; ++i) {
                takeAmt = listStr[0] === '-' ? 3 : 2;
                baseStats[statList[i]] = encoder.toNumber(listStr.slice(0,takeAmt));
                listStr = listStr.substring(takeAmt);
            }

            var ksmStats = {};
            for (var i = 0; i < statList.length; ++i) {
                takeAmt = listStr[0] === '-' ? 2 : 1;
                ksmStats[statList[i]] = encoder.toNumber(listStr.slice(0,takeAmt));
                listStr = listStr.substring(takeAmt);
            }

            if (statList[0] === '_')
                baseStats.longhouse = -1;
            else
                baseStats.longhouse = encoder.toNumber(listStr.slice(0,1));
            listStr = listStr.substring(1);

            if (statList[0] === '_')
                baseStats.amulet = -1;
            else
                baseStats.amulet = encoder.toNumber(listStr.slice(0,1));
            listStr = listStr.substring(1);

            // v3: Hazelnut
            if (listVersion == 3) {
                if (statList[0] === '_')
                    baseStats.hazelnut = -1;
                else
                    baseStats.hazelnut = encoder.toNumber(listStr.slice(0,1));
                    listStr = listStr.substring(1);
            }

            var items = [];
            var itemIndex = 0;
            while (listStr.length > 0) {
                if (listStr[0] === '_') {
                    items.push({
                        id: 0,
                        slot: $scope.slotOrder[itemIndex],
                        locked: false
                    });
                    listStr = listStr.substring(1);
                }
                else {
                    if (listStr[0] === '.') {
                        items.push({
                            id: encoder.toNumber(listStr.slice(1,4)),
                            slot: $scope.slotOrder[itemIndex],
                            locked: true
                        });
                        listStr = listStr.substring(4);
                    }
                    else {
                        items.push({
                            id: encoder.toNumber(listStr.slice(0,3)),
                            slot: $scope.slotOrder[itemIndex],
                            locked: false
                        });
                        listStr = listStr.substring(3);
                    }
                }

                itemIndex++;
            }
            
            // v3: Adds missing "other" slots to previous lists
            if(itemIndex < $scope.slotOrder.length) {
                while (itemIndex < $scope.slotOrder.length){
                    itemIndex++
                    items.push({"id": Number([0]), "slot": 21});
                }
            }

            // Version Check, if # of item slots loaded does not equal total number in current version it will throw an error
            if(itemIndex > $scope.slotOrder.length) {
                throw "Invalid list.";
            }

            return {
                name: name,
                variants: [{
                    name: variantName,
                    baseStats: baseStats,
                    ksmStats: ksmStats,
                    items: items
                }]
            };
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
                        if ($scope.allLists[i].name === name) {
                            listIndex = i;

                            if (variantName) {
                                for (let j = 0; j < $scope.allLists[i].variants.length; ++j) {
                                    if ($scope.allLists[i].variants[j].name === variantName) {
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
         * @param {number} index - The index of the list in the character list array.
         */
        var selectListByIndex = function(index, variantIndex = 0) {
            $scope.selectedListIndex = index;
            selectListVariantByIndex(index, variantIndex);

        };

        /**
         * Selects a character variant list via the index of both the list and variant in the arrays.
         *
         * @param {number} listIndex - The index of the list in the character list array.
         * @param {number} variantIndex - The index of the variant in the variant array of the character list.
         */
        var selectListVariantByIndex = function(listIndex, variantIndex) {
            $scope.selectedListVariantIndex = variantIndex;
            $scope.selectedList = $scope.allLists[listIndex].variants[variantIndex];
            $scope.editCharacterModel = {"name": $scope.allLists[listIndex].name};
            var list = $scope.selectedList;

            var ids = [];
            for (var i = 0; i < list.items.length; ++i) {
                if (list.items[i].id > 0) {
                    if (!list.items[i].name) {
                        var slotItems = $scope.itemsBySlot[list.items[i].slot];
                        var found = false;
                        if (slotItems.length > 0) {
                            for (var j = 0; j < slotItems.length; ++j) {
                                if (slotItems[j].id == list.items[i].id) {
                                    found = true;
                                    var isLocked = list.items[i].locked;
                                    list.items[i] = angular.copy(slotItems[j]);
                                    list.items[i].locked = isLocked;
                                    break;
                                }
                            }
                        }

                        if (!found) {
                            list.items[i].name = "Loading...";
                            ids.push(list.items[i].id);
                        }
                    }
                }
                else {
                    list.items[i].name = "-";
                }
            }

            if (ids.length > 0) {
                $timeout(function() {
                    getItemsInId(ids).then(
                        function(data) {
                            for (var i = 0; i < list.items.length; ++i) {
                                for (var j = 0; j < data.length; ++j) {
                                    if (list.items[i].id == data[j].id) {
                                        var isLocked = list.items[i].locked;
                                        list.items[i] = angular.copy(data[j]);
                                        list.items[i].locked = isLocked;
                                        list.items[i].slot = $scope.slotOrder[i];
                                        break;
                                    }
                                }

                                if (list.items[i].name == "Loading...") {
                                    list.items[i].name = "DELETED";
                                }
                            }

                            applyItemRestrictions();
                            $scope.onStatChanged();
                        }
                    );
                });
            }
            applyItemRestrictions(); // to apply restrictions
            $scope.onStatChanged();

            $scope.characterName = list.name;
            $timeout($scope.saveClientSideData());
        };

        /**
         * Gets the items for each id provided
         *
         * @param {array} ids - the array of ids for each item needed.
         * @return {Promise} the promise that contains the item response.
         */
        var getItemsInId = function(ids) {
            var deferred = $q.defer();

            let query = [
                $scope.itemFragment,
                "{",
                    "getItemsInIds(ids:",angular.toJson(ids),") {",
                        "... ItemAll",
                    "}",
                "}"
            ];
            $http({
                url: '/api',
                method: 'POST',
                data: {"query": query.join("")}
            }).then(function successCallback(response) {
                deferred.resolve(response.data.data.getItemsInIds);
            }, function errorCallback(response){
                deferred.reject(response);
            });

            return deferred.promise;
        };

        /**
         * Loads the user data from cookies and local storage
         */
        var loadClientSideData = function() {
            var cookieConsent = $cookies.get("cookie-consent");

            // remove old cookies
            $cookies.remove("sc1", {"path": "/"});

            if (cookieConsent) {
                $scope.itemsPerPage = Number($cookies.get("ipp") || "20");
            }

            // load columns
            if (cookieConsent) {
                var columnCookie = $cookies.get("sc2");
            }
            loadSelectedColumns(columnCookie, $scope.statInfo);

            $scope.allLists = loadCharacterLists();
            $scope.allLists.sort(compareLists);

            // load selected list
            if (cookieConsent) {
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

            $timeout($scope.loadItemsForAllSlotsAsync());
        };

        /**
         * Saves the user info to client side storage
         */
        $scope.saveClientSideData = function() {
            if (!$cookies.get("cookie-consent")
                || $scope.exceptionEncountered) {
                return;
            }

            // save columns
            var cookieDate = new Date();
            cookieDate.setFullYear(cookieDate.getFullYear() + 20);

            $cookies.put("ipp", $scope.itemsPerPage, {path: "/", samesite: "lax", secure: true, expires: cookieDate});

            let savedColumns = "";
            for (var i = 0; i < $scope.statInfo.length; ++i) {
                if ($scope.statInfo[i].showColumn) {
                    savedColumns += $scope.statInfo[i].short + "-";
                }
            }
            $cookies.put("sc2", savedColumns, {path: "/", samesite: "lax", secure: true, expires: cookieDate});

            // save lists
            listCookieStr = "";
            for (let i = 0; i < $scope.allLists.length; ++i) {
                for (let j = 0; j < $scope.allLists[i].variants.length; ++j) {
                    listCookieStr += createStringFromList(
                        $scope.allLists[i].name,
                        $scope.allLists[i].variants[j]
                    );

                    listCookieStr += "*";
                }
            }

            if ($scope.exceptionEncountered)
                return;

            localStorage.setItem("cl3", listCookieStr);
            localStorage.setItem("scl", $scope.allLists[$scope.selectedListIndex].name + "!" + $scope.selectedList.name);

            if ($cookies.get("cl1")) {
                $cookies.remove("cl1");
                $cookies.remove("scl1");
            }

            $scope.clientSideDataSize = $scope.getClientSideDataSize();
        };

        $scope.getClientSideDataSize = function() {
            var total = 0, len, item;
            for (item in localStorage) {
                if (!localStorage.hasOwnProperty(item))
                    continue;

                len = ((localStorage[item].length + item.length) * 2);
                total += len;
            }
            return total;
        };

        $scope.displayClientSideDataSize = function() {
            if (!$scope.clientSideDataSize) return "";

            var display = ["Storage Size: "];
            var label = "B";
            var size = $scope.clientSideDataSize;
            var percent = size / 10485760;
            if (size > 1024) {
                size = size / 1024;
                label = "KB";
                if (size > 1024) {
                    size = size / 1024;
                    label = "MB";
                }
            }
            display.push(size.toFixed(2), label, "/10MB ", percent.toFixed(2), "%");
            return display.join("");
        }

        var createStringFromList = function(listName, list) {
            var listCookieStr = listName + "~" + list.name + "~";
            listCookieStr += encoder.fromNumber(list.baseStats.strength,2);
            listCookieStr += encoder.fromNumber(list.baseStats.mind,2);
            listCookieStr += encoder.fromNumber(list.baseStats.dexterity,2);
            listCookieStr += encoder.fromNumber(list.baseStats.constitution,2);
            listCookieStr += encoder.fromNumber(list.baseStats.perception,2);
            listCookieStr += encoder.fromNumber(list.baseStats.spirit,2);

            listCookieStr += encoder.fromNumber(list.ksmStats.strength,1);
            listCookieStr += encoder.fromNumber(list.ksmStats.mind,1);
            listCookieStr += encoder.fromNumber(list.ksmStats.dexterity,1);
            listCookieStr += encoder.fromNumber(list.ksmStats.constitution,1);
            listCookieStr += encoder.fromNumber(list.ksmStats.perception,1);
            listCookieStr += encoder.fromNumber(list.ksmStats.spirit,1);

            if (list.baseStats.longhouse >= 0)
                listCookieStr += encoder.fromNumber(list.baseStats.longhouse,1);
            else
                listCookieStr += "_";

            if (list.baseStats.amulet >= 0)
                listCookieStr += encoder.fromNumber(list.baseStats.amulet,1);
            else
                listCookieStr += "_";
            
            if (list.baseStats.hazelnut >= 0)
                listCookieStr += encoder.fromNumber(list.baseStats.hazelnut,1);
            else
                listCookieStr += "_";

            for (let k = 0; k < list.items.length; ++k) {
                if (list.items[k].id) {
                    listCookieStr += (list.items[k].locked ? "." : "") + encoder.fromNumber(list.items[k].id,3);
                }
                else {
                    listCookieStr += "_";
                }
            }

            return listCookieStr;
        };

        let compareLists = function(a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        };

        var addCharacterList = function(name) {
            $scope.allLists.push({name: name, variants: []});
            $scope.allLists.sort(compareLists);
            let index = $scope.allLists.map(function(e) { return e.name; }).indexOf(name);
            $scope.selectedListIndex = index;
            $scope.addCharacterVariant(index);
        };

        $scope.addCharacterVariant = function(listIndex) {
            var variantCount = $scope.allLists[$scope.selectedListIndex].variants.length;

            if (listIndex === $scope.selectedListIndex && variantCount > 0) {
                var variantCopy = angular.copy($scope.allLists[$scope.selectedListIndex].variants[$scope.selectedListVariantIndex]);
                variantCopy.name += " Copy";
            }
            else {
                var variantCopy = $scope.getDefaultList("Original");
            }

            $scope.allLists[listIndex].variants.push(variantCopy);
            selectListVariantByIndex(listIndex, $scope.allLists[listIndex].variants.length - 1);
        };

        $scope.isVariantPrimary = function() {
            return $scope.selectedListVariantIndex == null || $scope.selectedListVariantIndex === 0;
        };

        $scope.makeVariantPrimary = function() {
            var tmp = $scope.allLists[$scope.selectedListIndex].variants[0];
            $scope.allLists[$scope.selectedListIndex].variants[0] = $scope.allLists[$scope.selectedListIndex].variants[$scope.selectedListVariantIndex];
            $scope.allLists[$scope.selectedListIndex].variants[$scope.selectedListVariantIndex] = tmp;
            $scope.selectedListVariantIndex = 0;

            $scope.saveClientSideData();
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
            $scope.baseStatsForm.strInput.$setValidity("total", true);
            if ($scope.selectedList.baseStats) {
                var total = $scope.selectedList.baseStats.strength + $scope.selectedList.baseStats.mind + $scope.selectedList.baseStats.dexterity + $scope.selectedList.baseStats.constitution + $scope.selectedList.baseStats.perception + $scope.selectedList.baseStats.spirit;

                if (total != 198 && total != 244) {
                    $scope.baseStatsForm.strInput.$setValidity("total", false);
                }

                if (total === 244) {
                    $scope.selectedList.baseStats.longhouse = -1;
                    $scope.selectedList.baseStats.amulet = -1;
                    $scope.selectedList.baseStats.hazelnut = -1;
                }
            }

            $scope.ksmStatsForm.ksmStrInput.$setValidity("balanced", true);
            $scope.ksmStatsForm.ksmStrInput.$setValidity("max", true);
            if ($scope.selectedList.ksmStats) {
                var total = $scope.selectedList.ksmStats.strength +
                $scope.selectedList.ksmStats.mind +
                $scope.selectedList.ksmStats.dexterity +
                $scope.selectedList.ksmStats.constitution +
                $scope.selectedList.ksmStats.perception +
                $scope.selectedList.ksmStats.spirit;
                if (total !== 0) {
                    $scope.ksmStatsForm.ksmStrInput.$setValidity("balanced", false);
                }
                else {
                    total = Math.abs($scope.selectedList.ksmStats.strength) +
                    Math.abs($scope.selectedList.ksmStats.mind) +
                    Math.abs($scope.selectedList.ksmStats.dexterity) +
                    Math.abs($scope.selectedList.ksmStats.constitution) +
                    Math.abs($scope.selectedList.ksmStats.perception) +
                    Math.abs($scope.selectedList.ksmStats.spirit);
                if (total > 6)
                    $scope.ksmStatsForm.ksmStrInput.$setValidity("max", false);
                }
            }

            applyItemRestrictions();
            $scope.saveClientSideData();
        };

        /**
         * Event for when a row is clicked in the builder.
         * Opens the item search modal
         *
         * @param {number} index - the index of the item slot.
         */
        $scope.onRowClicked = function(index) {
            var item = $scope.selectedList.items[index];

            $scope.loadingModal = false;
            $scope.searchString = "";
            $scope.sortStat = "";
            $scope.sortDir = "";
            $scope.currentItem = item;
            $scope.currentItemIndex = index;

            if ($scope.itemsBySlot[item.slot].length == 0) {
                $scope.loadingModal = true;
                getItemsBySlotAsync(item.slot).then(
                    function(data) {
                        // force the items coming in to be the slot we want (for weapons/hold slot shenanigans)
                        for (var i = 0; i < data.length; ++i) {
                            data[i].realSlot = data[i].slot;
                            data[i].slot = item.slot;
                        }

                        $scope.itemsBySlot[item.slot] = data;
                        $scope.itemsBySlot[item.slot].splice(0, 0,
                            {
                                "realSlot": -1,
                                "slot": item.slot,
                                "id": 0,
                                "name": "-"
                            }
                        );

                        $scope.loadingModal = true;
                        $scope.filterSearchResults();
                    }
                );
            }

            $('#itemChoiceModal').modal();
        };

        $scope.loadItemsForAllSlotsAsync = function() {
            for (var j = 0; j < $scope.slots.length; ++j) {
                getItemsBySlotAsync(j).then(
                    (function(slot) {
                        return function(data) {
                            // force the items coming in to be the slot we want (for weapons/hold slot shenanigans)
                            for (var i = 0; i < data.length; ++i) {
                                data[i].realSlot = data[i].slot;
                                data[i].slot = slot;
                            }

                            $scope.itemsBySlot[slot] = data;
                            $scope.itemsBySlot[slot].splice(0, 0,
                                {
                                    "realSlot": -1,
                                    "slot": slot,
                                    "id": 0,
                                    "name": "-"
                                }
                            );
                        }
                    })(j)
                );
            }
        };

        /**
         * Event for when the lock button is clicked.
         * Used on each row of the builder and in
         * the item search modal.
         *
         * @param {number} index - the index of the item slot.
         */
        $scope.onRowLockClicked = function(index) {
            var item = $scope.selectedList.items[index];
            item.locked = !item.locked;
            $scope.saveClientSideData();
        };

        /** Event for when the lock button is clicked for the whole column. */
        $scope.onColumnLockClicked = function() {
            var allLocked = true;
            for (let i = 0; i < $scope.selectedList.items.length; ++i) {
                if (!$scope.selectedList.items[i].locked) {
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
            $scope.importModel = {input: "", lists: [], message: "", loading: true};
            $("#importModal").modal("show");
        };

        /** Event for when the Import input changes. */
        $scope.onImportInputChanged = function() {
            $scope.importModel.lists = [];
            $scope.importModel.loading = true;
            $scope.importModel.message = "";
            $scope.importModel.exists = false;
            if ($scope.importModel.input) {
                var listStrs = $scope.importModel.input.split("*").filter(function(el) {return el.length != 0});;
                for (let i = 0; i < listStrs.length; ++i) {
                    var newList;
                    try {
                        newList = createListFromStringV2(listStrs[i], 2);
                    }
                    catch (e) {
                        try {                             
                            newList = createListFromStringV2(listStrs[i], 3);
                        }
                        catch (e) {
                            newList = createListFromString(listStrs[i]);
                        }
                    }

                    // check if list exists
                    for (let j = 0; j < $scope.allLists.length; ++j) {
                        if ($scope.allLists[j].name === newList.name) {
                            for (let k = 0; k < $scope.allLists[j].variants.length; ++k) {
                                if ($scope.allLists[j].variants[k].name === newList.variants[0].name) {
                                    newList.exists = true;
                                    newList.overwrite = true;
                                    break;
                                }
                            }
                            break;
                        }
                    }

                    $scope.importModel.lists.push(newList);
                }
            }

            if ($scope.importModel.lists.filter(l => l.exists).length > 0) {
                $scope.importModel.exists = true;
                $scope.importModel.message = "The following lists already exist and will be overwritten unless otherwise specified:";
            }
            else if ($scope.importModel.input && $scope.importModel.lists.length === 0) {
                $scope.importModel.message = "Invalid list import string.";
            }

            $scope.importModel.loading = false;
        };

        /** Event for when the user submits the import. */
        $scope.onImportSubmitClicked = function() {
            var lists = $scope.importModel.lists;
            for (let i = 0; i < lists.length; ++i) {
                if (!lists[i].exists || lists[i].overwrite) {
                    var foundList = false;
                    for (let j = 0; j < $scope.allLists.length; ++j) {
                        if ($scope.allLists[j].name === lists[i].name) {
                            foundList = true;
                            var foundVariant = false;
                            for (let k = 0; k < $scope.allLists[j].variants.length; ++k) {
                                if ($scope.allLists[j].variants[k].name === lists[i].variants[0].name) {
                                    foundVariant = true;
                                    $scope.allLists[j].variants[k] = angular.copy(lists[i].variants[0]);

                                    break;
                                }
                            }

                            if (!foundVariant) {
                                $scope.allLists[j].variants.push(angular.copy(lists[i].variants[0]));
                            }

                            break;
                        }
                    }

                    if (!foundList) {
                        $scope.allLists.push(
                            {
                                name: lists[i].name,
                                variants: [angular.copy(lists[i].variants[0])]
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
                for (let j = 0; j < $scope.allLists[i].variants.length; ++j) {
                    allListsStr += createStringFromList(
                        $scope.allLists[i].name,
                        $scope.allLists[i].variants[j]
                    );

                    allListsStr += "*";
                }
            }

            var curListStr = "";
            for (let i = 0; i < $scope.allLists[$scope.selectedListIndex].variants.length; ++i) {
                curListStr += createStringFromList(
                    $scope.allLists[$scope.selectedListIndex].name,
                    $scope.allLists[$scope.selectedListIndex].variants[i]
                );

                curListStr += "*";
            }

            var curVariantStr = createStringFromList(
                $scope.allLists[$scope.selectedListIndex].name,
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
                if (!$scope.selectedList.items[i].locked) {
                    allLocked = false;
                    break;
                }
            }

            for (let i = 0; i < $scope.selectedList.items.length; ++i) {
                $scope.selectedList.items[i].locked = !allLocked;
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
                if (!$scope.selectedList.items[i].locked) {
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
         * @param {number} slot - the slot you want to get items for.
         * @return {Promise} the promise containing the items.
         */
        var getItemsBySlotAsync = function(slot) {
            var deferred = $q.defer();

            let query = [
                $scope.itemFragment,
                "{",
                    "getItemsBySlotId(slotId:",slot,") {",
                        "... ItemAll",
                    "}",
                "}"
            ];
            $http({
                url: '/api',
                method: 'POST',
                data: {"query": query.join("")}
            }).then(function successCallback(response) {
                deferred.resolve(response.data.data.getItemsBySlotId);
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
         * @param {number} num - the page number that was clicked.
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
            if ($scope.currentItem.locked) {
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
            $scope.selectedList.items[$scope.currentItemIndex] = angular.copy(item);
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
                $scope.allLists[$scope.selectedListIndex].name = $scope.textInputModalModel.input;
                $scope.saveClientSideData();

                $("#textInputModal").modal("hide");
            }
        };

        /** Opens the modal for editing characters. */
        $scope.openEditCharacterModal = function() {
            $scope.textInputModalModel = {
                title: "Edit Character",
                action: editCharacter,
                label: "Name",
                buttonLabel: "Save",
                pattern: /^[A-Za-z\s\d]+$/,
                validate: validateEditCharacter,
                input: $scope.allLists[$scope.selectedListIndex].name
            };

            $("#textInputModal").modal("show");
        };

        /** Confirm function for the add character modal. */
        var addCharacter = function() {
            if (validateAddCharacter()) {
                addCharacterList($scope.textInputModalModel.input);

                $("#textInputModal").modal("hide");
            }
        };

        /** Opens the modal for adding characters. */
        $scope.openAddCharacterModal = function() {
            $scope.textInputModalModel = {
                title: "Add Character",
                action: addCharacter,
                label: "Name",
                buttonLabel: "Add",
                pattern: /^[A-Za-z\s\d]+$/,
                validate: validateAddCharacter,
                input: ""
            };

            $("#textInputModal").modal("show");
        };

        /** Confirm function for the edit variant modal. */
        var editVariant = function() {
            if (validateEditVariant()) {
                $scope.selectedList.name = $scope.textInputModalModel.input;
                $scope.saveClientSideData();

                $("#textInputModal").modal("hide");
            }
        };

        /** Opens the modal for editing variants. */
        $scope.openEditVariantModal = function() {
            $scope.textInputModalModel = {
                title: "Edit Variant",
                action: editVariant,
                label: "Name",
                buttonLabel: "Save",
                pattern: /^[A-Za-z\s\d]+$/,
                validate: validateEditVariant,
                input: $scope.selectedList.name
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
                    //$scope.allLists.length - 1
                }
                else {
                    selectListByIndex($scope.allLists.length - 1);
                }
            }
        }

        /** Opens the modal for deleting an existing character. */
        $scope.openDeleteModal = function() {
            $scope.confirmMessage = "Are you sure you want to delete " + $scope.allLists[$scope.selectedListIndex].name + "?";

            $scope.confirmFunc = deleteCharacter;
            $("#confirmModal").modal("show");
        };

        /** Clears all items from the currently selected character list. */
        $scope.clearItemsFromList = function() {
            for (var i = 0; i < $scope.selectedList.items.length; ++i) {
                if (!$scope.selectedList.items[i].locked) {
                    $scope.selectedList.items[i] = {"slot": $scope.selectedList.items[i].slot, "id": 0, "name": "-"};
                }
            }
            $scope.saveClientSideData();
        };

        /** Opens the modal for clearing items from a list. */
        $scope.openClearModal = function() {
            $scope.confirmMessage = "Are you sure you want to clear all of " + $scope.selectedList.name + "'s items? Only locked items will remain.";

            $scope.confirmFunc = $scope.clearItemsFromList;
            $("#confirmModal").modal("show");
        };

        /** Deletes the currently selected list variant. */
        var deleteVariant = function() {
            var index = $scope.selectedListVariantIndex;
            if (index > -1) {
                $scope.allLists[$scope.selectedListIndex].variants.splice(index, 1);

                if ($scope.allLists[$scope.selectedListIndex].variants.length === 0) {
                    $scope.addCharacterVariant($scope.selectedListIndex);
                }
                else if ($scope.selectedListVariantIndex >= $scope.allLists[$scope.selectedListIndex].variants.length) {
                    selectListVariantByIndex($scope.selectedListIndex, $scope.allLists[$scope.selectedListIndex].variants.length - 1);
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

            if ($scope.textInputModalModel.input.length === 0) {
                return false;
            }

            for (let i = 0; i < $scope.allLists.length; ++i) {
                if ($scope.allLists[i].name === $scope.textInputModalModel.input) {
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

            if ($scope.textInputModalModel.input.length === 0) {
                return false;
            }

            for (let i = 0; i < $scope.allLists.length; ++i) {
                if ($scope.allLists[i].name === $scope.allLists[$scope.selectedListIndex].name) {
                    continue;
                }
                if ($scope.allLists[i].name === $scope.textInputModalModel.input) {
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

            if ($scope.textInputModalModel.input.length === 0) {
                return false;
            }

            var variants = $scope.allLists[$scope.selectedListIndex].variants;
            for (let i = 0; i < variants.length; ++i) {
                if (variants[i].name === $scope.selectedList.name) {
                    continue;
                }

                if (variants[i].name === $scope.textInputModalModel.input) {
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
                switch($scope.selectedList.items[i].alignRestriction) {
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
         * @return {number} the total acquired via stat quests.
         */
        var getTotalFromStatQuests = function(statName) {
            var fromStatQuests = 0;

            var totalBaseStats = $scope.selectedList.baseStats.strength +
                $scope.selectedList.baseStats.mind +
                $scope.selectedList.baseStats.dexterity +
                $scope.selectedList.baseStats.constitution +
                $scope.selectedList.baseStats.perception +
                $scope.selectedList.baseStats.spirit;

            switch (statName) {
                case "strength":
                    if (totalBaseStats < 244) {
                        fromStatQuests += 3;
                    }
                    if ($scope.selectedList.baseStats.amulet == 0) {
                        fromStatQuests += 10;
                    }
                    if ($scope.selectedList.baseStats.hazelnut == 0) {
                        fromStatQuests += 10;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 3) {
                        fromStatQuests += 5;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 2) {
                        fromStatQuests += 3;
                    }
                    break;
                case "mind":
                    if (totalBaseStats < 244) {
                        fromStatQuests += 3;
                    }
                    if ($scope.selectedList.baseStats.amulet == 1) {
                        fromStatQuests += 10;
                    }
                    if ($scope.selectedList.baseStats.hazelnut == 1) {
                        fromStatQuests += 10;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 1 || $scope.selectedList.baseStats.longhouse == 8) {
                        fromStatQuests += 5;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 0) {
                        fromStatQuests += 3;
                    }
                    break;
                case "dexterity":
                    if (totalBaseStats < 244) {
                        fromStatQuests += 3;
                    }
                    if ($scope.selectedList.baseStats.amulet == 2) {
                        fromStatQuests += 10;
                    }
                    if ($scope.selectedList.baseStats.hazelnut == 2) {
                        fromStatQuests += 10;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 10) {
                        fromStatQuests += 8;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 4 || $scope.selectedList.baseStats.longhouse == 6) {
                        fromStatQuests += 5;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 1 || $scope.selectedList.baseStats.longhouse == 7) {
                        fromStatQuests += 3;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 12) {
                        fromStatQuests -= 2;
                    }
                    break;
                case "constitution":
                    if (totalBaseStats < 244) {
                        fromStatQuests += 3;
                    }
                    if ($scope.selectedList.baseStats.amulet == 3) {
                        fromStatQuests += 10;
                    }
                    if ($scope.selectedList.baseStats.hazelnut == 3) {
                        fromStatQuests += 10;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 5) {
                        fromStatQuests += 5;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 3 || $scope.selectedList.baseStats.longhouse == 6) {
                        fromStatQuests += 3;
                    }
                    break;
                case "perception":
                    if (totalBaseStats < 244) {
                        fromStatQuests += 3;
                    }
                    if ($scope.selectedList.baseStats.amulet == 4) {
                        fromStatQuests += 10;
                    }
                    if ($scope.selectedList.baseStats.hazelnut == 4) {
                        fromStatQuests += 10;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 11) {
                        fromStatQuests += 8;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 2 || $scope.selectedList.baseStats.longhouse == 7) {
                        fromStatQuests += 5;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 4) {
                        fromStatQuests += 3;
                    }
                    break;
                case "spirit":
                    if (totalBaseStats < 244) {
                        fromStatQuests += 3;
                    }
                    if ($scope.selectedList.baseStats.amulet == 5) {
                        fromStatQuests += 10;
                    }
                    if ($scope.selectedList.baseStats.hazelnut == 5) {
                        fromStatQuests += 10;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 9) {
                        fromStatQuests += 8;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 0) {
                        fromStatQuests += 5;
                    }
                    if ($scope.selectedList.baseStats.longhouse == 5 || $scope.selectedList.baseStats.longhouse == 8) {
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
         * @return {number} the total bonuses gained from other stats.
         */
        var getTotalFromStatBonuses = function(statName) {
            var fromBonus = 0;

            switch (statName)
            {
                case "hp":
                    var con = $scope.getStatTotal("constitution");
                    fromBonus += 381 + ((con - 30) * 5);
                    if (con > 89)
                        fromBonus += Math.max(con - 88, 0) * 5;
                    break;
                case "ma":
                    fromBonus += 446 + (($scope.getStatTotal("mind") - 30) * 5);
                    break;
                case "mv":
                    fromBonus += 496 + ((Math.max($scope.getStatTotal("constitution"), $scope.getStatTotal("dexterity")) - 30) * 5);
                    break;
                case "spelldam":
                    fromBonus += parseInt(($scope.getStatTotal("mind") - 52) / 2);
                    break;
                case "spellcrit":
                    fromBonus += parseInt(($scope.getStatTotal("mind") - 60) / 4);
                    fromBonus += parseInt(Math.max($scope.getStatTotal("perception") - 60, 0) / 8);
                    fromBonus += parseInt(Math.max($scope.getStatTotal("spirit") - 60, 0) / 8);
                    fromBonus += 5;
                    break;
                case "hit":
                    var str = $scope.getStatTotal("strength");
                    var dex = $scope.getStatTotal("dexterity");
                    var con = $scope.getStatTotal("constitution");

                    var bestStat = dex;
                    var wearingStrWeap = false;
                    var wearingConWeap = false;
                    for (var i = 0; i < $scope.selectedList.items.length; ++i) {
                        if ($scope.selectedList.items[i].slot == 14 || $scope.selectedList.items[i].slot == 15) {
                            if ($scope.selectedList.items[i].weaponStat == 1) {
                                wearingStrWeap = true;
                            }
                            else if ($scope.selectedList.items[i].weaponStat == 3) {
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
                case "dam":
                    var strength = $scope.getStatTotal("strength");
                    fromBonus += parseInt((strength - 30) / 3);
                    fromBonus += parseInt((strength - 75) / 5);
                    fromBonus += parseInt(Math.max(strength - 99, 0) / 2);
                    break;
                case "mitigation":
                    var con = $scope.getStatTotal("constitution");
                    var hasBattleTraining = false;
                    for (var i = 25; i < $scope.selectedList.items.length; ++i) { // loop through Other slots
                        if ($scope.selectedList.items[i].id == 1144 || $scope.selectedList.items[i].id == 1137) {
                            hasBattleTraining = true;
                            break;
                        }
                    }

                    if (hasBattleTraining) {
                        fromBonus += parseInt(Math.max(con - 75, 0) / 5);
                    }
                    break;
                case "ac":
                    var str = $scope.getStatTotal("strength");
                    var dex = $scope.getStatTotal("dexterity");
                    var con = $scope.getStatTotal("constitution");
                    var per = $scope.getStatTotal("perception");

                    var totalAC = 83;
                    totalAC += parseInt(Math.max(dex - 40, 0) * -0.5);
                    totalAC += parseInt(Math.max(per - 30, 0) / -6);
                    if (str >= 20 && dex >= 20 && con >= 20) {
                        totalAC -= 5;
                        if (dex >= 40 && con >= 40) {
                            totalAC -= 5;
                        }
                    }

                    fromBonus += totalAC;
                    break;
                case "hpr":
                    var con = $scope.getStatTotal("constitution");

                    fromBonus += parseInt(Math.max(con - 75, 0) * 0.2);
                    if (con > 79)
                        fromBonus += parseInt(Math.max(con - 70, 0) * 0.2);
                    fromBonus += Math.max(con - 100, 0);
                default:
                    break;
            }

            return fromBonus;
        };

        /**
         * Gets the bonus that should be applied to the stat total.
         *
         * @param {string} statName - the variable name of the stat to get the total bonus for.
         * @param {number} curTotal - the current total for the stat.
         * @return {number} the bonus amount based on the current total.
         */
        var getStatTotalBonus = function(statName, curTotal) {
            /*switch (statName) {
                case "dam":
                    for (var i = 0; i < $scope.selectedList.items.length; ++i) {
                        if ($scope.selectedList.items[i].slot == 14 && $scope.selectedList.items[i].twoHanded) {
                            return parseInt(curTotal / 3);
                        }
                    }
                   break;
          
                   default:
                    break;
            }
            */
            return 0;
        };

        /**
         * Gets the max total from items for a given stat.
         *
         * @param {string} statName - the variable name of the stat to get the max item total for.
         * @return {number} the max total a stat can gain from items.
         */
        var getItemTotalMax = function(statName) {
            var max = null;

            switch (statName) {
                case "hit":
                case "dam":
                    max = 27;
                    break;
                case "spelldam":
                case "spellcrit":
                    max = 40;
                    break;
                case "hpr":
                    var con = $scope.getStatTotal("constitution");

                    max = 20;
                    max -= parseInt(Math.max(con - 75, 0) * 0.2);
                    break;
                case "mar":
                case "mvr":
                    max = 20;
                    break;
                default:
                    break;
            }

            return max;
        };

        /**
         * Gets the max total for a given stat.
         *
         * @param {string} statName - the variable name of the stat to get the max total for.
         * @return {number} the max total for the given stat.
         */
        var getStatTotalMax = function(statName) {
            var max = null;

            switch (statName) {
                case "strength":
                case "mind":
                case "dexterity":
                case "constitution":
                case "perception":
                case "spirit":
                    max = 100;
                    for (var i = 0; i < $scope.selectedList.items.length; ++i) {
                        if ($scope.selectedList.items[i][statName + "Cap"])
                            max += $scope.selectedList.items[i][statName + "Cap"];
                    }
                    break;
                case "manaReduction":
                    max = 50;
                    break;
                case "mitigation":
                    var hasBattleTraining = false;
                    for (var i = 25; i < $scope.selectedList.items.length; ++i) { // loop through Other slots
                        if ($scope.selectedList.items[i].id == 1144 || $scope.selectedList.items[i].id == 1137) {
                            hasBattleTraining = true;
                            break;
                        }
                    }

                    var max = parseInt(Math.max(Math.min($scope.getStatTotal("constitution"), 70) - 30, 0) / 2);
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
         * @return {number} the min total for the given stat.
         */
        var getStatTotalMin = function(statName) {
            var min = null;

            switch (statName) {
                case "ac":
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
            if (statName == 'alignRestriction') {
                return getAlignmentTotal();
            }

            // Only get totals for number fields.
            for (let i = 0; i < $scope.statInfo.length; ++i) {
                if ($scope.statInfo[i].var == statName) {
                    if ($scope.statInfo[i].type != "int") {
                        return "";
                    }
                    break;
                }
            }

            // Clear stat restrictions
            if (!$scope.statRestrictions) {
                $scope.statRestrictions = [];
                for (let i = 0; i < $scope.statInfo.length; ++i) {
                    $scope.statRestrictions[$scope.statInfo[i].var] = [];
                }
            }
            $scope.statRestrictions[statName] = [];

            // Base stats
            var fromBaseStats = 0;
            if ($scope.selectedList.baseStats[statName]) {
                fromBaseStats += $scope.selectedList.baseStats[statName];
            }

            // KSM stat swap
            var fromKSMStats = 0;
            if ($scope.selectedList.ksmStats[statName]) {
                fromKSMStats += $scope.selectedList.ksmStats[statName];
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
                if (fromItems > itemTotalMax) {
                    $scope.statRestrictions[statName].push({
                        restriction: "fromItems",
                        amount: fromItems,
                        limit: itemTotalMax
                    });
                    fromItems = itemTotalMax;
                }
            }

            // Spell/Familiar stats
            var fromSpells = 0;
            for (let i = 24; i < $scope.selectedList.items.length; ++i) {
                if ($scope.selectedList.items[i][statName]) {
                    fromSpells += $scope.selectedList.items[i][statName];
                }
            }

            // stat bonuses
            var fromBonus = getTotalFromStatBonuses(statName);

            // sum up the different sections
            var total = fromBaseStats + fromKSMStats + fromStatQuests + fromItems + fromSpells + fromBonus;

            // apply total bonuses
            total += getStatTotalBonus(statName, total);

            // apply min and max
            totalMax = getStatTotalMax(statName);
            totalMin = getStatTotalMin(statName);

            if (totalMax != null) {
                if (total > totalMax) {
                    $scope.statRestrictions[statName].push({
                        restriction: "fromTotalMax",
                        amount: total,
                        limit: totalMax
                    });
                    total = totalMax;
                }
            }

            if (totalMin != null) {
                if (total < totalMin) {
                    $scope.statRestrictions[statName].push({
                        restriction: "fromTotalMin",
                        amount: total,
                        limit: totalMin
                    });
                }
            }

            switch (statName) {
                case "dam":
                case "hit":
                case "hpr":
                case "spelldam":
                case "spellcrit":
                    total = total + " (" + fromItems + ")";
                    break;
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
                if (curItem.slot == 1 || curItem.slot == 2 || curItem.slot == 13 || curItem.slot == 14 || curItem.slot == 15 || curItem.slot == 16) {
                    if (curItem.uniqueWear) {
                        for (var j = 0; j < $scope.selectedList.items.length; ++j) {
                            if (i == j) {
                                continue;
                            }
                            if (curItem.id != 0 && curItem.id == $scope.selectedList.items[j].id) {
                                $scope.itemRestrictions[i].push("unique");
                                break;
                            }
                        }
                    }
                }

                var strength = $scope.getStatTotal("strength");

                // weight
                if (curItem.slot == 14) {
                    if (curItem.weight * 4 > strength) {
                        $scope.itemRestrictions[i].push("weight");
                    }
                }

                // hand limit
                if (!handApplied && curItem.slot == 14 || curItem.slot == 15) {
                    if (curItem.twoHanded !== undefined) {
                        handCount += curItem.twoHanded ? 2 : 1;
                    }
                    if (handCount > 3) {
                        for (var j = 0; j < $scope.selectedList.items.length; ++j) {
                            if ($scope.selectedList.items[j].slot == 14 ||
                                $scope.selectedList.items[j].slot == 15) {
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

        $scope.anyStatRestrictions = function(statName) {
            return $scope.statRestrictions[statName].length > 0;
        }

        $scope.getItemRestrictionText = function(index) {
            var text = "";
            for (var i = 0; i < $scope.itemRestrictions[index].length; ++i) {
                switch($scope.itemRestrictions[index][i]) {
                    case "unique":
                        text += "You cannot wear two of this item.";
                        break;
                    case "weight":
                        var req = $scope.selectedList.items[index].weight * 4;
                        text += "You need " + req + " strength to wield this.";
                        break;
                    case "holdWeight":
                        var req = $scope.selectedList.items[index].weight * 5;
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

        $scope.getStatRestrictionText = function(statName) {
            var text = "";
            for (let i = 0; i < $scope.statRestrictions[statName].length; ++i) {
                let res = $scope.statRestrictions[statName][i];
                switch(res.restriction) {
                    case "fromItems":
                        text += "The item limit for this stat is " + res.limit + ". You currently have " + res.amount + ".";
                        break;
                    case "fromTotalMin":
                        text += "The overall limit for this stat is " + res.limit + ". You currently have " + res.amount + ".";
                        break;
                    case "fromTotalMax":
                        text += "The overall limit for this stat is " + res.limit + ". You currently have " + res.amount + ".";
                        break;
                    default:
                        break;
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
            let items = $scope.itemsBySlot[$scope.currentItem.slot];
            if (items) {
                let filteredItems = items.slice(0);
                let i = filteredItems.length;
                while (i--) {
                    let filteredBySearch = $scope.searchString && !filteredItems[i].name.toLowerCase().includes($scope.searchString.toLowerCase());

                    let filteredByWield = false;
                    if ($scope.currentItem.slot == 14 || $scope.currentItem.slot == 15) {
                        if ($scope.wieldSlotFilter == 1 && filteredItems[i].realSlot != 14) {
                            filteredByWield = true;
                        }
                        else if ($scope.wieldSlotFilter == 2 && filteredItems[i].realSlot != 15) {
                            filteredByWield = true;
                        }
                        else if ($scope.wieldSlotFilter == 3 && filteredItems[i].realSlot != 10) {
                            filteredByWield = true;
                        }
                    }

                    if (filteredBySearch || filteredByWield) {
                        filteredItems.splice(i, 1);
                    }
                }

                $scope.filteredItems = filteredItems;
            }
            else {
                $scope.filteredItems = items;
            }

        };

        $scope.showColumn = function(statShort, def) {
            if (!$scope.statInfo)
                return def;

            for (let i = 0; i < $scope.statInfo.length; ++i) {
                if ($scope.statInfo[i].short === statShort) {
                    return $scope.statInfo[i].showColumn;
                }
            }

            return def;
        };

        $scope.toggleColumn = function(statShort) {
            if (!$scope.statInfo)
                return;

            for (let i = 0; i < $scope.statInfo.length; ++i) {
                if ($scope.statInfo[i].short === statShort) {
                    $scope.statInfo[i].showColumn = !$scope.statInfo[i].showColumn;
                    $scope.saveClientSideData();
                    return;
                }
            }
        };

        $scope.resetColumns = function() {
            for (let i = 0; i < $scope.statInfo.length; ++i) {
                $scope.statInfo[i].showColumn = $scope.statInfo[i].showColumnDefault;
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
            var total = $scope.selectedList.baseStats.strength + $scope.selectedList.baseStats.mind + $scope.selectedList.baseStats.dexterity + $scope.selectedList.baseStats.constitution + $scope.selectedList.baseStats.perception + $scope.selectedList.baseStats.spirit;

            return total < 244;
        };

        $scope.initialize();
    };

    angular
        .module("legendwiki-app")
        .controller('builder', ["$scope", "$cookies", "$http", "$q", "$timeout", "itemConstants", "encoder", "exceptionService", builderController]);
})();
