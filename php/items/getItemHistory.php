<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$id = $postdata->id;

$query = $pdo->prepare('SELECT * FROM Items_AuditTrail WHERE ItemId = ? ORDER BY ModifiedOn DESC');
$query->execute([$id]);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
