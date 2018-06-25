<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$postdata = json_decode(file_get_contents("php://input"));

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
		$addMobQuery = $pdo->prepare("INSERT INTO Mobs (Name) VALUES (:Name)");
		$addMobQuery->execute(array("Name" => $mobName));
		$statArray['MobId'] = $pdo->lastInsertId();
	}
}
unset($statArray['MobName']);

$statArray["ModifiedBy"] = $_SESSION['Username'];
$execArray = array();
$execArray["ModifiedByIP"] = $_SERVER['REMOTE_ADDR'];
$execArray["ModifiedByIPForward"] = $_SERVER['HTTP_X_FORWARDED_FOR'];
$sql = "INSERT INTO Items(ModifiedOn, ModifiedByIP, ModifiedByIPForward";
foreach ($statArray as $key => $value) 
{
	$cleanKey = preg_replace('/[^A-Za-z_]*/', '', $key);
	$sql = $sql . ", " . $cleanKey;
	$execArray[$cleanKey] = $value;
}
$sql = $sql . ") VALUES (NOW(), :ModifiedByIP, :ModifiedByIPForward";
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
