<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$searchString = $postdata->searchString;

$sql = "SELECT * FROM WikiPages WHERE (:searchString = '' OR Title LIKE :likeSearchString)";
$params = array();
$params["searchString"] = $searchString;
$params["likeSearchString"] = '%' . $searchString . '%';

$query = $pdo->prepare($sql);
$query->execute($params);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
