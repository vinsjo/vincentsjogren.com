<?php
declare (strict_types = 1);

define("RESOPT_DEBUG", 101);

class ResponseModel extends FileHandler
{
    /**
     * Path to image directory
     *
     * @var string
     */
    public $imgDir;
    /**
     * Url to the public image root directory
     *
     * @var string
     */
    public $imgUrlRoot;
    /**
     * Path to JSON output file
     *
     * @var string
     */
    public $jsonImgPath;
    /**
     * Path to JSON error log
     *
     * @var string
     */
    public $jsonErrorPath;
    /**
     * Image Sizes as assoc array with key as image suffix
     * and value as max-length in pixels
     *
     * @var array
     */
    public $imgSizes;
    /**
     * Prefix in image filenames, removed from output to save some bytes.
     *
     * @var string
     */
    public $imgPrefix;
    /**
     * Array containing valid image extensions (currently only "jpg")
     *
     * @var array
     */
    public $imgExtensions = ["jpg"];
    /**
     * 2-dimensional array where Exceptions are stored as arrays with the keys
     * "time", "code" and "message"
     *
     * @var array
     */
    public $error = [];

    private $__opt = [
        RESOPT_DEBUG => false,
    ];

    public function __construct(
        string $imgDir,
        string $imgUrlRoot,
        string $jsonImgPath,
        string $jsonErrorPath,
        string $imgPrefix,
        array $imgSizes = [],
        array $options = []
    ) {
        $this->imgDir        = $imgDir;
        $this->imgUrlRoot    = $imgUrlRoot;
        $this->jsonImgPath   = $jsonImgPath;
        $this->jsonErrorPath = $jsonErrorPath;
        $this->imgPrefix     = $imgPrefix;
        $this->imgSizes      = $imgSizes;
        if (!empty($options)) {
            $this->setopt_array($options);
        }
    }

    public function getResponse()
    {
        try {
            $response = [];
            $data     = $this->__getImagesFromJson();
            if (!empty($data)) {
                $img_sizes = [];
                foreach ($this->imgSizes as $key => $value) {
                    $img_sizes[] = ["key" => $key, "value" => $value];
                }
                $response["result"] = [
                    "updated_at"   => $data["updated_at"],
                    "img_base_url" => $this->imgUrlRoot,
                    "img_prefix"   => $this->imgPrefix,
                    "img_sizes"    => $img_sizes,
                    "img_files"    => $data["images"],
                ];
                $response["status"] = "OK";
            } else {
                $response["status"] = "EMPTY_RESULT";
            }

        } catch (Exception $e) {
            $this->__setError($e);
        } finally {
            if ($response["status"] !== "OK") {
                if (!empty($this->error)) {
                    if (!isset($response["status"])) {
                        $response["status"] = "ERROR";
                    }
                    if ($this->__opt[RESOPT_DEBUG]) {
                        $response["error"] = $this->error;
                    }
                }
            }
            return $response;
        }
    }

    public function setopt(int $key, $value)
    {
        if (key_exists($key, $this->__opt)) {
            $this->__opt[$key] = boolval($value);
        }
    }

    public function setopt_array(array $arr)
    {
        foreach ($arr as $key => $value) {
            $this->setopt(intval($key), $value);
        }
    }

    public function error()
    {
        try {
            if (empty($this->error)) {
                return false;
            }
            return $this->error;
        } catch (Exception $e) {
            return ["code" => $e->getCode(), "message" => $e->getMessage()];
        }
    }

    private function __getImagesFromJson(bool $updateOnEmpty = true)
    {
        try {
            $data = $this->__getJsonContent($this->jsonImgPath);
            if ($data === false) {
                $data = [];
            }
            if (
                isset($data["updated_at"]) &&
                isset($data["images"]) &&
                is_array($data["images"])
            ) {
                $lastMod       = filemtime($this->imgDir);
                $jsonTimestamp = strtotime($data["updated_at"]);
                if ($lastMod > $jsonTimestamp) {
                    $data = [];
                }
            }
            if (empty($data) && $updateOnEmpty) {
                $this->__updateImgJson();
                return $this->__getImagesFromJson(false);
            }
            return $data;
        } catch (Exception $e) {
            $this->__setError($e);
            return [];
        }
    }

    private function __updateImgJson()
    {
        if ($data = $this->__getImagesFromFiles()) {
            return $this->__storeJsonContent($this->jsonImgPath, $data);
        }
        return false;
    }

    private function __updateErrorJson()
    {
        if (!empty($this->error)) {
            return $this->__storeJsonContent(
                $this->jsonErrorPath,
                $this->error
            );
        }
        return false;
    }

    private function __getJsonContent(string $path, bool $assoc = true)
    {
        try {
            if (file_exists($path)) {
                if ($json = file_get_contents($path)) {
                    return json_decode($json, $assoc);
                }
                throw new Exception("Failed getting contents of JSON-file");
            }
            return false;
        } catch (Exception $e) {
            $this->__setError($e);
            return false;
        }
    }

