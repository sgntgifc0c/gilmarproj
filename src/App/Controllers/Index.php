<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\App\Controllers;

use Henbc\Gilmarproj\Framework\Controller;
use Henbc\Gilmarproj\Framework\Response;

class Index extends Controller
{
    public function index(): Response
    {
        return $this->view("index.html.twig", [
            "csrf_token" => $this->request->sessions->getSession("CSRF_TOKEN"),
        ]);
    }
}
