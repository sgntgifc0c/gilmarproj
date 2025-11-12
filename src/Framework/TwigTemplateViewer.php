<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\Framework;

use Henbc\Gilmarproj\Framework\TemplateViewerInterface;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;

class TwigTemplateViewer implements TemplateViewerInterface {
    public function render(string $template, array $data = []): string
    {
        $twigloader = new FilesystemLoader(ROOT_PATH . "/views");
        $twig = new Environment($twigloader, [
            'cache' => ROOT_PATH . "/cache/twig"
        ]);

        $compiled_template = $twig->load($template);
        

        return $compiled_template->render($data);
    }
}