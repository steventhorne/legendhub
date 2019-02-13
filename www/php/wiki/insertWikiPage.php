<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$postdata = json_decode(file_get_contents("php://input"));

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");
$pdo = getPDO();

if (!Permissions::Check("Wiki", true, false, false, false)) {
	header("HTTP/1.1 401 Unauthorized");
	return;
}

if (isset($_SESSION['UserId'])) {
	$query = $pdo->prepare("SELECT Banned FROM Members WHERE Id = :id");
	$query->execute(array("id" => $_SESSION['UserId']));
	if ($res = $query->fetchAll(PDO::FETCH_CLASS)[0]) {
		if ($res->Banned) {			
			session_unset();
			session_destroy();
			
			return;
		}
	}
}
else {
	return;
}

$sql = "INSERT INTO WikiPages(Title, CategoryId, SubCategoryId, Tags, Content, ModifiedOn, ModifiedBy, ModifiedByIP)
VALUES (:Title, :CategoryId, :SubCategoryId, :Tags, :Content, NOW(), :ModifiedBy, :ModifiedByIP)";
$query = $pdo->prepare($sql);
$query->execute(array("Title" => $postdata->Title,
			"CategoryId" => $postdata->CategoryId,
			"SubCategoryId" => $postdata->SubCategoryId,
			"Tags" => $postdata->Tags,
			"Content" => $postdata->Content,
			"ModifiedBy" => $_SESSION['Username'],
			"ModifiedByIP" => getIP()));

echo($pdo->lastInsertId());

?>
