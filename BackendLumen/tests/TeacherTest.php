<?php

namespace Tests;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TeacherTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        putenv('API_KEY=smansa-test-key');
        $this->artisan('migrate:fresh');
    }

    public function test_admin_can_create_teacher()
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        $response = $this->actingAs($admin)->post('/api/admin/teachers', [
            'name' => 'Guru Baru',
            'subject' => 'Matematika',
            'jabatan' => 'Guru Bidang'
        ]);

        $response->assertResponseStatus(201);
        $response->seeJson([
            'name' => 'Guru Baru',
            'jabatan' => 'Guru Bidang'
        ]);

        $this->seeInDatabase('teachers', [
            'name' => 'Guru Baru',
            'jabatan' => 'Guru Bidang'
        ]);
    }

    public function test_admin_can_update_teacher()
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        $teacher = Teacher::create([
            'name' => 'Guru Lama',
            'subject' => 'Fisika',
            'jabatan' => 'Guru Bidang'
        ]);

        $response = $this->actingAs($admin)->post("/api/admin/teachers/{$teacher->id}", [
            '_method' => 'PUT',
            'name' => 'Guru Lama (Diperbarui)',
            'subject' => 'Fisika',
            'jabatan' => 'Wakil Kepala Sekolah Bidang Kurikulum'
        ]);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'id' => $teacher->id,
            'jabatan' => 'Wakil Kepala Sekolah Bidang Kurikulum'
        ]);

        $this->seeInDatabase('teachers', [
            'id' => $teacher->id,
            'jabatan' => 'Wakil Kepala Sekolah Bidang Kurikulum'
        ]);
    }

    public function test_public_teachers_api_returns_sorted_teachers()
    {
        Teacher::create([
            'name' => 'Guru Tiga',
            'jabatan' => 'Guru Bidang'
        ]);

        Teacher::create([
            'name' => 'Kepala Sekolah',
            'jabatan' => 'Kepala Sekolah'
        ]);

        Teacher::create([
            'name' => 'Wakil Kepala',
            'jabatan' => 'Wakil Kepala Sekolah'
        ]);

        $response = $this->get('/api/public/landing-data', [
            'x-api-key' => 'smansa-test-key'
        ]);

        $response->assertResponseStatus(200);
        $data = json_decode($response->response->getContent(), true);
        
        $teachers = $data['data']['teachers'];
        
        $this->assertCount(3, $teachers);
        $this->assertEquals('Kepala Sekolah', $teachers[0]['name']);
        $this->assertEquals('Wakil Kepala', $teachers[1]['name']);
        $this->assertEquals('Guru Tiga', $teachers[2]['name']);
    }
}
