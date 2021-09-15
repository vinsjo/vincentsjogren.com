<?php
declare (strict_types = 1);

class Response extends Controller
{
    protected $_model;
    public function __construct()
    {
        try {
            if ($_SERVER["HTTP_SEC_FETCH_SITE"] !== "same-origin"
            ) {
                //$this->_error(403);
            }
            $uri          = $this->_getRequestURI();
            $this->_model = new ResponseModel(
                IMG_ROOT,
                URL_IMG,
                IMG_JSON,
                ERROR_JSON,
                IMG_PREFIX,
                IMG_SIZES
            );
            $this->__response();
        } catch (Exception $e) {
            $this->_error();
        }
    }

    private function __response()
    {
        $response = $this->_model->getResponse();
        if (!empty($response)) {
            $data = ["response" => $response];
            $this->_view("response", $data);
        } else {
            $this->_error();
        }
    }
}