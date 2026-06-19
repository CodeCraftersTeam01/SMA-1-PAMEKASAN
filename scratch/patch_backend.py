import os
import glob

# Path to controllers
controllers_dir = r"d:\laragon\www\SMA-1-PAMEKASAN\BackendLumen\app\Http\Controllers"

controllers_to_patch = [
    "TahunAjaranController.php",
    "KelasController.php",
    "AlumniController.php",
    "AdminNewsController.php",
    "AdminAchievementController.php",
    "AdminFacilityController.php",
    "AdminPageController.php",
    "AdminTeacherController.php",
    "AdminFeatureController.php",
    "AdminProgramController.php",
    "ExtracurricularController.php",
    "AdminNavbarController.php",
    "TeacherQuoteController.php",
    "AcademicCalendarController.php",
    "AnnouncementController.php",
    "UserController.php"
]

bulk_delete_code = """
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
"""

for ctrl_name in controllers_to_patch:
    file_path = os.path.join(controllers_dir, ctrl_name)
    if not os.path.exists(file_path):
        print(f"Not found: {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "public function bulkDelete" in content:
        print(f"Already patched: {ctrl_name}")
        continue
        
    # Find the last closing brace of the class
    last_brace_idx = content.rfind('}')
    if last_brace_idx != -1:
        new_content = content[:last_brace_idx] + bulk_delete_code + "\n" + content[last_brace_idx:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched: {ctrl_name}")
    else:
        print(f"Could not find closing brace in {ctrl_name}")
