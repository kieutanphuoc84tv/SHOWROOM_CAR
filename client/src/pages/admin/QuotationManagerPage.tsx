import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';
import type { Quotation, Vehicle } from '../../types';

export default function QuotationManagerPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState('');

  const [vehicleId, setVehicleId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [vehiclePrice, setVehiclePrice] = useState('0');
  const [registrationFee, setRegistrationFee] = useState('0');
  const [insuranceFee, setInsuranceFee] = useState('0');
  const [accessories, setAccessories] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'>('DRAFT');
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
      const res = await fetch(`${API_BASE_URL}/api/quotations`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setQuotations(data);
      } else {
        showToast('Không thể tải danh sách báo giá', 'error');
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
      setVehiclePrice(String(p));
      // Tự động tính ước tính lệ phí trước bạ ~10% giá niêm yết
      setRegistrationFee(String(Math.round(p * 0.1)));
      // Ước tính bảo hiểm vật chất ~1.5%
      setInsuranceFee(String(Math.round(p * 0.015)));
    }
  };

  const calculateTotal = () => {
    const vp = parseFloat(vehiclePrice) || 0;
    const rf = parseFloat(registrationFee) || 0;
    const inf = parseFloat(insuranceFee) || 0;
    const acc = parseFloat(accessories) || 0;
    const disc = parseFloat(discount) || 0;
    return Math.max(0, vp + rf + inf + acc - disc);
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditId('');
    setVehicleId('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setVehiclePrice('0');
    setRegistrationFee('0');
    setInsuranceFee('0');
    setAccessories('0');
    setDiscount('0');
    const defaultValid = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setValidUntil(defaultValid);
    setStatus('DRAFT');
    setNotes('');
    setShowModal(true);
  };

  const openEdit = (q: Quotation) => {
    setIsEdit(true);
    setEditId(q.id || q._id || '');
    setVehicleId(q.vehicleId || q.vehicle?.id || q.vehicle?._id || '');
    setCustomerName(q.customerName || '');
    setCustomerPhone(q.customerPhone || '');
    setCustomerEmail(q.customerEmail || '');
    setVehiclePrice(String(q.vehiclePrice || 0));
    setRegistrationFee(String(q.registrationFee || 0));
    setInsuranceFee(String(q.insuranceFee || 0));
    setAccessories(String(q.accessories || 0));
    setDiscount(String(q.discount || 0));
    setValidUntil(q.validUntil ? q.validUntil.split('T')[0] : '');
    setStatus(q.status);
    setNotes(q.notes || '');
    setShowModal(true);
  };

  const handleDelete = async (rawId?: string) => {
    if (!rawId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản báo giá này?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/quotations/${rawId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showToast('Xóa báo giá thành công');
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Xóa thất bại', 'error');
      }
    } catch {
      showToast('Lỗi khi xóa báo giá', 'error');
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
        vehiclePrice,
        registrationFee,
        insuranceFee,
        accessories,
        discount,
        validUntil,
        status,
        notes,
      };

      const url = isEdit
        ? `${API_BASE_URL}/api/quotations/${editId}`
        : `${API_BASE_URL}/api/quotations`;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(isEdit ? 'Cập nhật báo giá thành công' : 'Tạo báo giá thành công');
        setShowModal(false);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Có lỗi xảy ra', 'error');
      }
    } catch {
      showToast('Lỗi khi lưu báo giá', 'error');
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
      case 'SENT':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">Đã gửi KH</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Khách đồng ý</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">Từ chối</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">Hết hạn</span>;
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
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Quản lý Báo giá (Quotations)</h1>
          <p className="text-sm text-gray-500 mt-1">Lập bảng dự toán chi phí lăn bánh, chiết khấu và theo dõi phản hồi của khách hàng</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo bảng báo giá</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Dòng xe</th>
                <th className="p-4 font-medium">Giá xe</th>
                <th className="p-4 font-medium">Tổng tiền lăn bánh</th>
                <th className="p-4 font-medium">Hạn hiệu lực</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Chưa có bảng báo giá nào</td></tr>
              ) : (
                quotations.map((q) => {
                  const recordId = q.id || q._id || '';
                  return (
                    <tr key={recordId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{q.customerName}</p>
                        <p className="text-xs text-gray-500">{q.customerPhone}</p>
                      </td>
                      <td className="p-4 text-gray-700 font-medium">
                        {getBrandName(q.vehicle?.brand)} {q.vehicle?.model || '-'}
                      </td>
                      <td className="p-4 text-gray-600">{formatCurrency(q.vehiclePrice)}</td>
                      <td className="p-4 font-bold text-gray-900">{formatCurrency(q.totalAmount)}</td>
                      <td className="p-4 text-gray-600">
                        {q.validUntil ? new Date(q.validUntil).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="p-4">{getStatusBadge(q.status)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEdit(q)}
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
                {isEdit ? 'Cập nhật Bảng báo giá' : 'Tạo Bảng báo giá mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Chọn xe báo giá *</label>
                <select
                  required
                  value={vehicleId}
                  onChange={(e) => handleSelectVehicle(e.target.value)}
                  className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                >
                  <option value="">-- Chọn xe từ danh mục --</option>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Chi tiết chi phí lăn bánh (VND)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Giá xe niêm yết *</label>
                    <input
                      required
                      type="number"
                      value={vehiclePrice}
                      onChange={(e) => setVehiclePrice(e.target.value)}
                      className="w-full text-sm rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lệ phí trước bạ (~10%)</label>
                    <input
                      type="number"
                      value={registrationFee}
                      onChange={(e) => setRegistrationFee(e.target.value)}
                      className="w-full text-sm rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Bảo hiểm vật chất & TNDS</label>
                    <input
                      type="number"
                      value={insuranceFee}
                      onChange={(e) => setInsuranceFee(e.target.value)}
                      className="w-full text-sm rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Gói phụ kiện chính hãng</label>
                    <input
                      type="number"
                      value={accessories}
                      onChange={(e) => setAccessories(e.target.value)}
                      className="w-full text-sm rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">Ưu đãi / Giảm giá (-)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full text-sm rounded-lg border border-emerald-200 p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-emerald-700 font-medium"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="text-xs text-gray-500 mb-1">Tổng chi phí dự toán:</span>
                    <span className="text-base font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Thời hạn hiệu lực</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Trạng thái báo giá</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-sm rounded-lg border border-gray-200 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="DRAFT">Bản nháp</option>
                    <option value="SENT">Đã gửi khách hàng</option>
                    <option value="ACCEPTED">Khách hàng đồng ý</option>
                    <option value="REJECTED">Khách hàng từ chối</option>
                    <option value="EXPIRED">Hết hạn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú điều khoản</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú khuyến mãi tặng kèm, điều kiện nhận quà..."
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
                  {isEdit ? 'Lưu thay đổi' : 'Tạo bảng báo giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
