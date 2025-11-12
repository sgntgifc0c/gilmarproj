<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\Framework;

use Henbc\Gilmarproj\Framework\Sessions;
use Henbc\Gilmarproj\Framework\Cookies;

class Request
{
    public function __construct(
        public string $uri,
        public string $method,
        public array $get,
        public array $post,
        public array $files,
        public Cookies $cookies,
        public array $server,
        public Sessions $sessions,
        public string $requestBody,
    ) {}

    public static function createFromGlobals(): Request
    {
        return new static(
            $_SERVER["REQUEST_URI"],
            $_SERVER["REQUEST_METHOD"],
            $_GET,
            $_POST,
            $_FILES,
            new Cookies(),
            $_SERVER,
            new Sessions(),
            file_get_contents("php://input"),
        );
    }
}
