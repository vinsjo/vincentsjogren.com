<?php
declare (strict_types = 1);

class Response extends Controller
{
    private $__model;
    public $gzipEncode = true;
    public function __construct()
    {
        try {
            if ($_SERVER["HTTP_SEC_FETCH_SITE"] !== "same-origin"
            ) {
                //$this->_error(403);
            }
            if (!isset($_SERVER["HTTP_ACCEPT_ENCODING"]) ||
                strpos($_SERVER["HTTP_ACCEPT_ENCODING"], "gzip") === false) {
                $this->gzipEncode = false;
            }
            $this->__model = new ResponseModel(
                IMG_ROOT,
                URL_IMG,
                IMG_JSON,
                ERROR_JSON,
                IMG_PREFIX,
                IMG_SIZES
            );
            $data = $this->__model->getResponse();
            if (empty($data)) {
                $this->_error(500, "No response data.");
            } else {
                $this->__response($data);
            }
        } catch (Exception $e) {
            $this->_error();
        }
    }

    private function __response($data)
    {
        header("Content-Type: application/json");
        $body = json_encode($data,
            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES |
            JSON_PRESERVE_ZERO_FRACTION |
            JSON_NUMERIC_CHECK
        );
        if ($this->gzipEncode) {
            if ($gz = gzencode($body)) {
                $body = $gz;
                header("Content-Encoding: gzip");
            }
        }
        header("Content-Length: " . strlen($body));
        echo $body;
    }
}