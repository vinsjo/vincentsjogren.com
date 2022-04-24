<?php
date_default_timezone_set("Europe/Stockholm");

ini_set('display_errors', '0');
define("JSON_TIME_FORMAT", "Y-m-d H:i:s");
if (version_compare(phpversion(), '7.1', '>=')) {ini_set('serialize_precision', -1);}

define("ROOT", dirname(__FILE__, 3));
define("APP_ROOT", ROOT . "/app");
define("ASSETS_ROOT", ROOT . "/assets");
define("IMG_ROOT", ASSETS_ROOT . "/images");
define("IMG_JSON", APP_ROOT . "/json/images.json");
define("ERROR_JSON", APP_ROOT . "/json/error.json");

define('URL_ROOT', "https://api.vincentsjogren.com");
define("URL_IMG", URL_ROOT . "/assets/images");

define("IMG_PREFIX", "vsjogren");
define("IMG_SIZES", [
    "_xs" => 640,
    "_s"  => 960,
    "_m"  => 1440,
    "_l"  => 1920,
    "_xl" => 2560,
]);