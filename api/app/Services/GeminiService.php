<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    protected string $apiKey;
    protected string $apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
    }

    public function analyzeScreenshot(string $imageBase64, string $mimeType = 'image/jpeg'): array
    {
        $prompt = "Analyze this screenshot and return ONLY a valid JSON object with no extra text, no markdown, no backticks. The JSON must have exactly these keys:
- summary: one sentence describing what this screenshot is about
- category: one of [Shopping, Food, Places, Recipes, Finance, Quotes, Social, Other]
- extracted_text: all visible text in the image combined into one string
- tags: array of 3 to 5 relevant keywords";

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
        ])->post($this->apiUrl, [
            'model' => 'nvidia/nemotron-nano-12b-v2-vl:free',
            'messages' => [[
                'role' => 'user',
                'content' => [
                    ['type' => 'text', 'text' => $prompt],
                    ['type' => 'image_url', 'image_url' => [
                        'url' => 'data:' . $mimeType . ';base64,' . $imageBase64
                    ]]
                ]
            ]]
        ]);

        $text = $response->json('choices.0.message.content');
        \Log::info('OpenRouter response: ' . json_encode($response->json()));
        return json_decode($text, true) ?? [];
    }
}