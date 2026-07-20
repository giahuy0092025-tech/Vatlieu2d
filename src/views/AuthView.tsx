import React, { useState } from 'react';
import { LogIn, UserPlus, Gamepad2, Chrome, AlertCircle, Loader2 } from 'lucide-react';

interface AuthViewProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  onRegister: (credentials: { email: string; name: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  onGoogleLogin: (googleUser: { email: string; name: string; avatar?: string }) => Promise<{ success: boolean; message?: string }>;
  onCancel: () => void;
}

export default function AuthView({ onLogin, onRegister, onGoogleLogin, onCancel }: AuthViewProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Inputs
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await onLogin({ email, password });
        if (!res.success) {
          setError(res.message || 'Lỗi đăng nhập! Kiểm tra lại email hoặc mật khẩu.');
        }
      } else {
        if (!name.trim()) {
          setError('Vui lòng điền tên hiển thị của bạn!');
          setIsLoading(false);
          return;
        }
        const res = await onRegister({ email, name, password });
        if (!res.success) {
          setError(res.message || 'Đăng ký không thành công! Email có thể đã được sử dụng.');
        }
      }
    } catch (err) {
      setError('Đã xảy ra sự cố đột xuất. Vui lòng kiểm tra lại!');
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth flow simulation
  const handleGoogleSimulate = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await onGoogleLogin({
        email: 'google.artist@gmail.com',
        name: 'Google Artist Demo',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      });
      if (!res.success) {
        setError(res.message || 'Lỗi đăng nhập Google OAuth.');
      }
    } catch (err) {
      setError('Lỗi kết nối với máy chủ Google OAuth.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 md:px-0">
      <div className="bg-[#1E293B] border-2 border-slate-700 rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#881337] relative overflow-hidden">
        
        {/* Animated Background Blob */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F43F5E]/10 rounded-full blur-3xl"></div>

        {/* Brand Logo and Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-linear-to-tr from-[#F43F5E] to-[#FCD34D] rounded-2xl flex items-center justify-center text-white mx-auto shadow-md mb-3 transform rotate-3">
            <Gamepad2 size={24} className="transform -rotate-3 text-slate-900" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-extrabold heading-font text-white uppercase tracking-tight">
            Chào mừng tới AnimateHub
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">
            Đăng nhập để đóng góp và tải lên tài nguyên 2D của bạn!
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-slate-950/40 rounded-2xl border border-slate-800 mb-6">
          <button
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase ${
              activeTab === 'login'
                ? 'bg-[#F43F5E] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn size={14} />
            <span>Đăng nhập</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase ${
              activeTab === 'register'
                ? 'bg-[#F43F5E] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus size={14} />
            <span>Đăng ký</span>
          </button>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 heading-font">
              Địa chỉ Email
            </label>
            <input
              type="email"
              required
              placeholder="ten-cua-ban@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 bg-[#1E293B] border-2 border-slate-700 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-[#F43F5E]/20 focus:border-[#F43F5E] transition-all font-semibold"
            />
          </div>

          {/* Display name (only for Register) */}
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 heading-font">
                Tên hiển thị / Nickname
              </label>
              <input
                type="text"
                placeholder="GameArtist99"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-4 bg-[#1E293B] border-2 border-slate-700 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-[#F43F5E]/20 focus:border-[#F43F5E] transition-all font-semibold"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 heading-font">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 bg-[#1E293B] border-2 border-slate-700 rounded-xl text-sm placeholder-[#1E293B]/60 text-white focus:outline-none focus:ring-2 focus:ring-[#F43F5E]/20 focus:border-[#F43F5E] transition-all font-semibold"
            />
          </div>

          {/* Demo account notice (only for Login) */}
          {activeTab === 'login' && (
            <div className="text-[10px] text-[#38BDF8] bg-[#38BDF8]/5 p-2.5 rounded-lg border border-[#38BDF8]/20 leading-relaxed select-none">
              💡 <strong>Tài khoản dùng thử có sẵn:</strong><br />
              • Admin: <code className="font-mono text-white bg-slate-800 px-1 rounded">admin@animatehub.com</code> / mk: <code className="font-mono text-white bg-slate-800 px-1 rounded">admin123</code><br />
              • Thành viên: <code className="font-mono text-white bg-slate-800 px-1 rounded">user@animatehub.com</code> / mk: <code className="font-mono text-white bg-slate-800 px-1 rounded">user123</code>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#F43F5E] hover:bg-[#E11D48] disabled:opacity-60 text-white font-extrabold rounded-xl border-b-4 border-[#881337] active:border-b-0 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 uppercase tracking-wide text-xs"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : activeTab === 'login' ? (
              <span>Đăng nhập ngay</span>
            ) : (
              <span>Đăng ký ngay</span>
            )}
          </button>

        </form>

        {/* OR DIVIDER */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Hoặc</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        {/* Google OAuth Simulation Button */}
        <button
          type="button"
          onClick={handleGoogleSimulate}
          disabled={isLoading}
          className="w-full h-11 border-2 border-slate-700 bg-slate-850 hover:bg-slate-800 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Chrome size={16} className="text-[#F43F5E]" />
          <span>Tiếp tục với Google OAuth</span>
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-center text-xs font-bold text-slate-400 hover:text-white mt-5 transition-colors cursor-pointer uppercase tracking-wider"
        >
          Trở lại sau
        </button>

      </div>
    </div>
  );
}
