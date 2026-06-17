<?php

namespace App\Http\Controllers;

use App\Models\TeacherQuote;
use Illuminate\Http\Request;

class TeacherQuoteController extends Controller
{
    public function index()
    {
        $quotes = TeacherQuote::orderBy('created_at', 'desc')->get();
        return response()->json($quotes);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'teacher_name' => 'required|string|max:255',
            'quote' => 'required|string',
            'is_active' => 'boolean'
        ]);

        $quote = TeacherQuote::create([
            'teacher_name' => $request->input('teacher_name'),
            'quote' => $request->input('quote'),
            'is_active' => $request->input('is_active', true)
        ]);

        return response()->json(['message' => 'Kata-kata guru berhasil ditambahkan.', 'data' => $quote], 201);
    }

    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'teacher_name' => 'sometimes|string|max:255',
            'quote' => 'sometimes|string',
            'is_active' => 'boolean'
        ]);

        $quote = TeacherQuote::find($id);
        if (!$quote) return response()->json(['message' => 'Kata-kata tidak ditemukan'], 404);

        $quote->update($request->only(['teacher_name', 'quote', 'is_active']));

        return response()->json(['message' => 'Kata-kata guru berhasil diperbarui.', 'data' => $quote]);
    }

    public function destroy($id)
    {
        $quote = TeacherQuote::find($id);
        if (!$quote) return response()->json(['message' => 'Kata-kata tidak ditemukan'], 404);

        $quote->delete();
        return response()->json(['message' => 'Kata-kata guru berhasil dihapus.']);
    }

    // Public Endpoint
    public function getRandomQuote()
    {
        $quote = TeacherQuote::where('is_active', true)->inRandomOrder()->first();
        if (!$quote) {
            return response()->json([
                'teacher_name' => 'Tim Pengajar SMAN 1 Pamekasan',
                'quote' => 'Pendidikan adalah senjata paling ampuh yang bisa Anda gunakan untuk mengubah dunia.'
            ]); // Default quote if none exists
        }
        return response()->json($quote);
    }
}
