<?php
header( "Access-Control-Allow-Origin: http://legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$username = $postdata->Username;
$password = $postdata->Password;
$confirmPassword = $postdata->ConfirmPassword;

$cleanUsername = preg_replace("/[^A-Za-z0-9]*/", "", $username);
$hash = password_hash($password, PASSWORD_DEFAULT);

if (strlen($cleanUsername) < 5 || strlen($cleanUsername) > 25) {
	echo('{"success": false}');
	return;
}

if (strlen($password) < 8 || $password != $confirmPassword) {
	echo('{"success": false}');
}

// check if username exists
$query = $pdo->prepare("SELECT Id FROM Members WHERE Username = :username");
$query->execute(array("username" => $cleanUsername));
if ($res = $query->fetch())
{
	echo('{"success": false}');
	return;
}

$query = $pdo->prepare("INSERT INTO Members (Username, Password) VALUES (:username, :password)");
$query->execute(array("username" => $username, "password" => $hash));

echo('{"success": true}');
?>
