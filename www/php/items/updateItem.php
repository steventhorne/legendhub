<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$postdata = json_decode(file_get_contents("php://input"));
$statArray = (array) $postdata;

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");
$pdo = getPDO();

if (!Permissions::Check("Item", false, false, true, false)) {
	header("HTTP/1.1 401 Unauthorized");
	return;
}

$mobName = $statArray['MobName'];
$statArray['MobId'] = 0;
if (strlen(trim($mobName)) > 0) {
	$query = $pdo->prepare("SELECT * FROM Mobs WHERE Name = :mobName");
	$query->execute(array("mobName" => $mobName));
	if ($res = $query->fetch(PDO::FETCH_OBJ)) {
		$statArray['MobId'] = $res->Id;
	}
	if ($statArray['MobId'] == 0) {
		$addMobQuery = $pdo->prepare("INSERT INTO Mobs (Name, ModifiedOn, ModifiedBy, ModifiedByIP) VALUES (:Name, NOW(), :ModifiedBy, :ModifiedByIP)");
		$addMobQuery->execute(array("Name" => $mobName, "ModifiedBy" => $_SESSION['Username'], "ModifiedByIP" => getIP()));
		$statArray['MobId'] = $pdo->lastInsertId();
	}
}
unset($statArray['MobName']);
unset($statArray['QuestTitle']);

$execArray = array();
$sql = "UPDATE Items SET ModifiedOn = NOW()";
$statArray["ModifiedByIP"] = getIP();
$statArray["ModifiedBy"] = $_SESSION['Username'];
foreach ($statArray as $key => $value)
{
	if ($key == "Id")
		continue;
	$cleanKey = preg_replace('/[^A-Za-z_]*/', '', $key);
	$sql = $sql . ", " . $cleanKey . " = :" . $cleanKey;
	$execArray[$cleanKey] = $value;
}
$sql = $sql . " WHERE Id = :Id";
$execArray["Id"] = $statArray['Id'];

$query = $pdo->prepare($sql);
$query->execute($execArray);

echo($statArray['Id']);

?>
