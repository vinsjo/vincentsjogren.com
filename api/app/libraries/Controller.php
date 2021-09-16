<?php

class Controller
{
    protected function _model(string $model, $args = [])
    {
        try {
            $path = realpath(APP_ROOT . "/models/" . $model . ".php");
            if (!$path) {
                $this->_error();
            }
            require_once $path;
            $class = new ReflectionClass($model);
            return $class->newInstanceArgs($args);
        } catch (Exception $e) {
            $this->_error(500, $e->getCode());
        }
    }

    protected function _getRequestURI()
    {
        if (isset($_GET["uri"])) {
            $uri = rtrim($_GET["uri"], '/');
            $uri = filter_var($uri, FILTER_SANITIZE_URL);
            $uri = strtolower($uri);
            $uri = explode("/", $uri);
            return $uri;
        }
        return [];
    }

    protected function _error(int $code = 500, string $reason = "")
    {
        if (!defined("ERROR_CODES_HTTP") || !key_exists($code, ERROR_CODES_HTTP)) {
            $code = 500;
            $msg  = "Internal Server Error";
        } else {
            $msg = ERROR_CODES_HTTP[$code];
            if (!empty($reason)) {
                $msg .= " - " . filter_var($reason, FILTER_SANITIZE_STRING);
            }
        }
        header("HTTP/1.1 {$code} {$msg}");
        exit;
    }
}