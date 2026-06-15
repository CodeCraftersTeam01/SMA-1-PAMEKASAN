import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserList from './UserList';
import UserForm from './UserForm';
import PermissionModal from './PermissionModal';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white shadow-2xl shadow-slate-900/20 animate-fade-up ${colors[type] || colors.info}`}>
      {type === 'success' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === 'error' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const UserManagement = () => {
  const { token, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const [users, setUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [permModalUser, setPermModalUser] = useState(null);

  // Fetch all users
  const fetchUsers = async () => {
    if (!token) return; // Mencegah fetch tanpa token yang memicu 401 & NetworkError
    setIsFetchingUsers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Gagal mengambil data pengguna');

      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setIsFetchingUsers(false);
    }
  };

  // Create new user
  const handleCreateUser = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal membuat pengguna');
      }

      setToast({ message: data.message, type: 'success' });
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  // Update existing user
  const handleUpdateUser = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal memperbarui pengguna');
      }

      setToast({ message: data.message, type: 'success' });
      setShowForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menghapus pengguna');
      }

      setToast({ message: data.message, type: 'success' });
      fetchUsers();
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  // Save permissions
  const handleSavePermissions = async (userId, permissions) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan hak akses');
      }

      setToast({ message: 'Hak akses berhasil disimpan', type: 'success' });
      setPermModalUser(null);
      fetchUsers();
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  // Redirect non-admin users away from this page
  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, user, navigate]);

  // Load users
  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Manajemen Pengguna</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola pengguna sistem SMA 1 Pamekasan.
            </p>
          </div>
          {!showForm ? (
            <button
              onClick={() => {
                setEditingUser(null);
                setShowForm(true);
              }}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 font-semibold flex items-center gap-2 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Pengguna
            </button>
          ) : (
            <button
              onClick={() => {
                setShowForm(false);
                setEditingUser(null);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl transition-all font-semibold flex items-center gap-2 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Batalkan
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-up delay-75">
        {showForm ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <UserForm
              user={editingUser}
              onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
              isEditing={!!editingUser}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
            <UserList
              users={users}
              isLoading={isFetchingUsers}
              onEdit={(user) => {
                setEditingUser(user);
                setShowForm(true);
              }}
              onDelete={handleDeleteUser}
              onRefresh={fetchUsers}
              onManagePermissions={(user) => setPermModalUser(user)}
            />
          </div>
        )}
      </div>

      {/* Permission Modal */}
      <PermissionModal
        user={permModalUser}
        isOpen={!!permModalUser}
        onClose={() => setPermModalUser(null)}
        onSave={handleSavePermissions}
        API_BASE_URL={API_BASE_URL}
        token={token}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