    private function __storeJsonContent(string $path, array $data, $flags = 0)
    {
        try {
            if ($json = json_encode($data, JSON_THROW_ON_ERROR)) {
                if (file_put_contents($path, $json, $flags)) {
                    return true;
                }
                throw new Exception("Failed saving JSON-file");
            }
            throw new Exception("Failed encoding data to JSON-format.");
        } catch (Exception $e) {
            $this->__setError($e);
            return false;
        }
    }
    private function __getImagesFromFiles()
    {
        try {
            $extraSuffixes  = array_keys($this->imgSizes);
            $requiredSuffix = "";
            if (isset($extraSuffixes[0])) {
                $requiredSuffix = $extraSuffixes[0];
                unset($extraSuffixes[0]);
            }
            $files = self::getFilesInDir(
                $this->imgDir,
                $this->imgExtensions,
                [$this->imgPrefix, $requiredSuffix],
                $extraSuffixes
            );
            return $this->__parseImageFileInfo(
                $files,
                $this->imgPrefix,
                $requiredSuffix,
                $extraSuffixes);
        } catch (Exception $e) {
            $this->__setError($e);
            return [];
        }
    }
    private function __parseImageFileInfo(
        array $files,
        string $imgPrefix,
        string $imgSuffix,
        array $requiredSuffixes = []
    ) {
        try {
            if (empty($files)) {
                return [];
            }
            $output = [];
            foreach ($files as $path) {
                if (!is_string($path) || !file_exists($path)) {
                    continue;
                }
                $file = new SplFileInfo($path);
                $ext  = $file->getExtension();
                $name = $file->getBasename(".{$ext}");

                if (!empty($imgPrefix)) {
                    $name = removePrefix($name, $imgPrefix);
                }
                if (!empty($imgSuffix)) {
                    $name = removeSuffix($name, $imgSuffix);
                }
                if (!empty($requiredSuffixes)) {
                    $dir = $file->getPath();
                    foreach ($requiredSuffixes as $suffix) {
                        $current = "{$dir}/{$imgPrefix}{$name}{$suffix}.{$ext}";
                        if (!file_exists($current)) {
                            continue 2;
                        }
                    }
                }
                list($width, $height) = getimagesize($path);
                $images[]             = [
                    "name"  => $name,
                    "ext"   => $ext,
                    "ls"    => $width > $height ? true : false,
                    "ratio" => "" . round(max($width, $height) / min($width, $height), 2),
                ];
            }
            usort($images, function ($a, $b) {
                return strcmp($a["name"], $b["name"]);
            });
        } catch (Exception $e) {
            $this->__setError($e);
        } finally {
            if (!empty($images)) {
                $output["updated_at"] = date(JSON_TIME_FORMAT);
                $output["images"]     = $images;
            }
            return $output;
        }
    }
    private function __setError(Exception $e)
    {
        $error = [
            "time"    => date(JSON_TIME_FORMAT),
            "code"    => $e->getCode(),
            "message" => $e->getMessage(),
        ];
        $this->error[] = $error;
        $this->__updateErrorJson();
        if ($this->__opt[RESOPT_DEBUG]) {
            $this->__printError($error);
        }
    }
    private function __printError($e)
    {
        $style = [
            "div"    => 'font-family: Arial, Helvetica, sans-serif;'
            . 'width:fit-content;max-width:95vw;height:fit-content;'
            . 'padding:50px;margin:10vh auto;',
            "header" => 'padding:10px 0;',
            "table"  => 'width:100%;text-align:left;border-collapse:collapse;',
            "td"     => 'border:1px solid #ddd;padding:10px 20px;',
        ];
        $output =
            "\n<div style=\"{$style["div"]}\">\n"
            . "\t<h3 style\"{$style["header"]}\">RESPONSE ERROR:</h3>\n"
            . "\t<table style=\"{$style["table"]}\">\n";
        if ($e instanceof Exception) {
            $e = ["code" => $e->getCode(), "message" => $e->getMessage()];
        }
        if (is_array($e)) {
            foreach ($e as $key => $value) {
                $output .= "\t\t<tr>\n"
                . "\t\t\t<td style=\"{$style["td"]}\"><strong>"
                . htmlentities(strtoupper(strval($key))) . "</strong></td>\n"
                . "\t\t\t<td style=\"{$style["td"]}\">"
                . htmlentities(strval($value)) . "</td>\n";
            }
        } else {
            $output .= "\t\t<tr>\n"
            . "\t\t\t<td style=\"{$style["td"]}\">"
            . htmlentities(strval($e)) . "</td>\n";
        }
        echo $output . "\t</table>\n</div>";
    }
}