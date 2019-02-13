<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$postdata = json_decode(file_get_contents("php://input"));

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");
$pdo = getPDO();

if (!Permissions::Check("ChangelogVersion", true, false, false, false)) {
	header("HTTP/1.1 401 Unauthorized");
	return;
}

$version = $postdata->Version;
$notes = $postdata->Notes;

$sql = "INSERT INTO ChangelogVersions (Version, Notes, CreatedOn, ModifiedOn, ModifiedBy, ModifiedByIP) VALUES (:version, :notes, NOW(), NOW(), :modifiedBy, :modifiedByIP)";
$query = $pdo->prepare($sql);

$execArray = array("version" => $version,
                    "notes" => $notes,
                    "modifiedBy" => $_SESSION['Username'],
                    "modifiedByIP" => getIP());
$query->execute($execArray);

echo($pdo->lastInsertId());

?>
