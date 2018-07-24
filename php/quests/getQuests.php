<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$searchString = $postdata->searchString;
$statOnly = $postdata->statOnly;

$sql = "SELECT Q.*, A.Name AS AreaName, A.Era AS AreaEra
        FROM Quests AS Q
            LEFT JOIN Areas AS A ON A.Id = Q.AreaId
        WHERE (:searchString IS NULL OR Q.Title LIKE :likeSearchString OR A.Name LIKE :areaLikeSearchString OR Q.Content LIKE :contentLikeSearchString OR Q.Whoises LIKE :whoisesLikeSearchString) AND
	      (:statOnly = 0 OR Stat = 1)
        ORDER BY FIELD(A.Era, '', 'General', 'Ancient', 'Medieval', 'Industrial') ASC, A.Name ASC, TRIM(LEADING '...' FROM Q.Title) ASC";
$query = $pdo->prepare($sql);
$query->execute(['searchString' => $searchString,
                 'likeSearchString' => '%' . $searchString . '%',
		 'areaLikeSearchString' => '%' . $searchString . '%',
                 'contentLikeSearchString' => '%' . $searchString . '%',
                 'whoisesLikeSearchString' => '%' . $searchString . '%',
		 'statOnly' => $statOnly]);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
