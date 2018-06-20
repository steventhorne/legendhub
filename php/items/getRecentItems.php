<?php
header( "Access-Control-Allow-Origin: http://legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once("$root/php/common/config.php");
$pdo = getPDO();

$query = $pdo->query('SELECT * FROM Items ORDER BY ModifiedOn DESC LIMIT 20');
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
