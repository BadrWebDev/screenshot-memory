<?php

namespace App\Http\Controllers;

use App\Models\Screenshot;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ScreenshotController extends Controller
{
    protected GeminiService $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    public function index()
    {
        return response()->json(
            Screenshot::latest()->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240',
        ]);

        $file = $request->file('image');
        $base64 = base64_encode(file_get_contents($file->getRealPath()));
        $mimeType = $file->getMimeType();

        $path = $file->store('screenshots', 'public');

        $analysis = $this->gemini->analyzeScreenshot($base64, $mimeType);

        $screenshot = Screenshot::create([
            'id'             => Str::uuid(),
            'image_url'      => $path,
            'summary'        => $analysis['summary'] ?? null,
            'category'       => $analysis['category'] ?? 'Other',
            'extracted_text' => $analysis['extracted_text'] ?? null,
            'tags'           => $analysis['tags'] ?? [],
        ]);

        return response()->json($screenshot, 201);
    }

    public function show(Screenshot $screenshot)
    {
        return response()->json($screenshot);
    }

    public function destroy(Screenshot $screenshot)
    {
        $screenshot->delete();
        return response()->json(['message' => 'Deleted']);
    }
}