<?php
$iniConf = parse_ini_file("config.ini", true);

define('_HOST_' , $_SERVER['HTTP_HOST']);
define('_SERVER_' , $iniConf["database"]["host"]);
define('_DB_USER_' , $iniConf["database"]["username"]);
define('_DB_PASS_' , $iniConf["database"]["password"]);
define('_DB_NAME_' , $iniConf["database"]["dbname"]);