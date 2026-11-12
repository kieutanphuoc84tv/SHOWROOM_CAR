import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, X, Filter, Loader2, Users } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface User {
  id: string;
  fullName: string;
  email?: string;
  role?: string;
}

interface Lead {
  id: string;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  type: string;
  status: string;
  notes: string | null;
  assignedToId: string | null;
  assignedTo?: { fullName: string } | null;
  customer?: { fullName: string; phone: string; email: string } | null;
  vehicle?: { 
    id?: string;
    model: string; 
    brand?: { name: string } | string;
  } | null;
  createdAt: string;
}

export default function LeadManagerPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchLeads = async () => {
    try {
      const data = await apiFetch<Lead[]>('/api/leads');
      setLeads(data || []);
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải danh sách khách hàng', 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<User[]>('/api/users');
      setUsers(data || []);
    } catch (error) {
      console.warn('Chưa lấy được danh sách nhân viên để gán lead');
    }
  };

  useEffect(() => {
    Promise.all([fetchLeads(), fetchUsers()]).finally(() => setLoading(false));
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        status: formData.get('status'),
        assignedToId: formData.get('assignedToId') || null,
        notes: formData.get('notes'),
      };

      await apiFetch(`/api/leads/${editingLead.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      showToast('Cập nhật trạng thái khách hàng thành công');
      setEditingLead(null);
      fetchLeads();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi cập nhật lead', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/leads/${deleteId}`, {
        method: 'DELETE',
      });
      showToast('Đã xóa yêu cầu khách hàng');
      setDeleteId(null);
      fetchLeads();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi xóa', 'error');
    }
  };

  const getBrandName = (brand: any) => {
    if (!brand) return '';
    if (typeof brand === 'string') return brand;
    return brand.name || '';
  };

  const filteredLeads = leads.filter(l => {
    const customerName = (l.guestName || l.customer?.fullName || '').toLowerCase();
    const phone = l.guestPhone || l.customer?.phone || '';
    const email = (l.guestEmail || l.customer?.email || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = customerName.includes(query) || phone.includes(query) || email.includes(query);
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || l.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'NEW': return { text: 'Mới', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'CONTACTED': return { text: 'Đã liên hệ', bg: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'QUALIFIED': return { text: 'Tiềm năng cao', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'IN_PROGRESS': return { text: 'Đang tư vấn', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'LOST': return { text: 'Không mua', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'CONVERTED': return { text: 'Đã chốt xe', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default: return { text: status, bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'TEST_DRIVE': return { text: 'Lái thử', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'PRICE_QUOTE':
      case 'INQUIRY': return { text: 'Báo giá / Tư vấn', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'FINANCE': return { text: 'Vay trả góp', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'GENERAL': return { text: 'Liên hệ chung', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
      default: return { text: type, bg: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const stats = {
    new: leads.filter(l => l.status === 'NEW').length,
    contacted: leads.filter(l => l.status === 'CONTACTED').length,
    qualified: leads.filter(l => l.status === 'QUALIFIED').length,
    converted: leads.filter(l => l.status === 'CONVERTED').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Khách hàng & Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi, phân bổ và chuyển đổi khách hàng tiềm năng</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-blue-600 uppercase">Mới tiếp nhận</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.new}</div>
          <p className="text-xs text-gray-400 mt-1">Cần liên hệ trong 15 phút</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-amber-600 uppercase">Đã liên hệ</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.contacted}</div>
          <p className="text-xs text-gray-400 mt-1">Đang tư vấn nhu cầu</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-purple-600 uppercase">Tiềm năng cao</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.qualified}</div>
          <p className="text-xs text-gray-400 mt-1">Chuẩn bị chốt hợp đồng</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">Đã chốt xe</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.converted}</div>
          <p className="text-xs text-gray-400 mt-1">Chuyển sang cọc / hợp đồng</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm theo tên khách, số điện thoại, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="NEW">Mới</option>
            <option value="CONTACTED">Đã liên hệ</option>
            <option value="QUALIFIED">Tiềm năng cao</option>
            <option value="IN_PROGRESS">Đang tư vấn</option>
            <option value="LOST">Không mua</option>
            <option value="CONVERTED">Đã chốt xe</option>
          </select>
          <select 
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-sm border border-gray-200 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả loại yêu cầu</option>
            <option value="TEST_DRIVE">Lái thử xe</option>
            <option value="PRICE_QUOTE">Báo giá xe</option>
            <option value="FINANCE">Tư vấn trả góp</option>
            <option value="GENERAL">Tư vấn chung</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Liên hệ</th>
                <th className="p-4 font-semibold">Loại yêu cầu</th>
                <th className="p-4 font-semibold">Xe quan tâm</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold">NV Phụ trách</th>
                <th className="p-4 font-semibold">Ngày tạo</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Đang tải dữ liệu khách hàng...
                  </td>
                </tr>
              ) : filteredLeads.map(lead => {
                const displayName = lead.guestName || lead.customer?.fullName || 'Khách vãng lai';
                const displayPhone = lead.guestPhone || lead.customer?.phone || '—';
                const displayEmail = lead.guestEmail || lead.customer?.email || '';
                const vehicleName = lead.vehicle 
                  ? `${getBrandName(lead.vehicle.brand)} ${lead.vehicle.model}`.trim() 
                  : '—';
                const statusBadge = getStatusBadge(lead.status);
                const typeBadge = getTypeBadge(lead.type);

                return (
                  <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{displayName}</td>
                    <td className="p-4 text-gray-600">
                      <div>{displayPhone}</div>
                      {displayEmail && <div className="text-xs text-gray-400">{displayEmail}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${typeBadge.bg}`}>
                        {typeBadge.text}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 font-medium">{vehicleName}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.bg}`}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {lead.assignedTo?.fullName || (
                        <span className="text-xs text-gray-400 italic">Chưa gán</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => setEditingLead(lead)} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Cập nhật trạng thái"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteId(lead.id)} 
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa yêu cầu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Không tìm thấy khách hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setEditingLead(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Cập nhật Lead Khách hàng</h2>
            <p className="text-xs text-gray-500 mb-4">
              Khách hàng: <strong>{editingLead.guestName || editingLead.customer?.fullName || 'Khách hàng'}</strong>
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Trạng thái xử lý
                </label>
                <select 
                  name="status" 
                  defaultValue={editingLead.status} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="NEW">Mới</option>
                  <option value="CONTACTED">Đã liên hệ</option>
                  <option value="QUALIFIED">Tiềm năng cao</option>
                  <option value="IN_PROGRESS">Đang tư vấn</option>
                  <option value="LOST">Không mua</option>
                  <option value="CONVERTED">Đã chốt xe</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Nhân viên kinh doanh phụ trách
                </label>
                <select 
                  name="assignedToId" 
                  defaultValue={editingLead.assignedToId || ''} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Chưa gán (Phòng kinh doanh chung) --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.role || 'Sales'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Ghi chú tư vấn
                </label>
                <textarea 
                  name="notes" 
                  defaultValue={editingLead.notes || ''} 
                  rows={3} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="Ghi chú nhu cầu khách, ngân sách, lịch hẹn..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingLead(null)} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                >
                  Lưu thay đổi
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
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa khách hàng tiềm năng này không?
            </p>
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
