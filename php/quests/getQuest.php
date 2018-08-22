<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$id = $postdata->id;

$query = $pdo->prepare('SELECT Q.*, A.Id AS AreaId, A.Name AS AreaName, A.EraId AS EraId, E.Name AS AreaEra
						FROM Quests AS Q
							LEFT JOIN Areas AS A ON A.Id = Q.AreaId
							LEFT JOIN Eras AS E ON E.Id = A.EraId
						WHERE Q.Id = ?');
$query->execute([$id]);
$result = $query->fetchAll(PDO::FETCH_CLASS);

echo(json_encode($result[0]))
?>
