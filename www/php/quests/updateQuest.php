<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$postdata = json_decode(file_get_contents("php://input"));

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");
$pdo = getPDO();

if (!Permissions::Check("Quest", false, false, true, false)) {
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

$sql = "UPDATE Quests SET ModifiedOn = NOW(),
			ModifiedBy = :ModifiedBy,
			ModifiedByIP = :ModifiedByIP,
			Title = :Title,
			AreaId = :AreaId,
			Whoises = :Whoises,
			Content = :Content,
			Stat = :Stat
	WHERE Id = :Id";
$query = $pdo->prepare($sql);
$query->execute(array("ModifiedBy" => $_SESSION['Username'],
			"ModifiedByIP" => getIP(),
			"Title" => $postdata->Title,
			"AreaId" => $postdata->AreaId,
			"Whoises" => $postdata->Whoises,
			"Content" => $postdata->Content,
			"Stat" => $postdata->Stat,
			"Id" => $postdata->Id));

echo($postdata->Id);

?>
