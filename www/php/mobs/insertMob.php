<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$postdata = json_decode(file_get_contents("php://input"));

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");
$pdo = getPDO();

if (!Permissions::Check("Mob", true, false, false, false)) {
	header("HTTP/1.1 401 Unauthorized");
	return;
}

$sql = "INSERT INTO Mobs(Name, AreaId, Gold, Xp, Aggro, Notes, ModifiedOn, ModifiedBy, ModifiedByIP)
VALUES (:Name, :AreaId, :Gold, :Xp, :Aggro, :Notes, NOW(), :ModifiedBy, :ModifiedByIP)";
$query = $pdo->prepare($sql);
$query->execute(array("Name" => $postdata->Name,
			"AreaId" => $postdata->AreaId,
			"Gold" => $postdata->Gold,
			"Xp" => $postdata->Xp,
			"Aggro" => $postdata->Aggro,
			"Notes" => $postdata->Notes,
			"ModifiedBy" => $_SESSION['Username'],
			"ModifiedByIP" => getIP()));

echo($pdo->lastInsertId());

?>
