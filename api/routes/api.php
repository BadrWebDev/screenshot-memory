<?php

use App\Http\Controllers\ScreenshotController;
use Illuminate\Support\Facades\Route;

Route::get('/screenshots', [ScreenshotController::class, 'index']);
Route::post('/screenshots', [ScreenshotController::class, 'store']);
Route::get('/screenshots/{screenshot}', [ScreenshotController::class, 'show']);
Route::delete('/screenshots/{screenshot}', [ScreenshotController::class, 'destroy']);