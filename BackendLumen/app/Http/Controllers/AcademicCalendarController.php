<?php

namespace App\Http\Controllers;

use App\Models\AcademicCalendar;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AcademicCalendarController extends Controller
{
    public function index()
    {
        $agendas = AcademicCalendar::orderBy('event_date', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $agendas
        ]);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'type' => 'required|string|in:kegiatan,libur,ujian'
        ]);

        $agenda = AcademicCalendar::create($request->all());

        // AUTO-TRIGGER: Create News/Announcement via AI
        $eventDate = Carbon::parse($agenda->event_date);
        if ($eventDate->isFuture() || $eventDate->isToday()) {
            $aiService = new \App\Services\OpenRouterService();
            $content = $aiService->generateAgendaAnnouncement(
                $agenda->title, 
                $agenda->description ?? '', 
                $eventDate->isoFormat('D MMMM YYYY')
            );

            \App\Models\News::create([
                'title' => $agenda->title,
                'slug' => \Illuminate\Support\Str::slug($agenda->title . ' ' . time()),
                'content' => $content,
                'category' => 'Pengumuman',
                'author' => 'Sistem AI',
                'published_at' => \Carbon\Carbon::now(),
            ]);


        }

        return response()->json([
            'status' => 'success',
            'message' => 'Agenda berhasil ditambahkan',
            'data' => $agenda
        ], 201);
    }

    public function show($id)
    {
        $agenda = AcademicCalendar::findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $agenda
        ]);
    }

    public function update(Request $request, $id)
    {
        $agenda = AcademicCalendar::findOrFail($id);

        $this->validate($request, [
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'date',
            'type' => 'string|in:kegiatan,libur,ujian'
        ]);

        $agenda->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Agenda berhasil diupdate',
            'data' => $agenda
        ]);
    }

    public function destroy($id)
    {
        $agenda = AcademicCalendar::findOrFail($id);
        $agenda->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Agenda berhasil dihapus'
        ]);
    }

    public function bulkDelete(\Illuminate\Http\Request $request)
    {
        $ids = $request->input('ids', []);
        $deleted = 0;
        foreach ($ids as $id) {
            try {
                $this->destroy($id);
                $deleted++;
            } catch (\Exception $e) {
                // skip
            }
        }
        return response()->json(['message' => "$deleted data berhasil dihapus"]);
    }

}
