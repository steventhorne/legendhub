<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$all = $postdata->all;
$objectType = $postdata->objectType;
$objectId = $postdata->objectId;

if (!Permissions::Check()) {
	header("HTTP/1.1 401 Unauthorized");
	return;
}

if ($all) {
    $sql = "UPDATE Notifications N
            SET N.Read = 1
            WHERE N.MemberId = :memberId";
    $exec = array('memberId' => $_SESSION['UserId']);
}
else {
    $sql = "UPDATE Notifications N
            JOIN NotificationChanges NC ON NC.Id = N.NotificationChangeId
            SET N.Read = 1
            WHERE N.MemberId = :memberId AND
                NC.ObjectId = :objectId AND
                NC.ObjectType = :objectType";

    $exec = array('memberId' => $_SESSION['UserId'],
        'objectId' => $objectId,
        'objectType' => $objectType);
}

$query = $pdo->prepare($sql);
$query->execute($exec);
?>
