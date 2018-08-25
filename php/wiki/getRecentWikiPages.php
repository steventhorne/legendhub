<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$query = $pdo->query('SELECT *
						FROM WikiPages
						ORDER BY PinnedRecent DESC, ModifiedOn DESC
						LIMIT 100');
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
