<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

if (isset($_SERVER['HTTP_LOGIN_TOKEN'])) {
    $tokenInfo = explode("-", getenv("HTTP_LOGIN_TOKEN"));
	$updateq = $pdo->prepare("DELETE FROM AuthTokens WHERE Selector = :selector OR NOW() > Expires");
	$updateq->execute(array("selector" => $tokenInfo[0]));
}

session_unset();
session_destroy();
?>
