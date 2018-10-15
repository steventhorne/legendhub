<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$postdata = json_decode(file_get_contents("php://input"));

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");
$pdo = getPDO();

if (!Permissions::Check("ChangelogVersion", false, false, true, false)) {
	header("HTTP/1.1 401 Unauthorized");
	return;
}

$id = $postdata->Id;
$version = $postdata->Version;
$notes = $postdata->Notes;

$sql = "UPDATE ChangelogVersions
        SET Version = :version,
            Notes = :notes,
            ModifiedOn = NOW(),
            ModifiedBy = :modifiedBy,
            ModifiedByIP = :modifiedByIP,
            ModifiedByIPForward = :modifiedByIPForward
        where Id = :id";
$query = $pdo->prepare($sql);

$execArray = array("id" => $id,
                    "version" => $version,
                    "notes" => $notes,
                    "modifiedBy" => $_SESSION['Username'],
                    "modifiedByIP" => getenv('REMOTE_ADDR'),
                    "modifiedByIPForward" => getenv('HTTP_X_FORWARDED_FOR'));
$query->execute($execArray);

echo($id);

?>
