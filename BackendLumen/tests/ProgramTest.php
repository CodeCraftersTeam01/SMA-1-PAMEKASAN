<?php

namespace Tests;

use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ProgramTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        putenv('API_KEY=smansa-test-key');
        $this->artisan('migrate:fresh');
    }

    /**
     * Test public index route in LandingPageController.
     */
    public function test_public_index_returns_list_of_programs_with_image_path()
    {
        Program::create([
            'title' => 'MIPA',
            'description' => 'Fokus pada Matematika dan Ilmu Pengetahuan Alam',
            'image_path' => 'http://example.com/mipa.jpg',
            'features_json' => [['title' => 'Lab', 'desc' => 'Science Lab', 'icon' => 'bi-star']],
            'order' => 1
        ]);

        Program::create([
            'title' => 'IPS',
            'description' => 'Fokus pada Ilmu Pengetahuan Sosial',
            'image_path' => 'http://example.com/ips.jpg',
            'features_json' => [],
            'order' => 2
        ]);

        // 1. Get from public programs endpoint
        $response = $this->get('/api/public/programs', [
            'x-api-key' => 'smansa-test-key'
        ]);

        $response->assertResponseStatus(200);
        $response->seeJsonStructure([
            'success',
            'data' => [
                '*' => ['id', 'title', 'description', 'features_json', 'image_path']
            ]
        ]);

        $res = json_decode($response->response->getContent(), true);
        $data = $res['data'];
        $this->assertCount(2, $data);
        $this->assertEquals('MIPA', $data[0]['title']);
        $this->assertEquals('http://example.com/mipa.jpg', $data[0]['image_path']);
        
        // 2. Get from public landing data endpoint
        $response2 = $this->get('/api/public/landing-data', [
            'x-api-key' => 'smansa-test-key'
        ]);
        $response2->assertResponseStatus(200);
        $res2 = json_decode($response2->response->getContent(), true);
        $landingData = $res2['data'];
        $this->assertArrayHasKey('programs', $landingData);
        $this->assertCount(2, $landingData['programs']);
        $this->assertEquals('http://example.com/mipa.jpg', $landingData['programs'][0]['image_path']);
    }

    /**
     * Test admin CRUD operations on programs.
     */
    public function test_admin_can_perform_crud_operations_for_programs()
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        // 1. Create (Store)
        $response = $this->actingAs($admin)->post('/api/admin/programs', [
            'title' => 'Bahasa',
            'description' => 'Program penguasaan bahasa',
            'order' => 3,
            'features_json' => [['title' => 'Native', 'desc' => 'Native Speaker', 'icon' => 'bi-chat']]
        ]);

        $response->assertResponseStatus(201);
        $response->seeJson([
            'title' => 'Bahasa',
            'description' => 'Program penguasaan bahasa',
            'order' => 3
        ]);

        $responseData = json_decode($response->response->getContent(), true);
        $id = $responseData['id'];

        // Confirm existence in DB using seeInDatabase
        $this->seeInDatabase('programs', [
            'id' => $id,
            'title' => 'Bahasa',
            'image_path' => null
        ]);

        // 2. Update (Put)
        $response = $this->actingAs($admin)->put("/api/admin/programs/{$id}", [
            'title' => 'Bahasa Baru',
            'description' => 'Program penguasaan bahasa asing',
            'order' => 3,
            'image_path' => 'http://example.com/bahasa-new.jpg',
            'features_json' => [['title' => 'Native', 'desc' => 'Native Speaker', 'icon' => 'bi-chat']]
        ]);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'id' => $id,
            'title' => 'Bahasa Baru',
            'image_path' => 'http://example.com/bahasa-new.jpg'
        ]);

        // 3. Delete (Destroy)
        $response = $this->actingAs($admin)->delete("/api/admin/programs/{$id}");
        $response->assertResponseStatus(200);

        // Confirm deletion
        $this->assertNull(Program::find($id));
    }
}
