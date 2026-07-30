<?php

namespace Tests;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MarqueeTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        putenv('API_KEY=smansa-test-key');
        $this->artisan('migrate:fresh');
    }

    /**
     * Test direct marquee endpoint returns announcements.
     */
    public function test_direct_marquee_endpoint_returns_announcements()
    {
        $now = Carbon::now();

        // Seed some announcements
        DB::table('announcements')->insert([
            [
                'title' => 'Announcement 1',
                'content' => 'Content 1',
                'is_active' => true,
                'created_at' => $now->copy()->subMinutes(10),
                'updated_at' => $now->copy()->subMinutes(10),
            ],
            [
                'title' => 'Announcement 2',
                'content' => 'Content 2',
                'is_active' => true,
                'created_at' => $now->copy()->subMinutes(5),
                'updated_at' => $now->copy()->subMinutes(5),
            ],
            [
                'title' => 'Inactive Announcement',
                'content' => 'Should not appear',
                'is_active' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        $response = $this->get('/api/announcements/marquee');

        $response->assertResponseStatus(200);
        $response->seeJsonStructure([
            'success',
            'data' => [
                '*' => ['id', 'title', 'content', 'event_date']
            ]
        ]);

        $responseData = json_decode($response->response->getContent(), true);
        $data = $responseData['data'];

        // Should return exactly 2 active announcements
        $this->assertCount(2, $data);
        $this->assertEquals('Announcement 2', $data[0]['title']); // Sorted by created_at desc
        $this->assertEquals('Announcement 1', $data[1]['title']);
    }

    /**
     * Test public marquee endpoint.
     */
    public function test_public_marquee_endpoint()
    {
        $response = $this->get('/api/public/announcements/marquee');
        $response->assertResponseStatus(200);
        $response->seeJsonStructure([
            'success',
            'data'
        ]);
    }

    /**
     * Test that limits to 5 results.
     */
    public function test_marquee_limits_to_five_results()
    {
        $now = Carbon::now();
        $announcements = [];
        for ($i = 0; $i < 10; $i++) {
            $announcements[] = [
                'title' => "Announcement {$i}",
                'content' => "Content {$i}",
                'is_active' => true,
                'created_at' => $now->copy()->subMinutes(10 - $i),
                'updated_at' => $now->copy()->subMinutes(10 - $i),
            ];
        }

        DB::table('announcements')->insert($announcements);

        $response = $this->get('/api/announcements/marquee');
        $response->assertResponseStatus(200);
        
        $responseData = json_decode($response->response->getContent(), true);
        $this->assertCount(5, $responseData['data']);
    }
}
