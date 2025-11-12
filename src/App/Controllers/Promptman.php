<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\App\Controllers;

use Henbc\Gilmarproj\Framework\Controller;
use Henbc\Gilmarproj\App\Models\Prompt;
use Henbc\Gilmarproj\Framework\Response;

class Promptman extends Controller
{
    public function __construct(private Prompt $prompt) {}

    public function index(): Response
    {
        $resp = new Response();

        $jsonrequest = json_decode($this->request->requestBody);

        $this->prompt->processPrompt($jsonrequest->request);
        $this->prompt->salvarPrompt();

        $resp->addHeader("Content-Type: application/json");
        $resp->setBody(json_encode($this->prompt->finalPostedResponse));
        return $resp;
    }
}
