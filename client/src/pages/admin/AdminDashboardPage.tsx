import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, Users, Calendar, DollarSign, Loader2, ArrowRight, AlertCircle, RefreshCw,
  FileCheck, ShieldAlert
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { apiFetch } from '../../lib/api';

interface DashboardStats {
  vehicles: { total: number; available: number; sold: number; reserved: number };
  leads: { total: number; new: number; converted: number };
  testDrives: { total: number; pending: number };
  finance: { total: number; pending: number };
  payments: { total: number; completed: number; totalRevenue: number };
  deposits: { total: number; pending: number };
  quotations: { total: number; draft: number };
  invoices: { total: number; paid: number };
  recentLeads: Array<{
    id: string | number;
    guestName?: string | null;
    guestPhone?: string | null;
    type?: string;
    status?: string;
    createdAt: string;
    customer?: { fullName?: string; phone?: string } | null;
    vehicle?: { model?: string; brand?: { name?: string } | string } | null;
  }>;
  recentTestDrives: Array<{
    id: string | number;
    customerName?: string;
    customerPhone?: string;
    scheduledDate?: string;
    date?: string;
    status?: string;
    vehicle?: { model?: string; brand?: { name?: string } | string } | null;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Lấy thông tin user đăng nhập nếu có
  const storedUser = localStorage.getItem('admin_user');
  let userName = 'Quản trị viên';
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      userName = parsed.fullName || parsed.email || 'Quản trị viên';
    } catch {
      // ignore
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiFetch<DashboardStats>('/api/dashboard/stats');
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Không thể kết nối đến máy chủ lấy dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch {
      return dateString;
    }
  };

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Gần đây';
    try {
      const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
      const daysDifference = Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysDifference === 0) return 'Hôm nay';
      return rtf.format(daysDifference, 'day');
    } catch {
      return 'Gần đây';
    }
  };

  const getBrandName = (brand: any) => {
    if (!brand) return '';
    if (typeof brand === 'string') return brand;
    return brand.name || '';
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">Đang đồng bộ dữ liệu hệ thống Nexus Auto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl max-w-xl mx-auto my-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <div>
          <h2 className="text-lg font-bold text-red-800">Lỗi kết nối Dashboard</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Thử lại
        </button>
      </div>
    );
  }

  if (!stats) return null;

  // Chart Data preparation
  const vehicleChartData = [
    { name: 'Sẵn bán', value: stats.vehicles?.available || 0, color: '#10b981' },
    { name: 'Đã đặt', value: stats.vehicles?.reserved || 0, color: '#f59e0b' },
    { name: 'Đã bán', value: stats.vehicles?.sold || 0, color: '#f43f5e' },
  ];

  const activityChartData = [
    { name: 'Khách hàng', value: stats.leads?.total || 0 },
    { name: 'Lái thử', value: stats.testDrives?.total || 0 },
    { name: 'Trả góp', value: stats.finance?.total || 0 },
    { name: 'Thanh toán', value: stats.payments?.total || 0 },
    { name: 'Đặt cọc', value: stats.deposits?.total || 0 },
    { name: 'Báo giá', value: stats.quotations?.total || 0 },
    { name: 'Hóa đơn', value: stats.invoices?.total || 0 },
  ];

  const currentDate = new Intl.DateTimeFormat('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xin chào, {userName}</h1>
          <p className="text-sm text-gray-500 mt-1">Hôm nay là {currentDate}. Chúc bạn một ngày làm việc hiệu quả.</p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Đồng bộ số liệu
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vehicles */}
        <Link to="/admin/vehicles" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-start justify-between group hover:border-blue-200 hover:shadow-md transition-all">
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng xe trong kho</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.vehicles?.total || 0}</p>
            <p className="text-xs text-blue-600 mt-1 flex items-center font-medium">
              Xem danh sách kho <ArrowRight className="w-3 h-3 ml-0.5" />
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600 group-hover:bg-blue-100 transition-colors">
            <Car className="w-5 h-5" />
          </div>
        </Link>

        {/* Available Vehicles */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-start justify-between group hover:border-emerald-200 transition-all">
          <div>
            <p className="text-sm font-medium text-gray-500">Xe sẵn sàng giao</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.vehicles?.available || 0}</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              Đang mở bán ({stats.vehicles?.reserved || 0} đang cọc)
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            <Car className="w-5 h-5" />
          </div>
        </div>

        {/* Total Revenue */}
        <Link to="/admin/invoices" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-start justify-between group hover:border-amber-200 hover:shadow-md transition-all">
          <div>
            <p className="text-sm font-medium text-gray-500">Doanh thu đã thu</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate max-w-[180px]">
              {formatVND(stats.payments?.totalRevenue || 0)}
            </p>
            <p className="text-xs text-amber-600 mt-1 flex items-center font-medium">
              {stats.payments?.completed || 0} giao dịch thành công
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-full text-amber-600 group-hover:bg-amber-100 transition-colors">
            <DollarSign className="w-5 h-5" />
          </div>
        </Link>

        {/* New Leads */}
        <Link to="/admin/leads" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-start justify-between group hover:border-purple-200 hover:shadow-md transition-all">
          <div>
            <p className="text-sm font-medium text-gray-500">Khách hàng mới</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.leads?.new || 0}</p>
            <p className="text-xs text-purple-600 mt-1 flex items-center font-medium">
              Tổng {stats.leads?.total || 0} tiềm năng
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-full text-purple-600 group-hover:bg-purple-100 transition-colors">
            <Users className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles Status Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tình trạng kho xe</h2>
            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
              Tổng {stats.vehicles?.total || 0} xe
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleChartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} xe`, 'Số lượng']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overview Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tổng quan hoạt động kinh doanh</h2>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Thực tế từ Neon DB
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Khách hàng mới nhất</h2>
            <Link to="/admin/leads" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-2">
            {stats.recentLeads && stats.recentLeads.length > 0 ? (
              <ul className="divide-y divide-gray-50">
                {stats.recentLeads.map((lead) => {
                  const leadName = lead.guestName || lead.customer?.fullName || 'Khách hàng';
                  const leadPhone = lead.guestPhone || lead.customer?.phone || 'Chưa có SĐT';
                  const vehicleText = lead.vehicle ? `${getBrandName(lead.vehicle.brand)} ${lead.vehicle.model || ''}`.trim() : 'Tư vấn chung';
                  const avatarLetter = (leadName.trim().charAt(0) || 'K').toUpperCase();

                  return (
                    <li key={lead.id} className="p-4 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {avatarLetter}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{leadName}</p>
                        <p className="text-xs text-gray-500 truncate">{leadPhone}</p>
                        <p className="text-xs text-blue-600 mt-0.5 truncate flex items-center gap-1">
                          <Car className="w-3 h-3" /> {vehicleText}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mb-1">
                          {lead.type || 'Cá nhân'}
                        </span>
                        <p className="text-xs text-gray-400 block">{getRelativeTime(lead.createdAt)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">Chưa có khách hàng tiềm năng nào</div>
            )}
          </div>
        </div>

        {/* Recent Test Drives */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Lịch lái thử gần đây</h2>
            <Link to="/admin/test-drives" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-2">
            {stats.recentTestDrives && stats.recentTestDrives.length > 0 ? (
              <ul className="divide-y divide-gray-50">
                {stats.recentTestDrives.map((td) => {
                  const statusColors: Record<string, string> = {
                    PENDING: 'bg-amber-100 text-amber-800',
                    CONFIRMED: 'bg-blue-100 text-blue-800',
                    COMPLETED: 'bg-emerald-100 text-emerald-800',
                    CANCELLED: 'bg-red-100 text-red-800'
                  };
                  const statusLabels: Record<string, string> = {
                    PENDING: 'Chờ duyệt',
                    CONFIRMED: 'Đã xác nhận',
                    COMPLETED: 'Hoàn thành',
                    CANCELLED: 'Đã hủy'
                  };
                  const tdStatus = (td.status || 'PENDING').toUpperCase();
                  const statusClass = statusColors[tdStatus] || statusColors.PENDING;
                  const statusLabel = statusLabels[tdStatus] || tdStatus;

                  const customerName = td.customerName || 'Khách hàng';
                  const vehicleText = td.vehicle 
                    ? `${getBrandName(td.vehicle.brand)} ${td.vehicle.model || ''}`.trim() 
                    : 'Chưa chọn xe';
                  const testDate = td.scheduledDate || td.date;

                  return (
                    <li key={td.id} className="p-4 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-600 shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{customerName}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-1">
                            <Car className="w-3 h-3 text-blue-500 shrink-0" /> {vehicleText}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(testDate)}</p>
                        </div>
                      </div>
                      <div className="shrink-0 ml-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">Chưa có lịch hẹn lái thử nào</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
