<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageHelper
{
    /**
     * Compress an uploaded image and store it.
     *
     * @param UploadedFile $file The uploaded file.
     * @param string $directory The directory to store the file in.
     * @param int $quality The quality of the compressed image (0-100).
     * @return string The path to the stored file.
     */
    public static function compressAndStore(UploadedFile $file, string $directory, int $quality = 75): string
    {
        // Generate a unique filename
        $filename = \Illuminate\Support\Str::random(40) . '.webp';
        $path = $directory . '/' . $filename;

        // Initialize ImageManager with GD driver
        $manager = new ImageManager(new Driver());

        // Read image from UploadedFile
        $image = $manager->read($file->getRealPath());

        // Resize if the image is too large (max width/height 1920)
        $image->scaleDown(1920, 1920);

        // Encode to WebP format with given quality
        $encoded = $image->toWebp($quality);

        // Store the compressed image using Storage facade
        Storage::disk('public')->put($path, $encoded->toString());

        return $path;
    }
}
