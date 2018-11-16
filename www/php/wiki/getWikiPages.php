<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$searchString = $postdata->searchString;
if (isset($postdata->categoryId)) {
	$categoryId = $postdata->categoryId;
}
else {
	$categoryId = -1;
}

if (isset($postdata->subcategoryId)) {
	$subcategoryId = $postdata->subcategoryId;
}
else {
	$subcategoryId = -1;
}

$sql = "SELECT *
		FROM WikiPages
		WHERE (:searchString = '' OR Title LIKE :likeSearchString OR Tags LIKE :tagsSearchString OR Content LIKE :contentSearchString) AND
			(:searchCategoryId = 0 OR :categoryId = CategoryId) AND
			(:searchSubcategoryId = 0 OR :subcategoryId = SubCategoryId)
        ORDER BY PinnedSearch DESC,
            CASE
                WHEN Title LIKE :titleOrderString THEN 1
                WHEN Tags LIKE :tagsOrderString THEN 2
                WHEN Content LIKE :contentOrderString THEN 3
                ELSE 4
            END ASC, ModifiedOn DESC";
$params = array();
$params["searchString"] = $searchString;
$likeString = '%' . $searchString . '%';
$params["likeSearchString"] = $likeString;
$params["tagsSearchString"] = $likeString;
$params["contentSearchString"] = $likeString;
$params["searchCategoryId"] = $categoryId >= 0 ? 1 : 0;
$params["categoryId"] = $categoryId;
$params["searchSubcategoryId"] = $subcategoryId >= 0 ? 1 : 0;
$params["subcategoryId"] = $subcategoryId;
$params["titleOrderString"] = $likeString;
$params["tagsOrderString"] = $likeString;
$params["contentOrderString"] = $likeString;

$query = $pdo->prepare($sql);
$query->execute($params);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
