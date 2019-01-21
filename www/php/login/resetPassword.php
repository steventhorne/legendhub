<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org"  );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");
$pdo = getPDO();

if (!Permissions::Check("Password", false, true, true, false)) {
    header("HTTP/1.1 401 Unauthorized");
}

$postdata = json_decode(file_get_contents("php://input"));
$username = $postdata->username;
$password = $postdata->password;

$hash = password_hash($password, PASSWORD_DEFAULT);

$query = $pdo->prepare("UPDATE Members
                        SET Password = :password
                        WHERE Username = :username");
$query->execute(array("username" => $username, "password" => $hash));
