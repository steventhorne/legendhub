<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$ids = $postdata->ids;

$sql = "SELECT * FROM Items WHERE Id IN (";
$count = count($ids);
for ($i = 0; $i < $count; $i++)
{
	$sql = $sql . ":id" . $i;
	if ($i < $count - 1)
	{
		$sql = $sql . ", ";
	}
}
$sql = $sql . ")";

$execParams = array();
for ($i = 0; $i < $count; $i++)
{
	$execParams[":id" . $i] = $ids[$i];
}

$query = $pdo->prepare($sql);
$query->execute($execParams);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
