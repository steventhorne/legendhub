<?php
session_start();

header( "Access-Control-Allow-Origin: http://legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$postdata = json_decode(file_get_contents("php://input"));
$statArray = (array) $postdata;

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once("$root/php/common/config.php");
$pdo = getPDO();

if (isset($_SESSION['UserId'])) {
	$query = $pdo->prepare("SELECT Banned FROM Members WHERE Id = :id");
	$query->execute(array("id" => $_SESSION['UserId']));
	if ($res = $query->fetchAll(PDO::FETCH_CLASS)[0]) {
		if ($res->Banned) {			
			session_unset();
			session_destroy();
			
			return;
		}
	}
}
else {
	return;
}

$execArray = array();
$sql = "UPDATE Items SET ModifiedOn = NOW(), ModifiedBy = :ModifiedBy, ModifiedByIP = :ModifiedByIP, ModifiedByIPForward = :ModifiedByIPForward";
$execArray["ModifiedByIP"] = $_SERVER['REMOTE_ADDR'];
$execArray["ModifiedByIPForward"] = $_SERVER['HTTP_X_FORWARDED_FOR'];
foreach ($statArray as $key => $value)
{
	if ($key == "Id")
		continue;
	$cleanKey = preg_replace('/[^A-Za-z_]*/', '', $key);
	$sql = $sql . ", " . $cleanKey . " = :" . $cleanKey;
	$execArray[$cleanKey] = $value;
}
$execArray["ModifiedBy"] = $_SESSION['Username'];
$sql = $sql . " WHERE Id = :Id";
$execArray["Id"] = $statArray['Id'];

//echo(json_encode($sql));
//return;


$query = $pdo->prepare($sql);
// $query = $pdo->prepare('UPDATE Items 
						// set Slot = :slot,
						    // Name = :name,
							// Strength = :str,
							// Mind = :min,
							// Dexterity = :dex,
							// Constitution = :con,
							// Perception = :per,
							// Spirit = :spi,
							// Ac = :ac,
							// Hit = :hit,
							// Dam = :dam,
							// Hp = :hp,
							// Hpr = :hpr,
							// Ma = :ma,
							// Mar = :mar,
							// Mv = :mv,
							// Mvr = :mvr,
							// Spelldam = :spelldam,
							// Spellcrit = :spellcrit,
							// ManaReduction = :manared,
							// Mitigation = :miti,
							// Accuracy = :acc,
							// Ammo = :ammo,
							// TwoHanded = :th,
							// MaxDam = :maxdam,
							// AvgDam = :avgdam,
							// MinDam = :mindam,
							// Parry = :parry,
							// Holdable = :holdable,
							// Rent = :rent,
							// Value = :value,
							// Weight = :weight,
							// UniqueWear = :uniquewear,
							// Notes = :notes,
							// ModifiedBy = :modifiedby,
							// ModifiedOn = NOW(),
							// ModifiedByIP = :modifiedbyip,
							// ModifiedByIPForward = :modifiedbyipforward,
							// AlignRestriction = :alignrestriction
						// WHERE Id = :id');
$query->execute($execArray);
//$query->execute(array(
	// "slot" => $postdata->Slot,
	// "name" => $postdata->Name,
	// "str" => $postdata->Strength,
	// "min" => $postdata->Mind,
	// "dex" => $postdata->Dexterity,
	// "con" => $postdata->Constitution,
	// "per" => $postdata->Perception,
	// "spi" => $postdata->Spirit,
	// "ac" => $postdata->Ac,
	// "hit" => $postdata->Hit,
	// "dam" => $postdata->Dam,
	// "hp" => $postdata->Hp,
	// "hpr" => $postdata->Hpr,
	// "ma" => $postdata->Ma,
	// "mar" => $postdata->Mar,
	// "mv" => $postdata->Mv,
	// "mvr" => $postdata->Mvr,
	// "spelldam" => $postdata->Spelldam,
	// "spellcrit" => $postdata->Spellcrit,
	// "manared" => $postdata->ManaReduction,
	// "miti" => $postdata->Mitigation,
	// "acc" => $postdata->Accuracy,
	// "ammo" => $postdata->Ammo,
	// "th" => $postdata->TwoHanded,
	// "maxdam" => $postdata->MaxDam,
	// "avgdam" => $postdata->AvgDam,
	// "mindam" => $postdata->MinDam,
	// "parry" => $postdata->Parry,
	// "holdable" => $postdata->Holdable,
	// "rent" => $postdata->Rent,
	// "value" => $postdata->Value,
	// "weight" => $postdata->Weight,
	// "uniquewear" => $postdata->UniqueWear,
	// "notes" => $postdata->Notes,
	// "modifiedby" => $postdata->ModifiedBy,
	// "modifiedbyip" => $_SERVER['REMOTE_ADDR'],
	// "modifiedbyipforward" => $_SERVER['HTTP_X_FORWARDED_FOR'],
	// "alignrestriction" => $postdata->AlignRestriction,
	// "id" => $postdata->Id
//));

echo($pdo->lastInsertId());

?>
