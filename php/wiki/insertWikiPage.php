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

$statArray["ModifiedBy"] = $_SESSION['Username'];
$statArray["ModifiedByIP"] = $_SERVER['REMOTE_ADDR'];
$statArray["ModifiedByIPForward"] = $_SERVER['HTTP_X_FORWARDED_FOR'];
$execArray = array();
$sql = "INSERT INTO WikiPages(ModifiedOn";
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
