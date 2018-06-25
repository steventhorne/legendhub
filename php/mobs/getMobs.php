<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$searchString = $postdata->searchString;

$sql = "SELECT * FROM Mobs WHERE (:searchString IS NULL OR Name LIKE :likeSearchString)";
$query = $pdo->prepare($sql);
$query->execute(['searchString' => $searchString,
                 'likeSearchString' => '%' . $searchString . '%']);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
