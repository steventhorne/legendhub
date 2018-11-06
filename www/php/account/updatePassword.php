<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$oldPassword = $postdata->oldPassword;
$newPassword = $postdata->newPassword;

if (!Permissions::Check()) {
	header("HTTP/1.1 401 Unauthorized");
	return;
}

$sql = "SELECT Password
        FROM Members
        WHERE Id = :memberId";

$query = $pdo->prepare($sql);
$query->execute(array('memberId' => $_SESSION['UserId']));
$result = $query->fetch(PDO::FETCH_OBJ);

if (password_verify($oldPassword, $result->Password)) {
    $sql = "UPDATE Members
            SET Password = :newPassword";

    $query = $pdo->prepare($sql);
    $query->execute(array('newPassword' => password_hash($newPassword, PASSWORD_DEFAULT)));

    // delete all remember-me tokens
    $sql = "DELETE FROM AuthTokens WHERE MemberId = :memberId";
    $query = $pdo->prepare($sql);
    $query->execute(array('memberId' => $_SESSION['UserId']));

    echo('{"success": true}');
} else {
    echo('{"success": false}');
}

?>
