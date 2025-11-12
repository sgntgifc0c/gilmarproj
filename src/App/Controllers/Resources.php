<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\App\Controllers;

use Henbc\Gilmarproj\Framework\Controller;
use Henbc\Gilmarproj\Framework\Exceptions\PageNotFoundException;
use Henbc\Gilmarproj\Framework\Response;

class Resources extends Controller
{
    public function index(string $filename): Response
    {
        $filepath = ROOT_PATH . "/resources/" . $filename;

        if (
            $filename == "" || // Verifica se o parametro ta vazio
            str_contains($filename, "..") || // Verifica se não é uma tentativa de ler arquivos do servidor
            !file_exists($filepath) // Verifica se o arquivo existe
        ) {
            throw new PageNotFoundException("Resource empty!");
        }

        $fullfile = file_get_contents($filepath);

        $resp = new Response();
        $resp->setBody($fullfile);

        switch (pathinfo($filename, PATHINFO_EXTENSION)) {
            case "css":
                $resp->addHeader("Content-Type: text/css");
                break;
            case "js":
                $resp->addHeader("Content-Type: text/javascript");
                break;
        }

        return $resp;
    }
}
