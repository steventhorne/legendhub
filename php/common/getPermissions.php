<?php
session_start();

header( "Access-Control-Allow-Origin: legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");
$PDO = getPDO();

$postdata = json_decode(file_get_contents("php://input"));
if (isset($_SESSION['UserId'])) {
	$query = $PDO->prepare("SELECT DISTINCT P.Name, RPM.Create, RPM.Read, RPM.Update, RPM.Delete
						FROM Members M
							JOIN MemberRoleMap MRM ON MRM.MemberId = M.Id
							JOIN RolePermissionMap RPM ON RPM.RoleId = MRM.RoleId
							JOIN Permissions P ON P.Id = RPM.PermissionId
						WHERE M.Id = :memberId");
	$query->execute(array("memberId" => $_SESSION['UserId']));
	echo(json_encode($query->fetchAll(PDO::FETCH_OBJ)));
}
else {
	echo(json_encode(array()));
}
?>
