<?php
session_start();

header( "Access-Control-Allow-Origin: http://legendhub.org" );
header( "Content-Type: application/json; charset=UTF-8" );

session_unset();
session_destroy();
?>