<?php
declare (strict_types = 1);

class FileHandler
{
    public static function getFilesInDir(
        string $path,
        array $extensions = [],
        array $require = [],
        array $exclude = [],
        bool $skipDots = true
    ) {
        if (!is_dir($path)) {
            if (realpath($path)) {
                $path = realpath($path);
            } else {
                return [];
            }
        }
        $files    = [];
        $iterator = new FilesystemIterator($path);
        foreach ($iterator as $file) {
            if ($file->isDir() ||
                ($skipDots && substr($file->getBasename(), 0, 1) === ".")) {
                continue;
            }
            if (!empty($require)) {
                $in_filename = false;
                foreach ($require as $value) {
                    if (!is_string($value) || empty($value)) {
                        continue;
                    }
                    if (strpos($file->getFilename(), $value) !== false) {
                        $in_filename = true;
                        break;
                    }
                }
                if (!$in_filename) {
                    continue;
                }
            }
            if (!empty($exclude)) {
                foreach ($exclude as $value) {
                    if (strpos($file->getFilename(), $value) !== false) {
                        continue 2;
                    }
                }
            }
            if (!empty($extensions)) {
                if (!in_array($file->getExtension(), $extensions)) {
                    continue;
                }
            }
            $files[] = $file->getRealPath();
        }
        return $files;
    }
}