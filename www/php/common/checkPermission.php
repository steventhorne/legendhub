<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");

$postdata = json_decode(file_get_contents("php://input"));
$permission = $postdata->permission;
$create = $postdata->create;
$read = $postdata->read;
$update = $postdata->update;
$delete = $postdata->delete;

$response = new \stdClass();
$response->success = Permissions::Check($permission, $create, $read, $update, $delete);

echo(json_encode($response));
?>
