<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$searchString = $postdata->searchString;

$sql = "SELECT M.*, A.Name AS AreaName, A.Era AS AreaEra
        FROM Mobs AS M
            LEFT JOIN Areas AS A ON A.Id = M.AreaId
        WHERE (:searchString IS NULL OR M.Name LIKE :likeSearchString OR A.Name LIKE :areaLikeSearchString)";
$query = $pdo->prepare($sql);
$query->execute(['searchString' => $searchString,
                 'likeSearchString' => '%' . $searchString . '%',
                 'areaLikeSearchString' => '%' . $searchString . '%']);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
