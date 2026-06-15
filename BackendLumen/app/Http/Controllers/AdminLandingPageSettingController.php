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

        $data = $request->except(['hero_image', 'headmaster_photo']);

        if ($request->hasFile('hero_image')) {
            if ($setting->hero_image) {
                Storage::disk('public')->delete($setting->hero_image);
            }
            $data['hero_image'] = $request->file('hero_image')->store('settings', 'public');
        }

        if ($request->hasFile('headmaster_photo')) {
            if ($setting->headmaster_photo) {
                Storage::disk('public')->delete($setting->headmaster_photo);
            }
            $data['headmaster_photo'] = $request->file('headmaster_photo')->store('settings', 'public');
        }

        $setting->fill($data);
        $setting->save();

        return response()->json(['message' => 'Settings updated successfully', 'data' => $setting]);
    }
}
