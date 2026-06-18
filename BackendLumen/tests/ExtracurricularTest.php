<?php

namespace Tests;

use App\Models\Extracurricular;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Lumen\Testing\DatabaseMigrations;

class ExtracurricularTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Set up testing variables
        putenv('API_KEY=smansa-test-key');

        // Manually run migrate:fresh to avoid sqlite rollback errors
        $this->artisan('migrate:fresh');
    }

    /**
     * Test public index route.
     */
    public function test_public_index_returns_list_of_extracurriculars()
    {
        Extracurricular::create([
            'name' => 'Pramuka',
            'description' => 'Kegiatan kepanduan praja muda karana',
            'image_path' => 'http://example.com/pramuka.jpg'
        ]);

        Extracurricular::create([
            'name' => 'Futsal',
            'description' => 'Olahraga futsal putra',
            'image_path' => 'http://example.com/futsal.jpg'
        ]);

        // Access via public route with api-key
        $response = $this->get('/api/public/extracurriculars', [
            'x-api-key' => 'smansa-test-key'
        ]);

        $response->assertResponseStatus(200);
        $response->seeJsonStructure([
            '*' => ['id', 'name', 'description', 'image_path', 'created_at', 'updated_at']
        ]);

        $data = json_decode($response->response->getContent(), true);
        $this->assertCount(2, $data);
        $this->assertEquals('Futsal', $data[0]['name']); // Ordered by name asc
        $this->assertEquals('Pramuka', $data[1]['name']);
    }

    /**
     * Test admin CRUD routes authentication and validation.
     */
    public function test_admin_routes_require_authentication()
    {
        // Store
        $response = $this->post('/api/admin/extracurriculars', [
            'name' => 'Forbidden Extra',
            'description' => 'This should fail'
        ]);
        $response->assertResponseStatus(401);

        // Update
        $response = $this->put('/api/admin/extracurriculars/1', [
            'name' => 'Forbidden Extra',
            'description' => 'This should fail'
        ]);
        $response->assertResponseStatus(401);

        // Delete
        $response = $this->delete('/api/admin/extracurriculars/1');
        $response->assertResponseStatus(401);
    }

    /**
     * Test admin CRUD operations.
     */
    public function test_admin_can_perform_crud_operations()
    {
        // Create an admin user
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        // 1. Create (Store)
        $response = $this->actingAs($admin)->post('/api/admin/extracurriculars', [
            'name' => 'PMR',
            'description' => 'Palang Merah Remaja',
            'image_path' => 'http://example.com/pmr.jpg'
        ]);

        $response->assertResponseStatus(201);
        $response->seeJson([
            'name' => 'PMR',
            'description' => 'Palang Merah Remaja',
            'image_path' => 'http://example.com/pmr.jpg'
        ]);

        $responseData = json_decode($response->response->getContent(), true);
        $id = $responseData['id'];

        // 2. Read (Show)
        $response = $this->actingAs($admin)->get("/api/admin/extracurriculars/{$id}");
        $response->assertResponseStatus(200);
        $response->seeJson([
            'name' => 'PMR',
            'description' => 'Palang Merah Remaja'
        ]);

        // 3. Update (Put)
        $response = $this->actingAs($admin)->put("/api/admin/extracurriculars/{$id}", [
            'name' => 'PMR Indonesia',
            'description' => 'Palang Merah Remaja Cabang SMAN 1 Pamekasan',
            'image_path' => 'http://example.com/pmr-new.jpg'
        ]);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'id' => $id,
            'name' => 'PMR Indonesia',
            'description' => 'Palang Merah Remaja Cabang SMAN 1 Pamekasan',
            'image_path' => 'http://example.com/pmr-new.jpg'
        ]);

        // 4. Delete (Destroy)
        $response = $this->actingAs($admin)->delete("/api/admin/extracurriculars/{$id}");
        $response->assertResponseStatus(200);
        $response->seeJson([
            'message' => 'Deleted successfully'
        ]);

        // Confirm deletion
        $this->assertNull(Extracurricular::find($id));
    }
}
