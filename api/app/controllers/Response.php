<?php
declare (strict_types = 1);

class Response extends Controller
{
    private $__model;
    public function __construct()
    {
        try {
            if ($_SERVER["HTTP_SEC_FETCH_SITE"] !== "same-origin"
            ) {
                //$this->_error(403);
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
        $json = json_encode($data,
            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES |
            JSON_PRESERVE_ZERO_FRACTION |
            JSON_NUMERIC_CHECK
        );
        header("Content-Type: application/json");
        header("Content-Length: " . strlen($json));
        echo $json;
    }
}