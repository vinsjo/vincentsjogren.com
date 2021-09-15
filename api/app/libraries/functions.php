<?php

function arrayIsAssoc($arr)
{
    return !is_array($arr) ? false :
    !empty(array_diff(array_keys($arr), range(0, count($arr) - 1)));
}

function removeSuffix(string $str, string $suffix)
{
    $offset = strlen($str) - strlen($suffix);
    if (substr($str, $offset, strlen($suffix)) !== $suffix) {
        return $str;
    }
    return substr_replace($str, "", $offset, strlen($suffix));
}

function removePrefix(string $str, string $prefix)
{
    if (substr($str, 0, strlen($prefix)) !== $prefix) {
        return $str;
    }
    return substr_replace($str, "", 0, strlen($prefix));
}