<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\App\Controllers;

use Henbc\Gilmarproj\Framework\Controller;
use Henbc\Gilmarproj\App\Models\Prompt;
use Henbc\Gilmarproj\Framework\Response;

class Promptman extends Controller
{
    public function index(): Response
    {
        $prompt = new Prompt();
        $resp = new Response();

        $jsonrequest = json_decode($this->request->requestBody);

        $prompt->processPrompt($jsonrequest->request);

        $resp->addHeader("Content-Type: application/json");
        $resp->setBody(json_encode($prompt->finalPostedResponse));
        return $resp;
    }
}
