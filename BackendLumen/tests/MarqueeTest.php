<?php

namespace Tests;

use Laravel\Lumen\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MarqueeTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Set up the API_KEY environment variable for the test
        putenv('API_KEY=smansa-test-key');

        // Manually run migrate:fresh to set up the DB schema and avoid sqlite rollback errors
        $this->artisan('migrate:fresh');
    }

    /**
     * Test direct marquee endpoint without API key middleware.
     */
    public function test_direct_marquee_endpoint_returns_upcoming_events()
    {
        $today = Carbon::today();

        // Seed some events in the past, today, and future
        DB::table('academic_calendars')->insert([
            [
                'title' => 'Past Event',
                'description' => 'Should not appear',
                'event_date' => $today->copy()->subDay()->toDateString(),
                'type' => 'kegiatan',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Today Event',
                'description' => 'Should appear',
                'event_date' => $today->toDateString(),
                'type' => 'ujian',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Future Event 1',
                'description' => 'Should appear',
                'event_date' => $today->copy()->addDays(2)->toDateString(),
                'type' => 'kegiatan',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Future Event 2',
                'description' => 'Should appear',
                'event_date' => $today->copy()->addDays(1)->toDateString(), // event 2 is earlier than event 1 but both in future
                'type' => 'libur',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

        $response = $this->get('/api/announcements/marquee');

        $response->assertResponseStatus(200);
        $response->seeJsonStructure([
            'success',
            'data' => [
                '*' => ['id', 'title', 'event_date']
            ]
        ]);

        $responseData = json_decode($response->response->getContent(), true);
        $data = $responseData['data'];

        // Should return exactly 3 events (Today, Future 2, Future 1) in that order
        $this->assertCount(3, $data);
        $this->assertEquals('Today Event', $data[0]['title']);
        $this->assertEquals($today->toDateString(), $data[0]['event_date']);

        $this->assertEquals('Future Event 2', $data[1]['title']);
        $this->assertEquals($today->copy()->addDays(1)->toDateString(), $data[1]['event_date']);

        $this->assertEquals('Future Event 1', $data[2]['title']);
        $this->assertEquals($today->copy()->addDays(2)->toDateString(), $data[2]['event_date']);

        // Assert descriptions or other fields are not in the response data items
        $this->assertArrayNotHasKey('description', $data[0]);
        $this->assertArrayNotHasKey('type', $data[0]);
    }

    /**
     * Test public marquee endpoint with API key middleware.
     */
    public function test_public_marquee_endpoint_requires_valid_api_key()
    {
        // Without header
        $responseWithoutHeader = $this->get('/api/public/announcements/marquee');
        $responseWithoutHeader->assertResponseStatus(401);
        $responseWithoutHeader->seeJson([
            'message' => 'Unauthorized. Invalid API Key.'
        ]);

        // With wrong header
        $responseWithWrongHeader = $this->get('/api/public/announcements/marquee', [
            'x-api-key' => 'wrong-key-value'
        ]);
        $responseWithWrongHeader->assertResponseStatus(401);

        // With correct header
        $responseWithCorrectHeader = $this->get('/api/public/announcements/marquee', [
            'x-api-key' => 'smansa-test-key'
        ]);
        $responseWithCorrectHeader->assertResponseStatus(200);
        $responseWithCorrectHeader->seeJsonStructure([
            'success',
            'data'
        ]);
    }

    /**
     * Test that limits to 5 results.
     */
    public function test_marquee_limits_to_five_results()
    {
        $today = Carbon::today();
        $events = [];
        for ($i = 0; $i < 10; $i++) {
            $events[] = [
                'title' => "Event {$i}",
                'description' => "Description {$i}",
                'event_date' => $today->copy()->addDays($i)->toDateString(),
                'type' => 'kegiatan',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ];
        }

        DB::table('academic_calendars')->insert($events);

        $response = $this->get('/api/announcements/marquee');
        $response->assertResponseStatus(200);
        
        $responseData = json_decode($response->response->getContent(), true);
        $this->assertCount(5, $responseData['data']);
    }
}
