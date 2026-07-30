<?php

namespace Tests;

use App\Models\News;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class NewsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        putenv('API_KEY=smansa-test-key');
        $this->artisan('migrate:fresh');
    }

    public function test_admin_can_update_news_category()
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        $news = News::create([
            'title' => 'Berita Sekolah A',
            'slug' => 'berita-sekolah-a',
            'excerpt' => 'Excerpt...',
            'content' => 'Content...',
            'category' => 'Berita Sekolah',
            'published_at' => \Carbon\Carbon::now()
        ]);

        // Simulating the frontend PUT request
        $response = $this->actingAs($admin)->put("/api/admin/news/{$news->id}", [
            'title' => 'Berita Sekolah A (Updated)',
            'content' => 'Content updated...',
            'category' => 'Kegiatan Siswa'
        ]);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'id' => $news->id,
            'category' => 'Kegiatan Siswa'
        ]);
    }

    public function test_admin_can_update_news_category_via_spoofed_post()
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        $news = News::create([
            'title' => 'Berita Sekolah A',
            'slug' => 'berita-sekolah-a',
            'excerpt' => 'Excerpt...',
            'content' => 'Content...',
            'category' => 'Berita Sekolah',
            'published_at' => \Carbon\Carbon::now()
        ]);

        // Simulating the frontend spoofed POST request
        $response = $this->actingAs($admin)->post("/api/admin/news/{$news->id}", [
            '_method' => 'PUT',
            'title' => 'Berita Sekolah A (Updated)',
            'content' => 'Content updated...',
            'category' => 'Kegiatan Siswa'
        ]);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'id' => $news->id,
            'category' => 'Kegiatan Siswa'
        ]);
    }
}
