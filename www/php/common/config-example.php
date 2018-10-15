<?php
function getPDO() {
	$host = 'host'; // hostname (e.g., localhost)
	$db = 'db'; // dbname (e.g., legendhubdb)
	$user = 'user'; // username (e.g., legendhubuser)
	$pass = 'pass'; // password (e.g., youneedabetterpassword)
	$charset = 'utf8mb4';

	$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
	$opt = [
		PDO::ATTR_ERRMODE		=> PDO::ERRMODE_EXCEPTION,
		PDO::ATTR_DEFAULT_FETCH_MODE	=> PDO::FETCH_ASSOC,
		PDO::ATTR_EMULATE_PREPARES	=> false,
	];
	return new PDO($dsn, $user, $pass, $opt);
}
?>