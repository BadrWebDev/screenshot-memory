<?php

use App\Http\Controllers\ScreenshotController;
use Illuminate\Support\Facades\Route;

Route::get('/screenshots', [ScreenshotController::class, 'index']);
Route::post('/screenshots', [ScreenshotController::class, 'store']);
Route::delete('/screenshots/all', [ScreenshotController::class, 'destroyAll']);
Route::get('/screenshots/{screenshot}', [ScreenshotController::class, 'show']);
Route::patch('/screenshots/{screenshot}', [ScreenshotController::class, 'update']);
Route::post('/screenshots/{screenshot}/reanalyze', [ScreenshotController::class, 'reanalyze']);
Route::delete('/screenshots/{screenshot}', [ScreenshotController::class, 'destroy']);