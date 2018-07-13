<?php
header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$pdo = getPDO();

$postdata = json_decode(file_get_contents("php://input"));

$query = $pdo->query("SELECT * FROM Areas ORDER BY FIELD(Era, '', 'General', 'Ancient', 'Medieval', 'Industrial') ASC, Name ASC");
$result = $query->fetchAll(PDO::FETCH_CLASS);

echo(json_encode($result))
?>
