<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$postdata = json_decode(file_get_contents("php://input"));

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");
$pdo = getPDO();

if (!Permissions::Check("Item", true, false, false, false)) {
	header("HTTP/1.1 401 Unauthorized");
	return;
}

$statArray = (array) $postdata;

$mobName = $statArray['MobName'];
$statArray['MobId'] = 0;
if (strlen(trim($mobName)) > 0) {
	$query = $pdo->prepare("SELECT * FROM Mobs WHERE Name = :mobName");
	$query->execute(array("mobName" => $mobName));
	if ($res = $query->fetch(PDO::FETCH_OBJ)) {
		$statArray['MobId'] = $res->Id;
	}
	if ($statArray['MobId'] == 0) {
		$addMobQuery = $pdo->prepare("INSERT INTO Mobs (Name, ModifiedOn, ModifiedBy, ModifiedByIP, ModifiedByIPForward) VALUES (:Name, NOW(), :ModifiedBy, :ModifiedByIP, :ModifiedByIPForward)");
		$addMobQuery->execute(array("Name" => $mobName, "ModifiedBy" => $_SESSION['Username'], "ModifiedByIP" => getenv('REMOTE_ADDR'), "ModifiedByIPForward" => getenv('HTTP_X_FORWARDED_FOR')));
		$statArray['MobId'] = $pdo->lastInsertId();
	}
}
unset($statArray['MobName']);
unset($statArray['QuestTitle']);

$statArray["ModifiedBy"] = $_SESSION['Username'];
$statArray["ModifiedByIP"] = getenv('REMOTE_ADDR');
$statArray["ModifiedByIPForward"] = getenv('HTTP_X_FORWARDED_FOR');
$execArray = array();
$sql = "INSERT INTO Items(ModifiedOn";
foreach ($statArray as $key => $value) 
{
	$cleanKey = preg_replace('/[^A-Za-z_]*/', '', $key);
	$sql = $sql . ", " . $cleanKey;
	$execArray[$cleanKey] = $value;
}
$sql = $sql . ") VALUES (NOW()";
foreach ($statArray as $key => $value)
{
	$cleanKey = preg_replace('/[^A-Za-z_]*/', '', $key);
	$sql = $sql . ", :" . $cleanKey;
}
$sql = $sql . ")";

$query = $pdo->prepare($sql);
$query->execute($execArray);

echo($pdo->lastInsertId());

?>
