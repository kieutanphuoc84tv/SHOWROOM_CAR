import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';
import type { Invoice, Vehicle } from '../../types';

export default function InvoiceManagerPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState('');

  const [vehicleId, setVehicleId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [subtotal, setSubtotal] = useState('0');
  const [tax, setTax] = useState('0');
  const [status, setStatus] = useState<'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED'>('DRAFT');
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
      const res = await fetch(`${API_BASE_URL}/api/invoices`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      } else {
        showToast('Không thể tải danh sách hóa đơn', 'error');
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

  const handleSelectVehicle = (vId: string) => {
    setVehicleId(vId);
    const selected = vehicles.find((v) => (v.id || v._id) === vId);
    if (selected) {
      const p = Number(selected.price) || 0;
      setSubtotal(String(p));
      // Thuế VAT 10%
      setTax(String(Math.round(p * 0.1)));
    }
  };

  const calculateTotal = () => {
    const sub = parseFloat(subtotal) || 0;
    const t = parseFloat(tax) || 0;
    return sub + t;
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditId('');
    setVehicleId('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerAddress('');
    setSubtotal('0');
    setTax('0');
    setStatus('DRAFT');
    setNotes('');
    setShowModal(true);
  };

  const openEdit = (inv: Invoice) => {
    setIsEdit(true);
    setEditId(inv.id || inv._id || '');
    setVehicleId(inv.vehicleId || inv.vehicle?.id || inv.vehicle?._id || '');
    setCustomerName(inv.customerName || '');
    setCustomerPhone(inv.customerPhone || '');
    setCustomerEmail(inv.customerEmail || '');
    setCustomerAddress(inv.customerAddress || '');
    setSubtotal(String(inv.subtotal || 0));
    setTax(String(inv.tax || 0));
    setStatus(inv.status);
    setNotes(inv.notes || '');
    setShowModal(true);
  };

  const handleDelete = async (rawId?: string) => {
    if (!rawId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này khỏi hệ thống?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices/${rawId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showToast('Xóa hóa đơn thành công');
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Xóa thất bại', 'error');
      }
    } catch {
      showToast('Lỗi khi xóa hóa đơn', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        vehicleId,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        subtotal,
        tax,
        status,
        notes,
      };

      const url = isEdit
        ? `${API_BASE_URL}/api/invoices/${editId}`
        : `${API_BASE_URL}/api/invoices`;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(isEdit ? 'Cập nhật hóa đơn thành công' : 'Xuất hóa đơn thành công');
        setShowModal(false);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Có lỗi xảy ra', 'error');
      }
    } catch {
      showToast('Lỗi khi lưu hóa đơn', 'error');
    }
  };

  const formatCurrency = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">Bản nháp</span>;
      case 'ISSUED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">Đã phát hành</span>;
      case 'PAID':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Đã thanh toán</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">Đã hủy bỏ</span>;
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
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Quản lý Hóa đơn & Chứng từ (Invoices)</h1>
          <p className="text-sm text-gray-500 mt-1">Xuất và quản lý hóa đơn mua bán xe, theo dõi tình trạng thanh toán và thuế VAT</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Lập hóa đơn mới</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-medium">Số hóa đơn</th>
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Xe giao dịch</th>
                <th className="p-4 font-medium">Tổng tiền (kèm VAT)</th>
                <th className="p-4 font-medium">Ngày lập</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Chưa có hóa đơn nào</td></tr>
              ) : (
                invoices.map((inv) => {
                  const recordId = inv.id || inv._id || '';
                  return (
                    <tr key={recordId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{inv.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{inv.customerName}</p>
                        <p className="text-xs text-gray-500">{inv.customerPhone}</p>
                      </td>
                      <td className="p-4 text-gray-700 font-medium">
                        {getBrandName(inv.vehicle?.brand)} {inv.vehicle?.model || '-'}
                      </td>
                      <td className="p-4 font-bold text-gray-900">{formatCurrency(inv.totalAmount)}</td>
                      <td className="p-4 text-gray-600">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="p-4">{getStatusBadge(inv.status)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEdit(inv)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 my-8">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEdit ? 'Cập nhật Hóa đơn' : 'Lập Hóa đơn mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Xe bán ra *</label>
                <select
                  required
                  value={vehicleId}
                  onChange={(e) => handleSelectVehicle(e.target.value)}
                  className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                >
                  <option value="">-- Chọn xe giao dịch --</option>
                  {vehicles.map((v) => {
                    const vId = v.id || v._id || '';
                    return (
                      <option key={vId} value={vId}>
                        {getBrandName(v.brand)} {v.model} ({formatCurrency(v.price)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tên khách hàng / Tổ chức *</label>
                  <input
                    required
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Số điện thoại liên hệ *</label>
                  <input
                    required
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email nhận hóa đơn</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Địa chỉ đăng ký xe</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Chi phí thanh toán hóa đơn</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tiền trước thuế (VND) *</label>
                    <input
                      required
                      type="number"
                      value={subtotal}
                      onChange={(e) => setSubtotal(e.target.value)}
                      className="w-full text-sm rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Thuế VAT (10%)</label>
                    <input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      className="w-full text-sm rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="text-xs text-gray-500 mb-1">Tổng cộng thanh toán:</span>
                    <span className="text-base font-bold text-emerald-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Trạng thái hóa đơn</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="DRAFT">Bản nháp</option>
                    <option value="ISSUED">Đã xuất hóa đơn</option>
                    <option value="PAID">Đã thanh toán (Chuyển xe thành SOLD)</option>
                    <option value="CANCELLED">Đã hủy bỏ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú hóa đơn</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mã số thuế, hình thức chuyển khoản..."
                    className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
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
                  {isEdit ? 'Lưu thay đổi' : 'Lập hóa đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
