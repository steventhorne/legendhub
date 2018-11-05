<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/permissions.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
$itemAdded = $postdata->ItemAdded;
$itemUpdated = $postdata->ItemUpdated;
$mobAdded = $postdata->MobAdded;
$mobUpdated = $postdata->MobUpdated;
$questAdded = $postdata->QuestAdded;
$questUpdated = $postdata->QuestUpdated;
$wikiPageAdded = $postdata->WikiPageAdded;
$wikiPageUpdated = $postdata->WikiPageUpdated;

if (!Permissions::Check()) {
	header("HTTP/1.1 401 Unauthorized");
	return;
}

$sql = "UPDATE NotificationSettings
        SET ItemAdded = :itemAdded,
            ItemUpdated = :itemUpdated,
            MobAdded = :mobAdded,
            MobUpdated = :mobUpdated,
            QuestAdded = :questAdded,
            QuestUpdated = :questUpdated,
            WikiPageAdded = :wikiPageAdded,
            WikiPageUpdated = :wikiPageUpdated
        WHERE MemberId = :memberId";

$query = $pdo->prepare($sql); 
$query->execute(array('itemAdded' => $itemAdded,
    'itemUpdated' => $itemUpdated,
    'mobAdded' => $mobAdded,
    'mobUpdated' => $mobUpdated,
    'questAdded' => $questAdded,
    'questUpdated' => $questUpdated,
    'wikiPageAdded' => $wikiPageAdded,
    'wikiPageUpdated' => $wikiPageUpdated,
    'memberId' => $_SESSION['UserId']));

echo("{\"success\": true}")
?>
