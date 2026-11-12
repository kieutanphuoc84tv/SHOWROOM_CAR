import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, X, Plus, DollarSign, CreditCard, ArrowDownRight, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface Vehicle {
  id: string;
  model: string;
  brand?: { name: string } | string;
}

interface Payment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'INSTALLMENT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId: string | null;
  notes: string | null;
  vehicleId: string;
  vehicle?: Vehicle | null;
  createdAt: string;
}

export default function PaymentManagerPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Payment | null>(null);
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
      const [pRes, vRes] = await Promise.all([
        apiFetch<Payment[]>('/api/payments'),
        apiFetch<any>('/api/vehicles?limit=100').catch(() => []),
      ]);
      setPayments(pRes || []);
      const vehicleList = Array.isArray(vRes) ? vRes : (vRes?.data || []);
      setVehicles(vehicleList);
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải dữ liệu thanh toán', 'error');
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
    
    if (payload.amount) payload.amount = Number(payload.amount) as any;

    try {
      const endpoint = editingItem 
        ? `/api/payments/${editingItem.id}` 
        : `/api/payments`;
      const method = editingItem ? 'PUT' : 'POST';

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      showToast(editingItem ? 'Cập nhật giao dịch thành công' : 'Ghi nhận thanh toán mới thành công');
      setIsModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi lưu thanh toán', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/payments/${deleteId}`, {
        method: 'DELETE',
      });
      showToast('Đã xóa phiếu thu thanh toán');
      setDeleteId(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi xóa', 'error');
    }
  };

  const filteredData = payments.filter(item => {
    const query = searchTerm.toLowerCase();
    const name = (item.customerName || '').toLowerCase();
    const phone = item.customerPhone || '';
    const txId = (item.transactionId || '').toLowerCase();
    const car = item.vehicle ? `${getBrandName(item.vehicle.brand)} ${item.vehicle.model}`.toLowerCase() : '';

    const matchesSearch = name.includes(query) || phone.includes(query) || txId.includes(query) || car.includes(query);
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return { text: 'Chờ duyệt', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'COMPLETED': return { text: 'Thành công', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'FAILED': return { text: 'Thất bại', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'REFUNDED': return { text: 'Đã hoàn tiền', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      default: return { text: status, bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getMethodLabel = (method: string) => {
    switch(method) {
      case 'CASH': return 'Tiền mặt';
      case 'BANK_TRANSFER': return 'Chuyển khoản';
      case 'CREDIT_CARD': return 'Thẻ tín dụng / POS';
      case 'INSTALLMENT': return 'Giải ngân ngân hàng';
      default: return method;
    }
  };

  const stats = {
    total: payments.length,
    completed: payments.filter(i => i.status === 'COMPLETED').length,
    pending: payments.filter(i => i.status === 'PENDING').length,
    revenue: payments.filter(i => i.status === 'COMPLETED').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Thanh toán & Dòng tiền</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi các khoản thanh toán, chuyển khoản và đối soát doanh thu</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Tạo phiếu thu mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Tổng giao dịch</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          <p className="text-xs text-gray-400 mt-1">Giao dịch đã tạo</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">Thành công</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</div>
          <p className="text-xs text-emerald-600 mt-1">Đã vào tài khoản</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-amber-600 uppercase">Đang chờ xử lý</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</div>
          <p className="text-xs text-amber-600 mt-1">Chờ đối soát</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold tracking-wider text-blue-600 uppercase">Tổng doanh thu thực nhận</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">
            {formatVND(stats.revenue)}
          </div>
          <p className="text-xs text-blue-600 mt-1">Tiền thực tế</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm theo tên khách, SĐT, mã giao dịch, xe..."
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
            <option value="PENDING">Đang chờ</option>
            <option value="COMPLETED">Thành công</option>
            <option value="FAILED">Thất bại</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Liên hệ</th>
                <th className="p-4 font-semibold">Xe giao dịch</th>
                <th className="p-4 font-semibold">Số tiền</th>
                <th className="p-4 font-semibold">Phương thức</th>
                <th className="p-4 font-semibold">Mã GD</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold">Ngày thanh toán</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Đang tải dữ liệu thanh toán...
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
                    <td className="p-4 font-bold text-emerald-600">{formatVND(item.amount)}</td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {getMethodLabel(item.method)}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-500">{item.transactionId || '—'}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => { setEditingItem(item); setIsModalOpen(true); }} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa giao dịch"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteId(item.id)} 
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa phiếu thu"
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
                    Không tìm thấy phiếu thu nào phù hợp.
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
              {editingItem ? 'Cập nhật Phiếu thu' : 'Tạo Phiếu thu Thanh toán'}
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
                      Mẫu xe thanh toán <span className="text-red-500">*</span>
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
                      Số tiền thanh toán (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      type="number" 
                      name="amount" 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Phương thức thanh toán <span className="text-red-500">*</span>
                    </label>
                    <select 
                      required 
                      name="method" 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                      <option value="CASH">Tiền mặt tại showroom</option>
                      <option value="CREDIT_CARD">Thẻ tín dụng / Quẹt POS</option>
                      <option value="INSTALLMENT">Giải ngân ngân hàng (Trả góp)</option>
                    </select>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Mã giao dịch / Mã bút toán ngân hàng
                </label>
                <input 
                  name="transactionId" 
                  defaultValue={editingItem?.transactionId || ''} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" 
                  placeholder="VD: FT240501892837"
                />
              </div>

              {editingItem && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Trạng thái thanh toán
                  </label>
                  <select 
                    name="status" 
                    defaultValue={editingItem.status} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="PENDING">Đang chờ đối soát</option>
                    <option value="COMPLETED">Thành công (Đã nhận tiền)</option>
                    <option value="FAILED">Thất bại</option>
                    <option value="REFUNDED">Đã hoàn tiền lại khách</option>
                  </select>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Ghi chú phiếu thu
                </label>
                <textarea 
                  name="notes" 
                  defaultValue={editingItem?.notes || ''} 
                  rows={3} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="Ghi chú đợt thanh toán (đợt 1 đặt cọc, đợt 2 lấy xe, thu tiền bấm biển...)"
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
                  {editingItem ? 'Lưu thay đổi' : 'Ghi nhận phiếu thu'}
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
            <h2 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa phiếu thu</h2>
            <p className="text-sm text-gray-600 mb-6">Bạn có chắc chắn muốn xóa giao dịch thanh toán này không?</p>
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
