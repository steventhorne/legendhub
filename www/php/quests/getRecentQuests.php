<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$query = $pdo->query('SELECT Q.*, A.Name As AreaName, A.Era AS AreaEra
					  FROM Quests AS Q
					  	  LEFT JOIN Areas AS A ON A.Id = Q.AreaId
					  ORDER BY Q.ModifiedOn DESC LIMIT 100');
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
