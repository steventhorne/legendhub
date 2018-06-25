<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once("$root/php/common/config.php");
require_once("$root/php/common/itemConstants.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$searchString = $postdata->searchString;
$filterColumns = $postdata->filterColumns;

$sql = "SELECT * FROM Items WHERE (:searchString = '' OR Name LIKE :likeSearchString)";
$params = array();
for ($i = 0; $i < count($filterColumns); $i++)
{
	$sql = $sql . " AND (" . $itemStats[$filterColumns[$i]]->var . " " . $itemStats[$filterColumns[$i]]->filterString . ")";
}
$params["searchString"] = $searchString;
$params["likeSearchString"] = '%' . $searchString . '%';

$query = $pdo->prepare($sql);
$query->execute($params);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
