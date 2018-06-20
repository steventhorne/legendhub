<?php
header( "Access-Control-Allow-Origin: http://legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$id = $postdata->id;

$query = $pdo->prepare('SELECT I.*, M.Name AS MobName
						FROM Items AS I
							LEFT JOIN ItemMobMap AS IMM ON IMM.ItemId = I.Id
							LEFT JOIN Mobs AS M ON M.Id = IMM.MobId
						WHERE I.Id = ?');
$query->execute([$id]);
$result = $query->fetchAll(PDO::FETCH_CLASS);

echo(json_encode($result[0]))
?>
