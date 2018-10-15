<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$QuestId = $postdata->QuestId;

$sql = "SELECT * FROM Items WHERE QuestId = :QuestId ORDER BY Name ASC";

$query = $pdo->prepare($sql);
$query->execute(array("QuestId" => $QuestId));
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
