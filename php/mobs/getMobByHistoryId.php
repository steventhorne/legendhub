<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$id = $postdata->id;

$query = $pdo->prepare('SELECT M.*, A.Name AS AreaName, A.Era AS AreaEra
			FROM Mobs_AuditTrail AS M
				LEFT JOIN Areas AS A ON A.Id = M.AreaId
			WHERE M.Id = ?');
$query->execute([$id]);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result[0]))
?>
