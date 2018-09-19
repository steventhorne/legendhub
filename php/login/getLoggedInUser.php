<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");

if (Permissions::Check()) {
    echo('{"success": true, "username": "' . $_SESSION['Username'] . '"}');
}
else {
    echo('{"success": false, "username": ""}');
}
?>
