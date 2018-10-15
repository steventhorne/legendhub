<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$id = $postdata->id;

$sql = "SELECT Id, Version, Notes, CreatedOn, ModifiedOn, ModifiedBy FROM ChangelogVersions WHERE Id = :id";
$query = $pdo->prepare($sql);

$execArray = array("id" => $id);
$query->execute($execArray);
$result = $query->fetch(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
