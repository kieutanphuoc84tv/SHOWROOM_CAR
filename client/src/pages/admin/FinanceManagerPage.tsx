import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, X, Plus, DollarSign, Calculator, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface Vehicle {
  id: string;
  model: string;
  brand?: { name: string } | string;
}

interface FinanceRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  monthlyIncome: number;
  loanAmount: number;
  loanTermMonths: number;
  interestRate: number;
  downPayment: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
  notes: string | null;
  vehicleId: string;
  vehicle?: Vehicle | null;
  createdAt?: string;
}

export default function FinanceManagerPage() {
  const [finances, setFinances] = useState<FinanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FinanceRecord | null>(null);
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
      const [fRes, vRes] = await Promise.all([
        apiFetch<FinanceRecord[]>('/api/finance'),
        apiFetch<any>('/api/vehicles?limit=100').catch(() => []),
      ]);
      setFinances(fRes || []);
      const vehicleList = Array.isArray(vRes) ? vRes : (vRes?.data || []);
      setVehicles(vehicleList);
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải dữ liệu hồ sơ trả góp', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatVND = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    
    // Parse numeric fields
    const numericFields = ['monthlyIncome', 'loanAmount', 'loanTermMonths', 'interestRate', 'downPayment'];
    numericFields.forEach(field => {
      if (payload[field]) {
        payload[field] = Number(payload[field]) as any;
      }
    });

    try {
      const endpoint = editingItem 
        ? `/api/finance/${editingItem.id}` 
        : `/api/finance`;
      const method = editingItem ? 'PUT' : 'POST';

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      showToast(editingItem ? 'Cập nhật hồ sơ trả góp thành công' : 'Thêm hồ sơ trả góp thành công');
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
      await apiFetch(`/api/finance/${deleteId}`, {
        method: 'DELETE',
      });
      showToast('Đã xóa hồ sơ trả góp');
      setDeleteId(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi xóa', 'error');
    }
  };

  const filteredData = finances.filter(item => {
    const query = searchTerm.toLowerCase();
    const name = (item.customerName || '').toLowerCase();
    const phone = item.customerPhone || '';
    const car = item.vehicle ? `${getBrandName(item.vehicle.brand)} ${item.vehicle.model}`.toLowerCase() : '';

    const matchesSearch = name.includes(query) || phone.includes(query) || car.includes(query);
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return { text: 'Chờ duyệt', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'APPROVED': return { text: 'Đã duyệt vay', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'REJECTED': return { text: 'Từ chối', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'ACTIVE': return { text: 'Đang trả góp', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'COMPLETED': return { text: 'Đã tất toán', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      default: return { text: status, bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const stats = {
    pending: finances.filter(i => i.status === 'PENDING').length,
    approved: finances.filter(i => i.status === 'APPROVED').length,
    active: finances.filter(i => i.status === 'ACTIVE').length,
    totalLoan: finances.reduce((sum, item) => sum + (Number(item.loanAmount) || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Hồ sơ Trả góp & Vay vốn</h1>
          <p className="text-sm text-gray-500 mt-1">Duyệt hồ sơ ngân hàng, tính lãi suất và theo dõi dư nợ mua xe</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Tạo hồ sơ trả góp
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-amber-600 uppercase">Chờ thẩm định</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</div>
          <p className="text-xs text-gray-400 mt-1">Hồ sơ cần gửi bank</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-blue-600 uppercase">Đã duyệt giải ngân</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.approved}</div>
          <p className="text-xs text-gray-400 mt-1">Chờ nhận xe</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">Đang thực hiện vay</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</div>
          <p className="text-xs text-gray-400 mt-1">Hợp đồng hiệu lực</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-purple-600 uppercase">Tổng hạn mức vay</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">
            {formatVND(stats.totalLoan)}
          </div>
          <p className="text-xs text-gray-400 mt-1">Giá trị tích lũy</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm theo tên khách hàng, số điện thoại, xe mua..."
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
            <option value="ALL">Tất cả trạng thái hồ sơ</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt vay</option>
            <option value="REJECTED">Từ chối</option>
            <option value="ACTIVE">Đang trả góp</option>
            <option value="COMPLETED">Đã tất toán</option>
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
                <th className="p-4 font-semibold">Liên hệ</th>
                <th className="p-4 font-semibold">Mẫu xe chọn</th>
                <th className="p-4 font-semibold">Số tiền vay</th>
                <th className="p-4 font-semibold">Kỳ hạn</th>
                <th className="p-4 font-semibold">Lãi suất</th>
                <th className="p-4 font-semibold">Trả trước</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Đang tải danh sách hồ sơ trả góp...
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
                    <td className="p-4 font-semibold text-blue-600">{formatVND(item.loanAmount)}</td>
                    <td className="p-4 text-gray-700 font-medium">{item.loanTermMonths} tháng</td>
                    <td className="p-4 text-gray-700 font-medium">{item.interestRate}%/năm</td>
                    <td className="p-4 text-gray-700">{formatVND(item.downPayment)}</td>
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
                          title="Sửa hồ sơ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteId(item.id)} 
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa hồ sơ"
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
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    Không có hồ sơ vay vốn nào phù hợp.
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
              {editingItem ? 'Cập nhật Hồ sơ Trả góp' : 'Tạo Hồ sơ Vay Trả góp Mới'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!editingItem && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Họ tên khách hàng <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      name="customerName" 
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
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Email liên hệ
                    </label>
                    <input 
                      type="email" 
                      name="customerEmail" 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Mẫu xe vay mua <span className="text-red-500">*</span>
                    </label>
                    <select 
                      required 
                      name="vehicleId" 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">-- Chọn xe --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{getBrandName(v.brand)} {v.model}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Thu nhập hàng tháng (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      type="number" 
                      name="monthlyIncome" 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Số tiền cần vay (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      type="number" 
                      name="loanAmount" 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Kỳ hạn vay (tháng) <span className="text-red-500">*</span>
                    </label>
                    <select 
                      required 
                      name="loanTermMonths" 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="12">12 tháng (1 năm)</option>
                      <option value="24">24 tháng (2 năm)</option>
                      <option value="36">36 tháng (3 năm)</option>
                      <option value="48">48 tháng (4 năm)</option>
                      <option value="60">60 tháng (5 năm)</option>
                      <option value="84">84 tháng (7 năm)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Số tiền trả trước (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      type="number" 
                      name="downPayment" 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Lãi suất ước tính (% / năm) <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  name="interestRate" 
                  defaultValue={editingItem?.interestRate || 7.5} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>
              
              {editingItem && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Trạng thái hồ sơ
                  </label>
                  <select 
                    name="status" 
                    defaultValue={editingItem.status} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="PENDING">Chờ duyệt hồ sơ</option>
                    <option value="APPROVED">Đã duyệt giải ngân</option>
                    <option value="REJECTED">Từ chối thẩm định</option>
                    <option value="ACTIVE">Đang trả góp</option>
                    <option value="COMPLETED">Đã tất toán xong</option>
                  </select>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Ghi chú hồ sơ tín dụng
                </label>
                <textarea 
                  name="notes" 
                  defaultValue={editingItem?.notes || ''} 
                  rows={3} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="Ngân hàng hỗ trợ (Vietcombank, Techcombank, VIB...), tình trạng nợ CIC..."
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
                  {editingItem ? 'Lưu thay đổi' : 'Tạo hồ sơ'}
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
            <h2 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa hồ sơ</h2>
            <p className="text-sm text-gray-600 mb-6">Bạn có chắc chắn muốn xóa hồ sơ trả góp này không?</p>
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

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
