<?php

namespace App\Http\Controllers;

use App\Models\Screenshot;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $hash = md5_file($file->getRealPath());

        $existing = Screenshot::where('image_hash', $hash)->first();
        if ($existing) {
            return response()->json($existing, 200);
        }

        $base64 = base64_encode(file_get_contents($file->getRealPath()));
        $mimeType = $file->getMimeType();

        $path = $file->store('screenshots', 'public');

        $analysis = $this->gemini->analyzeScreenshot($base64, $mimeType);

        $screenshot = Screenshot::create([
            'id'             => Str::uuid(),
            'image_url'      => $path,
            'image_hash'     => $hash,
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

    public function destroyAll()
    {
        $screenshots = Screenshot::all();

        foreach ($screenshots as $screenshot) {
            if ($screenshot->image_url) {
                Storage::disk('public')->delete($screenshot->image_url);
            }
        }

        Screenshot::query()->delete();

        return response()->json(['message' => 'Deleted all']);
    }

    public function update(Request $request, Screenshot $screenshot)
    {
        $data = $request->validate([
            'tags' => 'sometimes',
            'summary' => 'sometimes|string|nullable',
        ]);

        if (array_key_exists('tags', $data)) {
            $tags = $data['tags'];
            if (is_string($tags)) {
                $tags = array_filter(array_map('trim', explode(',', $tags)));
            }
            if (!is_array($tags)) {
                $tags = [];
            }
            $data['tags'] = array_values($tags);
        }

        $screenshot->fill($data);
        $screenshot->save();

        return response()->json($screenshot);
    }

    public function reanalyze(Screenshot $screenshot)
    {
        $path = Storage::disk('public')->path($screenshot->image_url);
        if (!file_exists($path)) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        $base64 = base64_encode(file_get_contents($path));
        $mimeType = mime_content_type($path) ?: 'image/jpeg';

        $analysis = $this->gemini->analyzeScreenshot($base64, $mimeType);

        $screenshot->update([
            'summary' => $analysis['summary'] ?? $screenshot->summary,
            'category' => $analysis['category'] ?? $screenshot->category,
            'extracted_text' => $analysis['extracted_text'] ?? $screenshot->extracted_text,
            'tags' => $analysis['tags'] ?? $screenshot->tags,
        ]);

        return response()->json($screenshot->fresh());
    }
}