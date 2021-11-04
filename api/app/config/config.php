<?php
date_default_timezone_set("Europe/Stockholm");
ini_set('display_errors', '0');
if (version_compare(phpversion(), '7.1', '>=')) {
    ini_set('serialize_precision', '-1');
}

define("ROOT", dirname(__FILE__, 3));
define("APP_ROOT", ROOT . "/app");
define("IMG_ROOT", ROOT . "/img");
define("IMG_JSON", APP_ROOT . "/json/img.json");
define("ERROR_JSON", APP_ROOT . "/json/error.json");

define('URL_ROOT', "http://localhost/vincentsjogren.com/api");
// define('URL_ROOT', "https://vincentsjogren.com/api");
define("URL_IMG", URL_ROOT . "/img");

define("IMG_PREFIX", "vsjogren");
define("IMG_SIZES", [
    "_xs" => 640,
    "_s"  => 960,
    "_m"  => 1440,
    "_l"  => 1920,
    "_xl" => 2560,
    //"_xxl" => 3840,
]);

define("JSON_TIME_FORMAT", "Y-m-d H:i:s");

define("ERROR_CODES_HTTP", [
    400 => "Bad Request",
    401 => "Unauthorized",
    403 => "Forbidden",
    404 => "Not Found",
    500 => "Internal Server Error",
]);