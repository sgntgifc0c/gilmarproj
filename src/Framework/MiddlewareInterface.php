<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\Framework;

interface MiddlewareInterface
{
    public function process(Request $request, RequestHandlerInterface $next): Response;    
}