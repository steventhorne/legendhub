<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$postdata = json_decode(file_get_contents("php://input"));

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

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
			ModifiedByIPForward = :ModifiedByIPForward,
			Title = :Title,
			AreaId = :AreaId,
			Whoises = :Whoises,
			Content = :Content
	WHERE Id = :Id";
$query = $pdo->prepare($sql);
$query->execute(array("ModifiedBy" => $_SESSION['Username'],
			"ModifiedByIP" => getenv('REMOTE_ADDR'),
			"ModifiedByIPForward" => getenv('HTTP_X_FORWARDED_FOR'),
			"Title" => $postdata->Title,
			"AreaId" => $postdata->AreaId,
			"Whoises" => $postdata->Whoises,
			"Content" => $postdata->Content,
			"Id" => $postdata->Id));

echo($pdo->lastInsertId());

?>
