import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Car, Users, CalendarClock, Landmark, 
  CreditCard, Receipt, FileText, FileCheck, Settings, 
  Bell, Menu, X, LogOut, Loader2, BarChart3
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface User {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  role: string;
}

export default function AdminLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await apiFetch<any>('/api/auth/me');
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
        } else {
          throw new Error('Chưa đăng nhập');
        }
      } catch (error) {
        // Bỏ login: tự động gán tài khoản Quản trị viên Showroom để vào thẳng dashboard
        const defaultAdmin: User = {
          id: 'admin-nexus',
          fullName: 'Quản trị viên Showroom',
          email: 'admin@nexusauto.vn',
          role: 'ADMIN'
        };
        setUser(defaultAdmin);
        localStorage.setItem('admin_user', JSON.stringify(defaultAdmin));
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Kho xe', icon: Car, path: '/admin/vehicles' },
    { name: 'Khách hàng', icon: Users, path: '/admin/leads' },
    { name: 'Lái thử', icon: CalendarClock, path: '/admin/test-drives' },
    { name: 'Trả góp', icon: Landmark, path: '/admin/finance' },
    { name: 'Thanh toán', icon: CreditCard, path: '/admin/payments' },
    { name: 'Đặt cọc', icon: Receipt, path: '/admin/deposits' },
    { name: 'Báo giá', icon: FileText, path: '/admin/quotations' },
    { name: 'Hóa đơn', icon: FileCheck, path: '/admin/invoices' },
    { name: 'Báo cáo', icon: BarChart3, path: '/admin/reports' },
    { name: 'Cài đặt', icon: Settings, path: '/admin/settings' },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="mb-4 text-2xl font-bold tracking-tight">
            <span className="text-gray-900">NEXUS</span>
            <span className="text-blue-500">AUTO</span>
          </div>
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="mt-4 text-sm text-gray-500">Đang đồng bộ phân quyền...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Admin';
  const getInitials = (name: string) => {
    if (!name) return 'A';
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50/80 flex flex-col font-sans">
      {/* Horizontal Navbar */}
      <header className="h-14 bg-white border-b border-gray-200 shadow-sm fixed top-0 w-full z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none p-1"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/admin/dashboard" className="text-lg font-bold tracking-tight shrink-0 hidden lg:block w-48">
            <span className="text-gray-900">NEXUS</span>
            <span className="text-blue-600">AUTO</span>
          </Link>
          <Link to="/admin/dashboard" className="text-lg font-bold tracking-tight shrink-0 lg:hidden">
            <span className="text-gray-900">N</span>
            <span className="text-blue-600">A</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1 ml-4">
            <Link to="/admin/dashboard" className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors">Dashboard</Link>
            <Link to="/admin/vehicles" className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors">Kho xe</Link>
            <Link to="/admin/leads" className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors">Khách hàng</Link>
            <Link to="/admin/payments" className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors">Thanh toán</Link>
            <Link to="/" target="_blank" className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-full transition-colors">Xem Website</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 focus:outline-none p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-200">
                {getInitials(displayName)}
              </div>
              <span className="text-xs font-medium text-gray-700 hidden sm:inline">{displayName}</span>
            </button>
            
            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-1 border border-gray-100 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@nexusauto.vn'}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {user?.role || 'ADMIN'}
                    </span>
                  </div>
                  <Link
                    to="/admin/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-500" /> Cài đặt hệ thống
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors border-t border-gray-50"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 pt-14 h-full">
        {/* Compact Sidebar (Desktop) */}
        <aside 
          className={`hidden lg:flex flex-col bg-white border-r border-gray-200 fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-30 transition-all duration-300 ${sidebarExpanded ? 'w-56' : 'w-16'}`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center rounded-lg transition-colors group relative ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={!sidebarExpanded ? item.name : undefined}
                >
                  <div className={`flex items-center justify-center w-12 h-10 shrink-0 ${isActive ? 'border-l-3 border-blue-600' : 'border-l-3 border-transparent'}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={`whitespace-nowrap font-medium text-sm transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100 w-auto pr-4' : 'opacity-0 w-0 overflow-hidden'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative w-64 bg-white h-full flex flex-col shadow-xl z-50">
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="text-lg font-bold tracking-tight">
                  <span className="text-gray-900">NEXUS</span>
                  <span className="text-blue-600">AUTO</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-900 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                          : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content Box */}
        <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'lg:pl-56' : 'lg:pl-16'}`}>
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
}
