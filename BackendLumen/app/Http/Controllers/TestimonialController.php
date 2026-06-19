<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    /**
     * PUBLIC: Get approved testimonials
     */
    public function getPublicTestimonials()
    {
        $testimonials = Testimonial::select('id', 'name', 'message', 'role', 'avatar_url', 'graduation_year', 'current_occupation')
            ->where('status', 'approved')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $testimonials
        ])
        ->header('Cache-Control', "public, max-age=300, stale-while-revalidate=60")
        ->header('Vary', 'Accept');
    }

    /**
     * PUBLIC: Submit a new testimonial
     */
    public function submitPublicTestimonial(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'role' => 'required|in:alumni,siswa,orangtua',
            'message' => 'required|string',
            'graduation_year' => 'nullable|integer',
            'current_occupation' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048'
        ]);

        $data = $request->except(['image', 'status']);
        
        // SECURE LOGIC: Force status to pending for public submission
        $data['status'] = 'pending';

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(base_path('public/uploads/testimonials'), $filename);
            $data['avatar_url'] = '/uploads/testimonials/' . $filename;
        }

        $testimonial = Testimonial::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Testimonial berhasil dikirim! Menunggu persetujuan admin.',
            'data' => $testimonial
        ], 201);
    }

    /**
     * ADMIN: Get all testimonials
     */
    public function index()
    {
        $testimonials = Testimonial::orderBy('created_at', 'desc')->get();
        return response()->json($testimonials);
    }

    /**
     * ADMIN: Show specific testimonial
     */
    public function show($id)
    {
        $testimonial = Testimonial::findOrFail($id);
        return response()->json($testimonial);
    }

    /**
     * ADMIN: Store new testimonial
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'role' => 'required|in:alumni,siswa,orangtua',
            'message' => 'required|string',
            'status' => 'required|in:pending,approved',
            'graduation_year' => 'nullable|integer',
            'current_occupation' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048'
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(base_path('public/uploads/testimonials'), $filename);
            $data['avatar_url'] = '/uploads/testimonials/' . $filename;
        }

        $testimonial = Testimonial::create($data);

        return response()->json($testimonial, 201);
    }

    /**
     * ADMIN: Update testimonial
     */
    public function update(Request $request, $id)
    {
        $testimonial = Testimonial::findOrFail($id);

        $this->validate($request, [
            'name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|in:alumni,siswa,orangtua',
            'message' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:pending,approved',
            'graduation_year' => 'nullable|integer',
            'current_occupation' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048'
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(base_path('public/uploads/testimonials'), $filename);
            $data['avatar_url'] = '/uploads/testimonials/' . $filename;
        }

        $testimonial->update($data);

        return response()->json($testimonial);
    }

    /**
     * ADMIN: Destroy testimonial
     */
    public function destroy($id)
    {
        $testimonial = Testimonial::findOrFail($id);
        $testimonial->delete();

        return response()->json(['message' => 'Testimonial deleted successfully']);
    }

    /**
     * ADMIN: Toggle Status quickly
     */
    public function toggleStatus($id)
    {
        $testimonial = Testimonial::findOrFail($id);
        $testimonial->status = $testimonial->status === 'approved' ? 'pending' : 'approved';
        $testimonial->save();

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'status' => $testimonial->status
        ], 200);
    }
}
