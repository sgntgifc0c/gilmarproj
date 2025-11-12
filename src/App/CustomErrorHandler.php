<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\App;

use Henbc\Gilmarproj\App\Exceptions\CSRFTokenInvalidException;
use Henbc\Gilmarproj\Framework\ErrorHandler;
use Throwable;

class CustomErrorHandler extends ErrorHandler
{
    public static function handleException(Throwable $exception): void
    {
        if ($exception instanceof CSRFTokenInvalidException) {
            $template = "csrf_invalid.php";
        }

        parent::handleException($exception);
    }
}
