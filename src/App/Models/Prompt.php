<?php

declare(strict_types=1);

namespace Henbc\Gilmarproj\App\Models;

use Exception;

class Prompt
{
    public string $promptResult = "";
    public string $unformatedResponse = "";
    public array $finalPostedResponse;

    private mixed $completeResponse;

    public function processPrompt(string $prompt): void
    {
        // Coleta a chave
        $g_api_key = $_ENV["GEMINI_API_KEY"];

        // Link do servidor responsavel da API
        // Este é um servidor "stream" ou seja vai mandar respostas em arquivos JSON divididos até que o Gemini disser que esta pronto.
        $ch = curl_init(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?alt=sse",
        );

        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_POST, 1); // NECESSARIO, indica que iremos mandar uma post request para a API do google.

        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json", // Indica que iremos mandar um arquivo JSON pro Google
            "x-goog-api-key: $g_api_key", // Inserimos nossa chave em uma variavel de cabeçalho HTTP
        ]);

        // Isso seria uma formatação basica do documento JSON que iremos mandar no google
        curl_setopt(
            $ch,
            CURLOPT_POSTFIELDS,
            json_encode([
                "contents" => [
                    [
                        "parts" => [
                            "text" => $prompt,
                        ],
                    ],
                ],
            ]),
        );

        $write_callback = function ($lch, $response) {
            $this->unformatedResponse .= $response;

            return \strlen($response); // Requisito de uma WRTIEFUNCTION do curl
        };

        curl_setopt($ch, CURLOPT_WRITEFUNCTION, $write_callback); // uma função que ira ser chamada toda vez que o curl receber informação

        curl_exec($ch); // executa toda a configuração

        if (curl_error($ch)) {
            $error = curl_error($ch);
            throw new Exception("Curl Error: $error");
        }

        // Por algum motivo o google começa respondendo com "data: "
        // Quebrando a função parse do JSON no JS e json_decode no PHP
        if (str_starts_with($this->unformatedResponse, "data: ")) {
            $this->unformatedResponse = substr($this->unformatedResponse, 6);
        }

        $this->completeResponse = json_decode($this->unformatedResponse);

        $this->formatResponse();
    }

    private function formatResponse(): void
    {
        $formatResp = $this->completeResponse;

        if (property_exists($formatResp, "candidates")) {
            $this->finalPostedResponse = [
                "text" => $formatResp->candidates[0]->content->parts[0]->text,
            ];
        }
    }
}
