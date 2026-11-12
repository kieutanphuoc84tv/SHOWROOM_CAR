import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Download, Calendar, TrendingUp, DollarSign, ShoppingBag, 
  Users, Activity
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [dateRange, setDateRange] = useState('30'); // days
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  
  // Data state
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, vehiclesData, leadsData, paymentsData] = await Promise.all([
        apiFetch<any>('/api/dashboard/stats').catch(() => ({})),
        apiFetch<any>('/api/vehicles?limit=100').catch(() => []),
        apiFetch<any>('/api/leads').catch(() => []),
        apiFetch<any>('/api/payments').catch(() => []),
      ]);

      setStats(statsData || {});
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : (vehiclesData?.data || []));
      setLeads(Array.isArray(leadsData) ? leadsData : (leadsData?.data || []));
      setPayments(Array.isArray(paymentsData) ? paymentsData : (paymentsData?.data || []));
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu báo cáo:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  };

  const exportToExcel = () => {
    // Generate CSV
    let dataToExport: any[] = [];
    if (activeTab === 'revenue') dataToExport = payments;
    else if (activeTab === 'sales') dataToExport = vehicles.filter((v: any) => v.status === 'Sold');
    else if (activeTab === 'inventory') dataToExport = vehicles;
    else if (activeTab === 'funnel') dataToExport = leads;

    if (!dataToExport.length) return;

    const headers = Object.keys(dataToExport[0] || {}).join(',');
    const rows = dataToExport.map(obj => 
      Object.values(obj).map(val => `"${val}"`).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-${activeTab}-${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process data for charts
  const revenueByMonth = [
    { name: 'T1', value: 4000000000 },
    { name: 'T2', value: 3000000000 },
    { name: 'T3', value: 5000000000 },
    { name: 'T4', value: 4500000000 },
    { name: 'T5', value: 6000000000 },
    { name: 'T6', value: 5500000000 }
  ];

  const paymentMethods = [
    { name: 'Tiền mặt', value: 400 },
    { name: 'Chuyển khoản', value: 300 },
    { name: 'Thẻ tín dụng', value: 300 },
    { name: 'Trả góp', value: 200 }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Phân tích</h1>
          <p className="text-gray-500 text-sm mt-1">Phân tích hiệu quả kinh doanh</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['7', '30', '90', 'all'].map((val) => (
              <button
                key={val}
                onClick={() => setDateRange(val)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  dateRange === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {val === 'all' ? 'Tất cả' : `${val} ngày`}
              </button>
            ))}
          </div>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        {[
          { id: 'revenue', label: 'Doanh thu' },
          { id: 'sales', label: 'Bán hàng' },
          { id: 'funnel', label: 'Phễu Sales' },
          { id: 'inventory', label: 'Tồn kho' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on tab */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'revenue' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tổng doanh thu</p>
                      <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(28000000000)}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp size={16} /> +12% so với kỳ trước
                  </p>
                </div>
                {/* Add 3 more stat cards for revenue */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Doanh thu tháng này</p>
                      <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(5500000000)}</h3>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                      <Calendar size={20} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Số giao dịch</p>
                      <h3 className="text-2xl font-bold text-gray-900">45</h3>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                      <ShoppingBag size={20} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Giá trị TB/giao dịch</p>
                      <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(622000000)}</h3>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                      <Activity size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => `${val / 1000000000} Tỷ`} />
                        <Tooltip formatter={(val: any) => formatCurrency(Number(val) || 0)} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Phương thức thanh toán</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethods}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {paymentMethods.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'sales' && (
            <div>
              {/* Sales dashboard content */}
              <p className="text-gray-500">Đang cập nhật biểu đồ Bán hàng...</p>
            </div>
          )}

          {activeTab === 'funnel' && (
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">Phễu Chuyển đổi Khách hàng</h3>
              
              <div className="space-y-4">
                {/* Funnel Stage 1 */}
                <div className="relative group">
                  <div className="flex items-center justify-between bg-blue-100 rounded-t-lg p-4 mx-0 transition-all">
                    <div className="flex items-center gap-3">
                      <Users className="text-blue-600" />
                      <span className="font-semibold text-blue-900">Lead mới</span>
                    </div>
                    <span className="font-bold text-xl text-blue-900">1,250</span>
                  </div>
                </div>
                
                {/* Funnel Stage 2 */}
                <div className="relative group flex justify-center">
                  <div className="w-[85%] bg-blue-200 p-4 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-blue-900">Đã liên hệ</span>
                    </div>
                    <span className="font-bold text-xl text-blue-900">850</span>
                  </div>
                  <div className="absolute -top-4 right-[15%] bg-white px-2 text-xs font-bold text-gray-500 border rounded-full">68%</div>
                </div>

                {/* Funnel Stage 3 */}
                <div className="relative group flex justify-center">
                  <div className="w-[60%] bg-blue-300 p-4 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-blue-900">Đủ điều kiện</span>
                    </div>
                    <span className="font-bold text-xl text-blue-900">320</span>
                  </div>
                  <div className="absolute -top-4 right-[25%] bg-white px-2 text-xs font-bold text-gray-500 border rounded-full">37%</div>
                </div>

                {/* Funnel Stage 4 */}
                <div className="relative group flex justify-center">
                  <div className="w-[30%] bg-blue-600 rounded-b-lg p-4 transition-all flex items-center justify-between text-white shadow-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">Chốt sale</span>
                    </div>
                    <span className="font-bold text-xl">45</span>
                  </div>
                  <div className="absolute -top-4 right-[40%] bg-white px-2 text-xs font-bold text-gray-500 border rounded-full">14%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              {/* Inventory dashboard content */}
              <p className="text-gray-500">Đang cập nhật biểu đồ Tồn kho...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
