<?php
$root = realpath(getenv("DOCUMENT_ROOT"));
require_once("$root/php/common/config.php");

class Permissions {
	static $Authenticated;
	static $PermissionList;
	static $PDO;

	public static function Check($permission = null, $mustCreate = null, $mustRead = null, $mustUpdate = null, $mustDelete = null) {
		self::InitPDO();

		if (!self::CheckLogin()) {
			return False;
		}

		if (!self::CheckPermissions($permission, $mustCreate, $mustRead, $mustUpdate, $mustDelete)) {
			return False;
		}

		return True;
	}

	private static function InitPDO() {
		if (!isset(self::$PDO)) {
			self::$PDO = getPDO();
		}
	}

    public static function CheckLogin() {
        if (!isset(self::$Authenticated)) {
			self::$Authenticated = False;
            if (isset($_SESSION['UserId'])) {
				$query = self::$PDO->prepare("SELECT Banned FROM Members WHERE Id = :id");
        		$query->execute(array("id" => $_SESSION['UserId']));
                if ($res = $query->fetch(PDO::FETCH_OBJ)) {
                    if ($res->Banned) {
						session_unset();
						session_destroy();
					}
					else {
                        self::$Authenticated = True;
					}
        		}
            }
            else if (isset($_SERVER['HTTP_LOGIN_TOKEN'])) {
                // restore login if login token is present
                
                // split token to get selector
                $tokenInfo = explode("-", getenv("HTTP_LOGIN_TOKEN"));

                // get hashed token for current IP
                $query = self::$PDO->prepare("SELECT AT.Id, M.Id AS MemberId, M.Username, AT.HashedValidator, M.Banned
						                FROM AuthTokens AT
							                JOIN Members M ON M.Id = AT.MemberId
                                        WHERE M.Banned = 0 AND AT.Expires > NOW() AND
                                            AT.Selector = :selector");
                $query->execute(array("selector" => $tokenInfo[0]));

                while ($res = $query->fetch(PDO::FETCH_OBJ)) {
                    // check that token matches
                    $newHash = hash("sha256", $tokenInfo[1]);
                    if (hash_equals($res->HashedValidator, $newHash)) {
		                // create session
		                $_SESSION['Username'] = $res->Username;
		                $_SESSION['UserId'] = $res->MemberId;

		                // remove old token
		                $updateq = self::$PDO->prepare("DELETE FROM AuthTokens WHERE Id = :id");
		                $updateq->execute(array("id" => $res->Id));

		                // create new token
                        $token = bin2hex(openssl_random_pseudo_bytes(24));
                        $selector = bin2hex(openssl_random_pseudo_bytes(6));
                        $combined = "$selector-$token";

		                // store hashed token to prevent database theft
		                $tokenHash = hash("sha256", $token);
		                $updateq = self::$PDO->prepare("INSERT INTO AuthTokens (Selector, HashedValidator, MemberId, Expires) VALUES (:selector, :hashedValidator, :memberId, DATE_ADD(NOW(), INTERVAL 30 DAY))");
		                $updateq->execute(array("selector" => $selector, "hashedValidator" => $tokenHash, "memberId" => $res->MemberId));

		                // update last login on members table
		                $updateq = self::$PDO->prepare("UPDATE Members SET LastLoginDate = NOW(), LastLoginIP = :ip, LastLoginIPForward = :ipf WHERE Id = :id");
                        $updateq->execute(array("id" => $res->MemberId, "ip" => getenv('REMOTE_ADDR'), "ipf" => getenv('HTTP_X_FORWARDED_FOR')));

                        // set the login token header on the response
                        header("login-token: $combined");
                        self::$Authenticated = True;
                        break;
                    }
                }
            }
		}

		return self::$Authenticated;
	}

	private static function CheckPermissions($permission, $mustCreate, $mustRead, $mustUpdate, $mustDelete) {
		if (!is_null($permission)) {
		    if (!isset(self::$PermissionList)) {
			    self::GatherPermissions();
		    }

			//check permission
			$canCreate = False;
			$canRead = False;
			$canUpdate = False;
			$canDelete = False;
			
			foreach (self::$PermissionList as $perm) {
				if ($perm->Name == $permission) {
					$canCreate |= $perm->Create;
					$canRead |= $perm->Read;
					$canUpdate |= $perm->Update;
					$canDelete |= $perm->Delete;
				}
			}

			return !(($mustCreate && !$canCreate) ||
			    ($mustRead && !$canRead) ||
			    ($mustUpdate && !$canUpdate) ||
			    ($mustDelete && !$canDelete));
		}
		else {
			return True;
		}
	}

	private static function GatherPermissions() {
		if (!isset(self::$PermissionList)) {
			$query = self::$PDO->prepare("SELECT DISTINCT P.Name, RPM.Create, RPM.Read, RPM.Update, RPM.Delete
						FROM Members M
							JOIN MemberRoleMap MRM ON MRM.MemberId = M.Id
							JOIN RolePermissionMap RPM ON RPM.RoleId = MRM.RoleId
							JOIN Permissions P ON P.Id = RPM.PermissionId
						WHERE M.Id = :memberId");
        		$query->execute(array("memberId" => $_SESSION['UserId']));
			self::$PermissionList = $query->fetchAll(PDO::FETCH_OBJ);
		}
	}
}
?>
