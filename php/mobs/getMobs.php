<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$searchString = $postdata->searchString;
if (isset($postdata->eraId)) {
    $eraId = $postdata->eraId;
}
else {
    $eraId = -1;
}

if (isset($postdata->areaId)) {
    $areaId = $postdata->areaId;
}
else {
    $areaId = -1;
}

$sql = "SELECT M.*, A.Name AS AreaName, A.Era AS AreaEra
        FROM Mobs AS M
            LEFT JOIN Areas AS A ON A.Id = M.AreaId
        WHERE (:searchString IS NULL OR M.Name LIKE :likeSearchString) AND
              (:eraIdCheck < 1 OR :eraId = A.EraId) AND
              (:areaIdCheck < 1 OR :areaId = A.Id)";
$query = $pdo->prepare($sql); 
$query->execute(['searchString' => $searchString,
                 'likeSearchString' => '%' . $searchString . '%',
                 'eraIdCheck' => $eraId,
                 'eraId' => $eraId,
                 'areaIdCheck' => $areaId,
                 'areaId' => $areaId]);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
