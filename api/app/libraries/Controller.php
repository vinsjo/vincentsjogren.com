<?php

class Controller {
    protected function setModel(string $model, $args = []) {
        try {
            $path = realpath(APP_ROOT . "/models/" . $model . ".php");
            if (!$path) {
                $this->error();
            }
            require_once $path;
            $class = new ReflectionClass($model);
            return $class->newInstanceArgs($args);
        } catch (Exception $e) {
            $this->error(500, $e->getCode());
        }
    }

    protected function getRequestURI() {
        if (isset($_GET["uri"])) {
            $uri = rtrim($_GET["uri"], '/');
            $uri = filter_var($uri, FILTER_SANITIZE_URL);
            $uri = strtolower($uri);
            $uri = explode("/", $uri);
            return $uri;
        }
        return [];
    }

    protected function error() {
        header("HTTP/1.1 500 - Internal Server Error");
        exit;
    }
}