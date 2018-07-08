<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$searchString = $postdata->searchString;

$sql = "SELECT Q.*, A.Name AS AreaName, A.Era AS AreaEra
        FROM Quests AS Q
            LEFT JOIN Areas AS A ON A.Id = Q.AreaId
        WHERE (:searchString IS NULL OR Q.Title LIKE :likeSearchString OR A.Name LIKE :areaLikeSearchString OR Q.Content LIKE :contentLikeSearchString OR Q.Whoises LIKE :whoisesLikeSearchString)";
$query = $pdo->prepare($sql);
$query->execute(['searchString' => $searchString,
                 'likeSearchString' => '%' . $searchString . '%',
				 'areaLikeSearchString' => '%' . $searchString . '%',
                 'contentLikeSearchString' => '%' . $searchString . '%',
                 'whoisesLikeSearchString' => '%' . $searchString . '%']);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
