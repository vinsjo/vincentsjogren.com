<?php
declare (strict_types = 1);

class Response extends Controller {
    private $model;
    public $gzipEncode = true;
    public function __construct() {
        try {
            if ($_SERVER["HTTP_SEC_FETCH_SITE"] !== "same-origin"
            ) {
                //$this->_error(403);
            }
            if (!isset($_SERVER["HTTP_ACCEPT_ENCODING"]) ||
                strpos($_SERVER["HTTP_ACCEPT_ENCODING"], "gzip") === false) {
                $this->gzipEncode = false;
            }
            $this->model = new ResponseModel(
                IMG_ROOT,
                URL_IMG,
                IMG_JSON,
                ERROR_JSON,
                IMG_PREFIX,
                IMG_SIZES
            );
            $data = $this->model->getResponse();
            if (empty($data)) {
                $this->error(500, "No response data.");
            } else {
                $this->response($data);
            }
        } catch (Exception $e) {
            $this->error();
        }
    }

    private function response($data) {
        $body = json_encode($data,
            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES |
            JSON_PRESERVE_ZERO_FRACTION |
            JSON_NUMERIC_CHECK
        );
        cors();
        if ($this->gzipEncode) {
            if ($gz = gzencode($body)) {
                $body = $gz;
                header("Content-Encoding: gzip");
            }
        }

        header("Content-Length: " . strlen($body));
        header("Content-Type: application/json");

        echo $body;
    }
}