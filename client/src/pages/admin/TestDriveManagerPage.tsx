import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, X, Plus, Calendar, Clock, Loader2, Car } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface User {
  id: string;
  fullName: string;
  email?: string;
}

interface Vehicle {
  id: string;
  model: string;
  brand?: { name: string } | string;
}

interface TestDrive {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  scheduledDate: string;
  scheduledTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  assignedToId: string | null;
  assignedTo?: { fullName: string } | null;
  vehicleId: string;
  vehicle?: Vehicle | null;
}

export default function TestDriveManagerPage() {
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestDrive | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const getBrandName = (brand: any) => {
    if (!brand) return '';
    if (typeof brand === 'string') return brand;
    return brand.name || '';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tdRes, uRes, vRes] = await Promise.all([
        apiFetch<TestDrive[]>('/api/test-drives'),
        apiFetch<User[]>('/api/users').catch(() => []),
        apiFetch<any>('/api/vehicles?limit=100').catch(() => []),
      ]);

      setTestDrives(tdRes || []);
      setUsers(uRes || []);
      
      const vehicleList = Array.isArray(vRes) ? vRes : (vRes?.data || []);
      setVehicles(vehicleList);
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải dữ liệu lịch lái thử', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const endpoint = editingItem 
        ? `/api/test-drives/${editingItem.id}` 
        : `/api/test-drives`;
      const method = editingItem ? 'PUT' : 'POST';

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      showToast(editingItem ? 'Cập nhật lịch lái thử thành công' : 'Đăng ký lịch lái thử thành công');
      setIsModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi lưu dữ liệu', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/test-drives/${deleteId}`, {
        method: 'DELETE',
      });
      showToast('Đã xóa lịch lái thử');
      setDeleteId(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi xóa', 'error');
    }
  };

  const filteredData = testDrives.filter(item => {
    const query = searchTerm.toLowerCase();
    const customer = (item.customerName || '').toLowerCase();
    const phone = item.customerPhone || '';
    const car = item.vehicle ? `${getBrandName(item.vehicle.brand)} ${item.vehicle.model}`.toLowerCase() : '';

    const matchesSearch = customer.includes(query) || phone.includes(query) || car.includes(query);
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return { text: 'Chờ duyệt', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'CONFIRMED': return { text: 'Đã xác nhận', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'COMPLETED': return { text: 'Hoàn thành', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'CANCELLED': return { text: 'Đã hủy', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      default: return { text: status, bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const stats = {
    pending: testDrives.filter(i => i.status === 'PENDING').length,
    confirmed: testDrives.filter(i => i.status === 'CONFIRMED').length,
    completed: testDrives.filter(i => i.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Lịch Lái Thử</h1>
          <p className="text-sm text-gray-500 mt-1">Lên lịch trải nghiệm thực tế xe cho khách hàng</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Đặt lịch lái thử mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-amber-600 uppercase">Chờ xác nhận</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</div>
          <p className="text-xs text-gray-400 mt-1">Khách mới đăng ký</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-blue-600 uppercase">Đã xác nhận</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.confirmed}</div>
          <p className="text-xs text-gray-400 mt-1">Sắp diễn ra</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">Hoàn thành</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</div>
          <p className="text-xs text-gray-400 mt-1">Đã trải nghiệm xe xong</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm theo tên khách hàng, số điện thoại, xe lái thử..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        <div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Số điện thoại</th>
                <th className="p-4 font-semibold">Xe lái thử</th>
                <th className="p-4 font-semibold">Thời gian hẹn</th>
                <th className="p-4 font-semibold">NV Phụ trách</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Đang tải lịch hẹn lái thử...
                  </td>
                </tr>
              ) : filteredData.map(item => {
                const badge = getStatusBadge(item.status);
                const vehicleName = item.vehicle 
                  ? `${getBrandName(item.vehicle.brand)} ${item.vehicle.model}`.trim() 
                  : '—';

                return (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{item.customerName}</td>
                    <td className="p-4 text-gray-600">
                      <div>{item.customerPhone}</div>
                      {item.customerEmail && <div className="text-xs text-gray-400">{item.customerEmail}</div>}
                    </td>
                    <td className="p-4 font-medium text-gray-800">{vehicleName}</td>
                    <td className="p-4 text-gray-600">
                      <div className="font-medium text-gray-900">{item.scheduledTime}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.scheduledDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {item.assignedTo?.fullName || (
                        <span className="text-xs text-gray-400 italic">Chưa gán</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => { setEditingItem(item); setIsModalOpen(true); }} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa lịch"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteId(item.id)} 
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa lịch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Không có lịch hẹn lái thử nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { setIsModalOpen(false); setEditingItem(null); }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? 'Cập nhật Lịch Lái Thử' : 'Đăng ký Lịch Lái Thử Mới'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Tên khách hàng <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  name="customerName" 
                  defaultValue={editingItem?.customerName} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  name="customerPhone" 
                  defaultValue={editingItem?.customerPhone} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Email
                </label>
                <input 
                  type="email" 
                  name="customerEmail" 
                  defaultValue={editingItem?.customerEmail || ''} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Chọn mẫu xe trải nghiệm <span className="text-red-500">*</span>
                </label>
                <select 
                  required 
                  name="vehicleId" 
                  defaultValue={editingItem?.vehicleId || ''} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Chọn xe trong kho --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {getBrandName(v.brand)} {v.model}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Ngày lái thử <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="date" 
                  name="scheduledDate" 
                  defaultValue={editingItem?.scheduledDate ? new Date(editingItem.scheduledDate).toISOString().split('T')[0] : ''} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Giờ hẹn lái thử <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="time" 
                  name="scheduledTime" 
                  defaultValue={editingItem?.scheduledTime || '09:00'} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              
              {editingItem && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select 
                      name="status" 
                      defaultValue={editingItem.status} 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="PENDING">Chờ xác nhận</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="COMPLETED">Hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Nhân viên đi kèm
                    </label>
                    <select 
                      name="assignedToId" 
                      defaultValue={editingItem.assignedToId || ''} 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">-- Chưa gán --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.fullName}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Ghi chú yêu cầu đặc biệt
                </label>
                <textarea 
                  name="notes" 
                  defaultValue={editingItem?.notes || ''} 
                  rows={3} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="Yêu cầu mang xe đến nhà, lộ trình lái thử..."
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingItem(null); }} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  {editingItem ? 'Lưu thay đổi' : 'Tạo lịch hẹn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h2>
            <p className="text-sm text-gray-600 mb-6">Bạn có chắc chắn muốn xóa lịch lái thử này không?</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteId(null)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Xóa ngay
              </button>
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
