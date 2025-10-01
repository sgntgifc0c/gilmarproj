<?php

declare(strict_types=1);

require_once "./vendor/autoload.php";

use Henbc\Gilmarproj\App;
use Henbc\Gilmarproj\DotEnv;

define("ROOT_PATH", dirname(__DIR__));

DotEnv::load(ROOT_PATH . "/.env");

$app = new App();

echo $app->run();
