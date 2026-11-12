import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch<any>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!data?.token) {
        throw new Error('Máy chủ không trả về phiên đăng nhập hợp lệ');
      }

      // Lưu Token và User vào localStorage
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));

      // Chuyển hướng vào Admin Dashboard
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/30 text-white mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">NEXUS AUTO ADMIN</h1>
          <p className="text-sm text-slate-400 mt-1">Cổng quản trị hệ thống showroom ô tô</p>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Email quản trị
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nexusauto.vn"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  Đăng nhập quản trị <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-500">
              Chỉ dành cho cán bộ quản lý và nhân viên showroom Nexus Auto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
