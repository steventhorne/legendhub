<?php
session_set_cookie_params(0, '/', '.legendhub.org', 1, 0);
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$username = $postdata->Username;
$password = $postdata->Password;

// check if username exists
$query = $pdo->prepare("SELECT Id, Username, Banned, Password FROM Members WHERE Username = :username");
$query->execute(array("username" => $username));
if ($res = $query->fetchAll(PDO::FETCH_CLASS)[0])
{
	// verify password
	if (password_verify($password, $res->Password) && !$res->Banned) {
		if ($res->Banned) {
			echo('{"success": false, "reason": "locked"');
			return;
		}
		$_SESSION['Username'] = $res->Username;
		$_SESSION['UserId'] = $res->Id;

		$updateq = $pdo->prepare("UPDATE Members SET LastLoginDate = NOW(), LastLoginIP = :ip, LastLoginIPForward = :ipf WHERE Id = :id");
		$updateq->execute(array("id" => $res->Id, "ip" => getenv('REMOTE_ADDR'), "ipf" => getenv('HTTP_X_FORWARDED_FOR')));

		$response = new \stdClass();
		$response->success = true;
		$response->reason = "";
		if (isset($postdata->StayLoggedIn) && $postdata->StayLoggedIn) {
			$response->token = bin2hex(openssl_random_pseudo_bytes(24));

			// store hashed token to prevent database theft
			$tokenHash = password_hash($response->token, PASSWORD_DEFAULT);
			$updateq = $pdo->prepare("INSERT INTO PersistentLogins (Username, LoginIP, Token) VALUES (:username, :loginIP, :token)");
			$updateq->execute(array("username" => $res->Username, "loginIP" => getenv('REMOTE_ADDR'), "token" => $tokenHash));
		}
		echo(json_encode($response));
		return;
	}
}

echo('{"success": false, "reason": "failed"}');
?>
