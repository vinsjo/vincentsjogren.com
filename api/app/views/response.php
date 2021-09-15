<?php
if (!isset($data["response"]) || empty($data["response"])) {
    header("HTTP/1.1 400 Bad Request - No response data");
    exit;
}
header("Content-Type: application/json");
echo json_encode(
    $data["response"],
    JSON_UNESCAPED_UNICODE |
    JSON_UNESCAPED_SLASHES |
    JSON_PRESERVE_ZERO_FRACTION |
    JSON_NUMERIC_CHECK
);
exit;