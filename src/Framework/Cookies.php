<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\Framework;

use DateInterval;
use DateTime;

class Cookies
{
    public function __construct() {}

    public function getCookie(string $name): string|null
    {
        return $_COOKIE[$name] ?? null;
    }

    public function setCookie(
        string $name,
        string $value,
        string $interval,
    ): void {
        $dt = new DateTime("now");
        $dt->modify($interval);

        setcookie($name, $value, $dt->getTimestamp());
    }
}
