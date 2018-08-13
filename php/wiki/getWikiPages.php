<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$searchString = $postdata->searchString;
$categoryId = $postdata->categoryId;
$subcategoryId = $postdata->subcategoryId;

$sql = "SELECT * FROM WikiPages WHERE (:searchString = '' OR Title LIKE :likeSearchString OR Tags LIKE :tagsSearchString) AND (:searchCategoryId = 0 OR :categoryId = CategoryId) AND (:searchSubcategoryId = 0 OR :subcategoryId = SubCategoryId)";
$params = array();
$params["searchString"] = $searchString;
$likeString = '%' . $searchString . '%';
$params["likeSearchString"] = $likeString;
$params["tagsSearchString"] = $likeString;
$params["searchCategoryId"] = empty($categoryId) ? 0 : 1;
$params["categoryId"] = $categoryId;
$params["searchSubcategoryId"] = empty($subcategoryId) ? 0 : 1;
$params["subcategoryId"] = $subcategoryId;

$query = $pdo->prepare($sql);
$query->execute($params);
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
