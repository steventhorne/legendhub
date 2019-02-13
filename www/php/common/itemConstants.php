<?php
header( "Access-Control-Allow-Origin: http://legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$itemCategories = [
    (object) [
        'name' => 'Basic',
        'stats' => [0, 1, 2, 3, 11, 38, 39, 40, 41, 42, 43, 44, 45]
    ],
    (object) [
        'name' => 'Main',
        'stats' => [4, 5, 6, 7, 8, 9, 10]
    ],
    (object) [
        'name' => 'Regen',
        'stats' => [12, 13, 14, 15, 16, 17]
    ],
    (object) [
        'name' => 'Melee',
        'stats' => [18, 19]
    ],
    (object) [
        'name' => 'Mage',
        'stats' => [20, 21, 22, 23]
    ],
    (object) [
        'name' => 'Tank',
        'stats' => [24, 25]
    ],
    (object) [
        'name' => 'Ranged',
        'stats' => [26, 27, 28]
    ],
    (object) [
        'name' => 'Weapon',
        'stats' => [29, 30, 31, 32, 33, 34, 35, 36, 37]
    ],
];

$itemStats = [
    (object) ["display" => "Slot", "short" => "Slot", "var" => "Slot", "type" => "select", "showColumn" => true, "filterString" => "= %d", "default" => 0, "netStat" => 0], // 0
    (object) ["display" => "Name", "short" => "Name", "var" => "Name", "type" => "string", "showColumn" => true, "filterString" => "<> ''", "default" => "", "netStat" => 0, "editable" => false], // 1
    (object) ["display" => "Light", "short" => "Light", "var" => "IsLight", "type" => "bool", "filterString" => "= 1", "default" => false, "netStat" => 0],
    (object) ["display" => "Heroic", "short" => "Heroic", "var" => "IsHeroic", "type" => "bool", "filterString" => "= 1", "default" => false, "netStat" => 0],
    (object) ["display" => "Strength", "short" => "Str", "var" => "Strength", "type" => "int", "showColumn" => true, "filterString" => "> 0", "default" => 0, "netStat" => 1],
	(object) ["display" => "Mind", "short" => "Min", "var" => "Mind", "type" => "int", "showColumn" => true, "filterString" => "> 0", "default" => 0, "netStat" => 1], // 5
	(object) ["display" => "Dexterity", "short" => "Dex", "var" => "Dexterity", "type" => "int", "showColumn" => true, "filterString" => "> 0", "default" => 0, "netStat" => 1],
    (object) ["display" => "Constitution", "short" => "Con", "var" => "Constitution", "type" => "int", "showColumn" => true, "filterString" => "> 0", "default" => 0, "netStat" => 1],
    (object) ["display" => "Perception", "short" => "Per", "var" => "Perception", "type" => "int", "showColumn" => true, "filterString" => "> 0", "default" => 0, "netStat" => 1],
    (object) ["display" => "Spirit", "short" => "Spi", "var" => "Spirit", "type" => "int", "showColumn" => true, "filterString" => "> 0", "default" => 0, "netStat" => 1],
    (object) ["display" => "Ac", "short" => "Ac", "var" => "Ac", "type" => "int", "showColumn" => true, "filterString" => "< 0", "default" => null, "netStat" => 0], // 10
    (object) ["display" => "Alignment", "short" => "Align", "var" => "AlignRestriction", "type" => "select", "showColumn" => true, "filterString" => "= %d", "default" => 0, "netStat" => 0], 
    (object) ["display" => "Hp", "short" => "Hp", "var" => "Hp", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 10],
    (object) ["display" => "Mana", "short" => "Ma", "var" => "Ma", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 10],
    (object) ["display" => "Mv", "short" => "Mv", "var" => "Mv", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 10],
    (object) ["display" => "Hp Regen", "short" => "Hpr", "var" => "Hpr", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 2], // 15
    (object) ["display" => "Mana Regen", "short" => "Mar", "var" => "Mar", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 2],
    (object) ["display" => "Mv Regen", "short" => "Mvr", "var" => "Mvr", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 2],
    (object) ["display" => "Hitroll", "short" => "Hit", "var" => "Hit", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 2],
    (object) ["display" => "Damroll", "short" => "Dam", "var" => "Dam", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 2],
    (object) ["display" => "Spell Dam", "short" => "SpDam", "var" => "Spelldam", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 3], // 20
    (object) ["display" => "Spell Crit", "short" => "SpCrit", "var" => "Spellcrit", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 3],
    (object) ["display" => "Mana Reduction", "short" => "Ma Redux", "var" => "ManaReduction", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 3],
    (object) ["display" => "Concentration", "short" => "Concen", "var" => "Concentration", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 0],
    (object) ["display" => "Mitigation", "short" => "Mit", "var" => "Mitigation", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 2],
    (object) ["display" => "Parry", "short" => "Parry", "var" => "Parry", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 2], // 25
    (object) ["display" => "Accuracy", "short" => "Accu", "var" => "Accuracy", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 0],
    (object) ["display" => "Ammo Limit", "short" => "Ammo", "var" => "Ammo", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 0],
    (object) ["display" => "Accuracy Bonus", "short" => "AccuBonus", "var" => "RangedAccuracy", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 0], // TODO: netStat???
    (object) ["display" => "Two Handed", "short" => "2H", "var" => "TwoHanded", "type" => "bool", "filterString" => "= 1", "default" => false, "netStat" => 0],
    (object) ["display" => "Quality", "short" => "Quality", "var" => "Quality", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 0], // 30
    (object) ["display" => "Speed Factor", "short" => "Speed", "var" => "SpeedFactor", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 0],
    (object) ["display" => "Max Dam", "short" => "MaxDam", "var" => "MaxDam", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 0],
    (object) ["display" => "Avg Dam", "short" => "AvgDam", "var" => "AvgDam", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 0],
    (object) ["display" => "Min Dam", "short" => "MinDam", "var" => "MinDam", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 0],
    (object) ["display" => "Holdable", "short" => "Holdable", "var" => "Holdable", "type" => "bool", "filterString" => "= 1", "default" => false, "netStat" => 0], // 35
    (object) ["display" => "Weapon Type", "short" => "Weap Type", "var" => "WeaponType", "type" => "select", "filterString" => "= %d", "default" => null, "netStat" => 0],
    (object) ["display" => "Weapon Stat", "short" => "Weap Stat","var" => "WeaponStat", "type" => "select", "filterString" => "= %d", "default" => null, "netStat" => 0],
    (object) ["display" => "Weight", "short" => "Weight", "var" => "Weight", "type" => "decimal", "filterString" => "> 0", "default" => 0, "netStat" => 0],
    (object) ["display" => "Unique", "short" => "Unique", "var" => "UniqueWear", "type" => "bool", "filterString" => "= 1", "default" => false, "netStat" => 0],
    (object) ["display" => "Bonded", "short" => "Bonded", "var" => "Bonded", "type" => "bool", "filterString" => "= 1", "default" => false, "netStat" => 0], // 40
    (object) ["display" => "Casts", "short" => "Casts", "var" => "Casts", "type" => "string", "filterString" => "<> ''", "default" => "", "netStat" => 0],
    (object) ["display" => "Level Req", "short" => "Level", "var" => "Level", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 0],
    (object) ["display" => "Net Stat", "short" => "Net Stat", "var" => "NetStat", "type" => "decimal", "showColumn" => false, "filterString" => ">= 4", "default" => 0, "netStat" => 0, "editable" => false],
    (object) ["display" => "Sell Price", "short" => "Sell", "var" => "Value", "type" => "int", "filterString" => "> 0", "default" => 0, "netStat" => 0],
    (object) ["display" => "Rent", "short" => "Rent", "var" => "Rent", "type" => "int", "showColumn" => true, "filterString" => "> 0", "default" => 0, "netStat" => 0]]; // 45

// NOT INCLUDED
// | Id                  | int(11)     | NO   | PRI | NULL    | auto_increment |
// | Notes               | text        | YES  |     | NULL    |                |
// | ModifiedBy          | varchar(45) | NO   |     | NULL    |                |
// | ModifiedOn          | datetime    | NO   |     | NULL    |                |
// | ModifiedByIP        | varchar(45) | YES  |     | NULL    |                |
?>
