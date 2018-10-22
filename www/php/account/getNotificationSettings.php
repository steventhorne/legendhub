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

$sql = "SELECT *
        FROM NotificationSettings
        WHERE MemberId = :memberId";

$query = $pdo->prepare($sql); 
$query->execute(array('memberId' => $_SESSION['UserId']));
$result = $query->fetch(PDO::FETCH_OBJ);

echo(json_encode($result))
?>
