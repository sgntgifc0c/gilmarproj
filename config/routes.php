<?php

$router = new Henbc\Gilmarproj\Framework\Router();

// Homepage example
$router->add("/", [
    "controller" => "Index",
    "action" => "index",
    "middleware" => "csrf",
]);

$router->add("/res/{filename}", [
    "controller" => "Resources",
    "action" => "index",
]);

$router->add("/promptman", [
    "controller" => "PromptMan",
    "action" => "index",
    "method" => "POST",
]);

return $router;
