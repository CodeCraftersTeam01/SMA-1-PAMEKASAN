<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LandingPageSetting;
use Illuminate\Support\Facades\Storage;

class AdminLandingPageSettingController extends Controller
{
    /**
     * Tampilkan setting (selalu ambil ID 1)
     */
    public function index()
    {
        $setting = LandingPageSetting::first();
        return response()->json($setting ?: []);
    }

    /**
     * Update setting (selalu update/create ID 1)
     */
    public function update(Request $request)
    {
        $setting = LandingPageSetting::first();
        if (!$setting) {
            $setting = new LandingPageSetting();
        }

        $data = $request->except(['hero_image', 'headmaster_photo', 'existing_hero_images', 'new_hero_images']);

        if ($request->hasFile('hero_image')) {
            if ($setting->hero_image) {
                Storage::disk('public')->delete($setting->hero_image);
            }
            $data['hero_image'] = \App\Helpers\ImageHelper::compressAndStore($request->file('hero_image'), 'settings');
        }

        // Handle multiple hero images
        $existingImages = $request->input('existing_hero_images', []);
        if (is_string($existingImages)) {
            $existingImages = json_decode($existingImages, true) ?? [];
        }
        
        $heroImages = $existingImages;

        if ($request->hasFile('new_hero_images')) {
            $newFiles = $request->file('new_hero_images');
            if (!is_array($newFiles)) {
                $newFiles = [$newFiles];
            }
            foreach ($newFiles as $file) {
                $heroImages[] = \App\Helpers\ImageHelper::compressAndStore($file, 'settings');
            }
        }

        // Cleanup removed images
        $oldImages = $setting->hero_images ?? [];
        foreach ($oldImages as $oldImage) {
            if (!in_array($oldImage, $existingImages)) {
                Storage::disk('public')->delete($oldImage);
            }
        }
        $data['hero_images'] = $heroImages;

        if ($request->hasFile('headmaster_photo')) {
            if ($setting->headmaster_photo) {
                Storage::disk('public')->delete($setting->headmaster_photo);
            }
            $data['headmaster_photo'] = \App\Helpers\ImageHelper::compressAndStore($request->file('headmaster_photo'), 'settings');
        }

        $setting->fill($data);
        $setting->save();

        return response()->json(['message' => 'Settings updated successfully', 'data' => $setting]);
    }
}
