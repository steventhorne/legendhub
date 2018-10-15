<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$username = $postdata->Username;

$cleanUsername = preg_replace("/[^A-Za-z0-9]*/", "", $username);

if (strtolower($cleanUsername) == "dataimport")
{
	echo('{"success": false, "reason": "taken"}');
	return;
}

if (strlen($cleanUsername) < 5 || strlen($cleanUsername) > 25)
{
	echo('{"success": false, "reason": "length"}');
	return;
}

// TODO: regex for only A-Za-z0-9

// check if username exists
$query = $pdo->prepare("SELECT Id FROM Members WHERE Username = :username");
$query->execute(array("username" => $cleanUsername));
if ($res = $query->fetch())
{
	echo('{"success": false, "reason": "taken"}');
}
else
{
	echo('{"success": true, "reason": "available"}');
}
?>
