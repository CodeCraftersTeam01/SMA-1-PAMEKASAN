<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StorageController extends Controller
{
    /**
     * Serve an uploaded file from the "public" disk through a route,
     * so we don't depend on `php artisan storage:link`.
     *
     * GET /storage/{path}
     */
    public function show($path)
    {
        // Prevent directory traversal
        if (str_contains($path, '..')) {
            abort(404);
        }

        $disk = Storage::disk('public');

        if (!$disk->exists($path)) {
            abort(404);
        }

        $fullPath = $disk->path($path);
        $mime = $disk->mimeType($path) ?: 'application/octet-stream';

        $response = new BinaryFileResponse($fullPath);
        $response->headers->set('Content-Type', $mime);
        $response->headers->set('Cache-Control', 'public, max-age=31536000');

        return $response;
    }
}
