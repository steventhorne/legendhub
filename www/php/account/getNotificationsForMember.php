<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");
$pdo = getPDO();

if (!Permissions::Check()) {
	header("HTTP/1.1 401 Unauthorized");
	return;
}

$sql = "SELECT N.MemberId,
            MAX(NCM.Username) AS MemberName,
            N.Read,
            NC.ObjectType,
            NC.ObjectId,
            COALESCE(I.Name) AS ObjectName,
            NC.Verb,
            COUNT(1) AS Count,
            MAX(NC.CreatedOn) AS CreatedOn
        FROM Notifications N
            JOIN NotificationChanges NC ON NC.Id = N.NotificationChangeId AND NC.ActorId <> N.MemberId
            JOIN Members NCM ON NC.ActorId = NCM.Id
            LEFT JOIN Items I ON NC.ObjectType = 'item' AND I.Id = NC.ObjectId
        WHERE N.MemberId = :memberId
        GROUP BY N.MemberId, N.Read, NC.ObjectType, NC.ObjectId, NC.Verb, I.Name";

$query = $pdo->prepare($sql); 
$query->execute(array('memberId' => $_SESSION['UserId']));
$result = $query->fetchAll(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
