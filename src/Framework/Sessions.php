<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\Framework;

class Sessions
{
    public function __construct()
    {
        $this->init();
    }

    public function init(): void
    {
        session_start();
    }

    public function close(): void
    {
        session_destroy();
    }

    public function getSession(string $name): string|null
    {
        return $_SESSION[$name] ?? null;
    }

    public function setSession(string $name, string $value): void
    {
        $_SESSION[$name] = $value;
    }
}
