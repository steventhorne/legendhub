<?php
header( "Access-Control-Allow-Origin: http://legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$slot = $postdata->slot;

$sql = "SELECT * FROM Items WHERE ";

if ($slot == 15)
{
	$sql = $sql . "(Slot = 14 AND Holdable = 1) OR ";
}
$sql = $sql . "Slot = :slot";
if ($slot == 14)
{
	$sql = $sql . " OR Slot = 15";
}

$sql = $sql . " ORDER BY Name ASC";

$query = $pdo->prepare($sql);
$query->execute(array("slot" => $slot));
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
