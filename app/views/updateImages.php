<?php

if (
    $_SERVER["CONTENT_TYPE"] === "application/javascript"
    && $_SERVER["HTTP_SEC_FETCH_SITE"] === "same-origin"
) {
    $ih     = new ImageHandler();
    $header = "HTTP/1.1 200 OK";
    if ($ih->updateJsonData()) {
        $header .= " - Images Updated";
    }
    header($header);
    exit;
} else {
    header("HTTP/1.1 403 Forbidden");
    exit;
}