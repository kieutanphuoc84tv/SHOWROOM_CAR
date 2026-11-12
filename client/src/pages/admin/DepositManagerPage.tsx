import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';
import type { Deposit, Vehicle } from '../../types';

export default function DepositManagerPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState('');

  const [vehicleId, setVehicleId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState<'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'REFUNDED'>('PENDING');
  const [notes, setNotes] = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
    fetchVehicles();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getBrandName = (brand: any): string => {
    if (!brand) return '';
    if (typeof brand === 'object' && brand.name) return brand.name;
    if (typeof brand === 'string') return brand;
    return '';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/deposits`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDeposits(data);
      } else {
        showToast('Không thể tải danh sách đặt cọc', 'error');
      }
    } catch {
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/vehicles`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];
        setVehicles(list);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditId('');
    setVehicleId('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setAmount('');
    const defaultExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setExpiresAt(defaultExpiry);
    setStatus('PENDING');
    setNotes('');
    setShowModal(true);
  };

  const openEdit = (d: Deposit) => {
    setIsEdit(true);
    setEditId(d.id || d._id || '');
    setVehicleId(d.vehicleId || d.vehicle?.id || d.vehicle?._id || '');
    setCustomerName(d.customerName || '');
    setCustomerPhone(d.customerPhone || '');
    setCustomerEmail(d.customerEmail || '');
    setAmount(String(d.amount || ''));
    setExpiresAt(d.expiresAt ? d.expiresAt.split('T')[0] : '');
    setStatus(d.status);
    setNotes(d.notes || '');
    setShowModal(true);
  };

  const handleDelete = async (rawId?: string) => {
    if (!rawId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa phiếu đặt cọc này?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/deposits/${rawId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showToast('Xóa đặt cọc thành công');
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Xóa thất bại', 'error');
      }
    } catch {
      showToast('Lỗi khi xóa đặt cọc', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        status,
        notes,
      };

      if (!isEdit) {
        payload.vehicleId = vehicleId;
        payload.customerName = customerName;
        payload.customerPhone = customerPhone;
        payload.customerEmail = customerEmail;
        payload.amount = amount;
        payload.expiresAt = expiresAt;
      } else if (expiresAt) {
        payload.expiresAt = expiresAt;
      }

      const url = isEdit
        ? `${API_BASE_URL}/api/deposits/${editId}`
        : `${API_BASE_URL}/api/deposits`;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(isEdit ? 'Cập nhật thành công' : 'Tạo đặt cọc thành công');
        setShowModal(false);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Có lỗi xảy ra', 'error');
      }
    } catch {
      showToast('Lỗi khi lưu dữ liệu', 'error');
    }
  };

  const formatCurrency = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Đã nhận cọc</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-600 border border-gray-200">Hết hạn</span>;
      case 'REFUNDED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">Đã hoàn cọc</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{st}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Quản lý Đặt cọc (Deposits)</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi các giao dịch giữ chỗ xe và thời hạn cọc của khách hàng</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo phiếu cọc</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Xe đặt cọc</th>
                <th className="p-4 font-medium">Số tiền cọc</th>
                <th className="p-4 font-medium">Hạn giữ cọc</th>
                <th className="p-4 font-medium">Nhân viên tạo</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : deposits.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Chưa có phiếu đặt cọc nào</td></tr>
              ) : (
                deposits.map((d) => {
                  const recordId = d.id || d._id || '';
                  return (
                    <tr key={recordId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{d.customerName}</p>
                        <p className="text-xs text-gray-500">{d.customerPhone}</p>
                      </td>
                      <td className="p-4 text-gray-700 font-medium">
                        {getBrandName(d.vehicle?.brand)} {d.vehicle?.model || '-'}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">{formatCurrency(d.amount)}</td>
                      <td className="p-4 text-gray-600">
                        {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="p-4 text-gray-600">
                        {d.createdBy?.fullName || (d.createdBy as any)?.name || 'Hệ thống'}
                      </td>
                      <td className="p-4">{getStatusBadge(d.status)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEdit(d)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Cập nhật"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(recordId)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEdit ? 'Cập nhật Phiếu đặt cọc' : 'Tạo Phiếu đặt cọc mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {!isEdit ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Chọn xe cần cọc *</label>
                    <select
                      required
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                      className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                    >
                      <option value="">-- Chọn xe từ kho --</option>
                      {vehicles.map((v) => {
                        const vId = v.id || v._id || '';
                        return (
                          <option key={vId} value={vId}>
                            {getBrandName(v.brand)} {v.model} - {formatCurrency(v.price)} ({v.status})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                      <input
                        required
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Số điện thoại *</label>
                      <input
                        required
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Số tiền cọc (VND) *</label>
                      <input
                        required
                        type="number"
                        min="1000000"
                        step="500000"
                        placeholder="VD: 50000000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 space-y-1">
                  <p><span className="font-medium">Khách hàng:</span> {customerName} - {customerPhone}</p>
                  <p><span className="font-medium">Số tiền cọc:</span> {formatCurrency(amount)}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hạn giữ chỗ cọc</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Trạng thái cọc</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã nhận cọc (Giữ xe)</option>
                    <option value="EXPIRED">Hết hạn (Nhả xe)</option>
                    <option value="REFUNDED">Đã hoàn cọc (Nhả xe)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú điều khoản, thời gian nhận xe dự kiến..."
                  className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  {isEdit ? 'Lưu thay đổi' : 'Tạo đặt cọc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
