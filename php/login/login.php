<?php
session_set_cookie_params(0, '/', '.legendhub.org', 1, 0);
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$username = $postdata->Username;
$password = $postdata->Password;

$hash = password_hash($password, PASSWORD_DEFAULT);


// check if username exists
$query = $pdo->prepare("SELECT Id, Username, Banned, Password FROM Members WHERE Username = :username");
$query->execute(array("username" => $username));
if ($res = $query->fetchAll(PDO::FETCH_CLASS)[0])
{
	if (password_verify($password, $res->Password) && !$res->Banned) {
		if ($res->Banned) {
			echo('{"success": false, "reason": "locked"');
			return;
		}
		$_SESSION['Username'] = $res->Username;
		$_SESSION['UserId'] = $res->Id;

		$updateq = $pdo->prepare("UPDATE Members SET LastLoginDate = NOW(), LastLoginIP = :ip, LastLoginIPForward = :ipf WHERE Id = :id");
		$updateq->execute(array("id" => $res->Id, "ip" => $_SERVER['REMOTE_ADDR'], "ipf" => $_SERVER['HTTP_X_FORWARDED_FOR']));

		echo('{"success": true, "reason": ""}');
		return;
	}
}

echo('{"success": false, "reason": "failed"}');
?>
