<?php

define("ROOT", dirname(__FILE__, 3));
define("APP_ROOT", ROOT . "/app");
define("IMG_ROOT", ROOT . "/public/img");

define('URL_ROOT', "http://localhost/vincentsjogren_2");
define('URL_PUBLIC', URL_ROOT . "/main/public");
define("URL_PUBLIC_IMG", URL_PUBLIC . "/img");

define("JSON_TIME_FORMAT", "Y-m-d H:i:s");

define("APP_TITLE", "Vincent Sjögren");
define("APP_CONTACT_EMAIL", "info@vincentsjogren.com");

date_default_timezone_set("Europe/Stockholm");