<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));

$sql = "SELECT Id, Version, CreatedOn FROM ChangelogVersions ORDER BY CreatedOn DESC LIMIT 20";

$query = $pdo->query($sql);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
