import os
import re

routes_path = r"d:\laragon\www\SMA-1-PAMEKASAN\BackendLumen\routes\web.php"

with open(routes_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Map of prefix/path to (middleware, controller)
# For example: 
# $router->delete('tahun-ajaran/{id}', ['middleware' => 'permission:tahun_ajaran,delete', 'uses' => 'TahunAjaranController@destroy']);
# We need to add:
# $router->post('tahun-ajaran/bulk-delete', ['middleware' => 'permission:tahun_ajaran,delete', 'uses' => 'TahunAjaranController@bulkDelete']);

additions = [
    ("tahun-ajaran/bulk-delete", "permission:tahun_ajaran,delete", "TahunAjaranController@bulkDelete"),
    ("kelas/bulk-delete", "permission:kelas,delete", "KelasController@bulkDelete"),
    ("users/bulk-delete", "role:admin", "UserController@bulkDelete"),
    ("alumni/bulk-delete", "permission:alumni,delete", "AlumniController@bulkDelete"),
    ("admin/news/bulk-delete", "permission:berita,delete", "AdminNewsController@bulkDelete"),
    ("admin/achievements/bulk-delete", "permission:prestasi,delete", "AdminAchievementController@bulkDelete"),
    ("admin/facilities/bulk-delete", "permission:fasilitas,delete", "AdminFacilityController@bulkDelete"),
    ("admin/pages/bulk-delete", "permission:halaman,delete", "AdminPageController@bulkDelete"),
    ("admin/teachers/bulk-delete", "permission:teachers,delete", "AdminTeacherController@bulkDelete"),
    ("admin/features/bulk-delete", "permission:features,delete", "AdminFeatureController@bulkDelete"),
    ("admin/programs/bulk-delete", "permission:programs,delete", "AdminProgramController@bulkDelete"),
    ("admin/extracurriculars/bulk-delete", "permission:ekstrakurikuler,delete", "ExtracurricularController@bulkDelete"),
    ("admin/navbars/bulk-delete", "permission:navigasi,delete", "AdminNavbarController@bulkDelete"),
    ("teacher-quotes/bulk-delete", None, "TeacherQuoteController@bulkDelete"),
    ("admin/agendas/bulk-delete", None, "AcademicCalendarController@bulkDelete"),
    ("admin/announcements/bulk-delete", None, "AnnouncementController@bulkDelete"),
]

# We will inject these lines before the final closing brace of the auth group
lines_to_add = "\n    // --- Bulk Delete Endpoints ---\n"
for path, middleware, controller in additions:
    if middleware:
        lines_to_add += f"    $router->post('{path}', ['middleware' => '{middleware}', 'uses' => '{controller}']);\n"
    else:
        lines_to_add += f"    $router->post('{path}', '{controller}');\n"

# find the last "});"
idx = content.rfind("});")
if idx != -1:
    new_content = content[:idx] + lines_to_add + "\n" + content[idx:]
    with open(routes_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Routes patched successfully.")
else:
    print("Failed to find end of group.")

