import React, { useState, useEffect } from 'react';
import { Edit, Trash2, X, Plus, Users, Tag, Layers, Loader2, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'USERS' | 'BRANDS' | 'CATEGORIES'>('USERS');
  
  const [users, setUsers] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteData, setDeleteData] = useState<{ id: string | number, type: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<any[]>('/api/users');
      setUsers(data || []);
    } catch {
      setUsers([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await apiFetch<any[]>('/api/brands');
      setBrands(data || []);
    } catch {
      setBrands([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiFetch<any[]>('/api/categories');
      setCategories(data || []);
    } catch {
      setCategories([]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchBrands(), fetchCategories()]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return { text: 'Quản trị viên', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'SALES': return { text: 'Nhân viên kinh doanh', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'USER': return { text: 'Khách hàng', bg: 'bg-gray-100 text-gray-800 border-gray-200' };
      default: return { text: role, bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: any = Object.fromEntries(formData.entries());
    
    // Convert checkbox to boolean
    payload.isActive = formData.get('isActive') === 'on';
    
    // Clean empty password on update
    if (editingItem && !payload.password) {
      delete payload.password;
    }

    try {
      const endpoint = editingItem ? `/api/users/${editingItem.id}` : `/api/users`;
      await apiFetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      showToast(editingItem ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên mới thành công');
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi lưu nhân viên', 'error');
    }
  };

  const handleSaveBrand = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const endpoint = editingItem ? `/api/brands/${editingItem.id}` : `/api/brands`;
      await apiFetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      showToast(editingItem ? 'Cập nhật hãng xe thành công' : 'Thêm hãng xe mới thành công');
      setIsModalOpen(false);
      fetchBrands();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi lưu hãng xe', 'error');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const endpoint = editingItem ? `/api/categories/${editingItem.id}` : `/api/categories`;
      await apiFetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      showToast(editingItem ? 'Cập nhật danh mục thành công' : 'Thêm danh mục mới thành công');
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi lưu danh mục', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    try {
      await apiFetch(`/api/${deleteData.type}/${deleteData.id}`, { 
        method: 'DELETE' 
      });
      showToast('Xóa dữ liệu thành công');
      setDeleteData(null);
      
      if (deleteData.type === 'users') fetchUsers();
      else if (deleteData.type === 'brands') fetchBrands();
      else if (deleteData.type === 'categories') fetchCategories();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi xóa dữ liệu', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt Hệ thống</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản nhân viên, hãng sản xuất và phân khúc danh mục xe</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4">
        <button 
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-2 pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'USERS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Users className="w-4 h-4" />
          Nhân viên & Người dùng ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('BRANDS')}
          className={`flex items-center gap-2 pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'BRANDS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Tag className="w-4 h-4" />
          Hãng sản xuất ({brands.length})
        </button>
        <button 
          onClick={() => setActiveTab('CATEGORIES')}
          className={`flex items-center gap-2 pb-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'CATEGORIES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Layers className="w-4 h-4" />
          Phân khúc dòng xe ({categories.length})
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-base">
            {activeTab === 'USERS' && 'Danh sách Nhân viên hệ thống'}
            {activeTab === 'BRANDS' && 'Danh sách Hãng xe Showroom phân phối'}
            {activeTab === 'CATEGORIES' && 'Danh sách Phân khúc (Sedan, SUV, Coupe...)'}
          </h2>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            Đang tải dữ liệu cài đặt...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  {activeTab === 'USERS' && (
                    <>
                      <th className="p-4 font-semibold">Họ tên</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Số điện thoại</th>
                      <th className="p-4 font-semibold">Vai trò RBAC</th>
                      <th className="p-4 font-semibold">Trạng thái</th>
                    </>
                  )}
                  {activeTab === 'BRANDS' && (
                    <>
                      <th className="p-4 font-semibold">Tên thương hiệu</th>
                      <th className="p-4 font-semibold">Quốc gia xuất xứ</th>
                      <th className="p-4 font-semibold">Số lượng xe</th>
                    </>
                  )}
                  {activeTab === 'CATEGORIES' && (
                    <>
                      <th className="p-4 font-semibold">Tên phân khúc</th>
                      <th className="p-4 font-semibold">Mô tả đặc tính</th>
                      <th className="p-4 font-semibold">Số lượng xe</th>
                    </>
                  )}
                  <th className="p-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {activeTab === 'USERS' && users.map(user => {
                  const roleBadge = getRoleBadge(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-4 font-semibold text-gray-900">{user.fullName}</td>
                      <td className="p-4 text-gray-600 font-mono text-xs">{user.email}</td>
                      <td className="p-4 text-gray-600">{user.phone || '—'}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${roleBadge.bg}`}>
                          {roleBadge.text}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Khóa
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => { setEditingItem(user); setIsModalOpen(true); }} 
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteData({ id: user.id, type: 'users' })} 
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {activeTab === 'BRANDS' && brands.map(brand => (
                  <tr key={brand.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{brand.name}</td>
                    <td className="p-4 text-gray-600">{brand.country || '—'}</td>
                    <td className="p-4 font-medium text-blue-600">{brand.vehicles?.length || 0} xe</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => { setEditingItem(brand); setIsModalOpen(true); }} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteData({ id: brand.id, type: 'brands' })} 
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {activeTab === 'CATEGORIES' && categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{cat.name}</td>
                    <td className="p-4 text-gray-600">{cat.description || '—'}</td>
                    <td className="p-4 font-medium text-blue-600">{cat.vehicles?.length || 0} xe</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => { setEditingItem(cat); setIsModalOpen(true); }} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteData({ id: cat.id, type: 'categories' })} 
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => { setIsModalOpen(false); setEditingItem(null); }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? 'Cập nhật' : 'Thêm mới'} {activeTab === 'USERS' ? 'Nhân viên' : activeTab === 'BRANDS' ? 'Hãng xe' : 'Phân khúc'}
            </h2>
            
            {activeTab === 'USERS' && (
              <form onSubmit={handleSaveUser} className="space-y-4">
                {!editingItem && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Email đăng nhập *</label>
                      <input required type="email" name="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Mật khẩu khởi tạo *</label>
                      <input required type="password" name="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Họ và tên *</label>
                  <input required name="fullName" defaultValue={editingItem?.fullName} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Số điện thoại</label>
                  <input name="phone" defaultValue={editingItem?.phone} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Phân quyền (Role)</label>
                  <select name="role" defaultValue={editingItem?.role || 'SALES'} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="ADMIN">Quản trị viên (ADMIN - Toàn quyền)</option>
                    <option value="SALES">Nhân viên kinh doanh (SALES - Bán hàng, kho, lead)</option>
                    <option value="USER">Khách hàng thông thường (USER)</option>
                  </select>
                </div>
                {editingItem && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Đổi mật khẩu mới (bỏ trống nếu giữ nguyên)</label>
                      <input type="password" name="password" placeholder="Nhập mật khẩu mới..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input type="checkbox" id="isActive" name="isActive" defaultChecked={editingItem.isActive} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Tài khoản đang hoạt động (Active)</label>
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
                </div>
              </form>
            )}

            {activeTab === 'BRANDS' && (
              <form onSubmit={handleSaveBrand} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Tên thương hiệu xe *</label>
                  <input required name="name" defaultValue={editingItem?.name} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="VD: Porsche, Mercedes, BMW..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Quốc gia xuất xứ</label>
                  <input name="country" defaultValue={editingItem?.country} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="VD: Đức, Nhật Bản, Mỹ..." />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
                </div>
              </form>
            )}

            {activeTab === 'CATEGORIES' && (
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Tên phân khúc xe *</label>
                  <input required name="name" defaultValue={editingItem?.name} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="VD: SUV, Sedan, MPV..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Mô tả đặc điểm</label>
                  <textarea name="description" defaultValue={editingItem?.description} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="VD: Dòng xe gầm cao thể thao đa dụng..."></textarea>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h2>
            <p className="text-sm text-gray-600 mb-6">Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteData(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
