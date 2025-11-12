<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\App\Middleware;

use Henbc\Gilmarproj\Framework\MiddlewareInterface;
use Henbc\Gilmarproj\Framework\Request;
use Henbc\Gilmarproj\Framework\RequestHandlerInterface;
use Henbc\Gilmarproj\Framework\Response;
use Henbc\Gilmarproj\App\Exceptions\CSRFTokenInvalidException;

class CSRFMiddleware implements MiddlewareInterface
{
    protected const string CSRF_TOKEN_NAME = "CSRF_TOKEN";

    public function process(
        Request $request,
        RequestHandlerInterface $next,
    ): Response {
        $currentToken =
            $request->sessions->getSession($this::CSRF_TOKEN_NAME) ?? "";
        $postedToken = $request->post[$this::CSRF_TOKEN_NAME] ?? "";

        if ($request->method == "GET" && $currentToken == "") {
            $newToken = $this->generateToken();
            $request->sessions->setSession("CSRF_TOKEN", $newToken);
        }

        if ($request->method == "POST") {
            if ($currentToken == "") {
                throw new CSRFTokenInvalidException(
                    "Session Token not registered!",
                );
            }
            if ($postedToken == "") {
                throw new CSRFTokenInvalidException(
                    "Session Token not posted!",
                );
            }
            if (!hash_equals($currentToken, $postedToken)) {
                throw new CSRFTokenInvalidException(
                    "Posted Token not valid with Session Token",
                );
            }
        }

        return $next->handle($request);
    }

    private function generateToken(): string
    {
        return bin2hex(random_bytes(32));
    }
}
