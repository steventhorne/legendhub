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

$sql = "UPDATE Mobs SET ModifiedOn = NOW(),
			ModifiedBy = :ModifiedBy,
			ModifiedByIP = :ModifiedByIP,
			ModifiedByIPForward = :ModifiedByIPForward,
			Name = :Name,
			Xp = :Xp,
			Gold = :Gold,
			AreaId = :AreaId,
			Aggro = :Aggro,
			Notes = :Notes
	WHERE Id = :Id";
$query = $pdo->prepare($sql);
$query->execute(array("ModifiedBy" => $_SESSION['Username'],
			"ModifiedByIP" => getenv('REMOTE_ADDR'),
			"ModifiedByIPForward" => getenv('HTTP_X_FORWARDED_FOR'),
			"Name" => $postdata->Name,
			"Xp" => $postdata->Xp,
			"Gold" => $postdata->Gold,
			"AreaId" => $postdata->AreaId,
			"Aggro" => $postdata->Aggro,
			"Notes" => $postdata->Notes,
			"Id" => $postdata->Id));

echo($postdata->Id);

?>
