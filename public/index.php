<?php

declare(strict_types=1);

require_once "./vendor/autoload.php";

use Henbc\Gilmarproj\Framework\Dotenv;

define("ROOT_PATH", dirname(__DIR__));

Dotenv::load(ROOT_PATH . "/.env");

set_error_handler("Henbc\Gilmarproj\App\CustomErrorHandler::handleError");

set_exception_handler(
    "Henbc\Gilmarproj\App\CustomErrorHandler::handleException",
);

$router = require ROOT_PATH . "/config/routes.php";

$container = require ROOT_PATH . "/config/services.php";

$middleware = require ROOT_PATH . "/config/middleware.php";

$dispatcher = new Henbc\Gilmarproj\Framework\Dispatcher(
    $router,
    $container,
    $middleware,
    "Henbc\\Gilmarproj\\App",
);

$request = Henbc\Gilmarproj\Framework\Request::createFromGlobals();

$response = $dispatcher->handle($request);

$response->send();
