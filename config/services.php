<?php

$container = new Henbc\Gilmarproj\Framework\Container;

// Database example
$container->set(Henbc\Gilmarproj\Framework\Database::class, function() {

    return new Henbc\Gilmarproj\Framework\Database($_ENV["DB_SQLSERVER"] ,$_ENV["DB_HOST"], $_ENV["DB_NAME"], $_ENV["DB_USER"], $_ENV["DB_PASSWORD"], $_ENV["DB_PORT"]);

});

// Viewer example
$container->set(Henbc\Gilmarproj\Framework\TemplateViewerInterface::class, function() {

    return new Henbc\Gilmarproj\Framework\TwigTemplateViewer;

});

return $container;