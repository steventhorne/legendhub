<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

if (isset($_SESSION['Username'])) {
	$updateq = $pdo->prepare("DELETE FROM PersistentLogins WHERE Username = :username AND LoginIP = :ip");
	$updateq->execute(array("username" => $_SESSION['Username'], "ip" => getenv('REMOTE_ADDR')));
}

session_unset();
session_destroy();
?>