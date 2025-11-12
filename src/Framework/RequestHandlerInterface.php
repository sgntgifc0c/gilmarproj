<?php

namespace Henbc\Gilmarproj\Framework;

interface RequestHandlerInterface
{
    public function handle(Request $request): Response;
}