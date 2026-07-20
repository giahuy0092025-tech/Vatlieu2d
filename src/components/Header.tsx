import React, { useState } from 'react';
import { Search, UploadCloud, LogIn, User as UserIcon, Sun, Moon, LogOut, ShieldCheck, Gamepad2 } from 'lucide-react';
import { User } from '../types';
import { useTheme } from './ThemeContext';

interface HeaderProps {
  currentUser: User | null;
  onSearch: (query: string) => void;
  onNavigate: (view: 'home' | 'upload' | 'auth' | 'profile', targetId?: string) => void;
  onLogout: () => void;
  onSwitchRole: (role: 'guest' | 'user' | 'admin') => void;
}

export default function Header({ currentUser, onSearch, onNavigate, onLogout, onSwitchRole }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [searchVal, setSearchVal] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearch(e.target.value); // Instant search as they type
  };

  return (
    <header className="w-full h-20 bg-[#1E293B] border-b-4 border-[#F43F5E] sticky top-0 z-40 px-4 md:px-8">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
        
        {/* LOGO */}
        <div 
          onClick={() => {
            setSearchVal('');
            onSearch('');
            onNavigate('home');
          }}
          className="flex items-center gap-4 cursor-pointer group flex-shrink-0 animate-fade-in"
        >
          <div className="w-12 h-12 bg-[#F43F5E] rounded-xl flex items-center justify-center border-2 border-white shadow-[4px_4px_0px_#881337] group-hover:scale-105 transition-transform duration-200">
            <span className="text-2xl font-black text-white heading-font">A</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase heading-font select-none">
            Animate<span className="text-[#F43F5E]">Hub</span>
          </h1>
        </div>

        {/* SEARCH BAR (Instant filtering) */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-4 md:mx-12 hidden md:block">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search size={18} strokeWidth={2.5} />
            </span>
            <input
              type="text"
              placeholder="Search for sprites, backgrounds, or sound effects..."
              value={searchVal}
              onChange={handleSearchChange}
              className="w-full bg-[#334155] border-2 border-slate-600 pl-11 pr-5 py-2.5 rounded-full text-sm focus:outline-none focus:border-[#F43F5E] text-white placeholder-slate-400 transition-all focus:ring-0"
            />
          </div>
        </form>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* QUICK ROLE SWITCHER FOR DEMO/TESTING */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#334155] hover:bg-[#475569] text-white border border-slate-600 transition-colors cursor-pointer"
              title="Nhấp để thay đổi quyền nhanh chóng để chạy thử nghiệm!"
            >
              <ShieldCheck size={14} className="text-[#38BDF8]" />
              <span className="hidden sm:inline">Role:</span>
              <span className="capitalize text-[#38BDF8] font-black">{currentUser?.role || 'Guest'}</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1E293B] border-2 border-slate-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                <p className="text-[10px] text-slate-400 px-3 py-1 font-bold uppercase tracking-wider select-none border-b border-slate-800 mb-1">
                  Đổi Quyền Thử Nghiệm
                </p>
                <button
                  onClick={() => {
                    onSwitchRole('guest');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#334155] flex items-center justify-between cursor-pointer ${
                    !currentUser ? 'text-[#F43F5E] bg-[#334155]/50' : 'text-slate-300'
                  }`}
                >
                  <span>Khách (Guest)</span>
                  {!currentUser && <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]"></span>}
                </button>
                <button
                  onClick={() => {
                    onSwitchRole('user');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#334155] flex items-center justify-between cursor-pointer ${
                    currentUser?.role === 'user' ? 'text-[#F43F5E] bg-[#334155]/50' : 'text-slate-300'
                  }`}
                >
                  <span>Thành viên (User)</span>
                  {currentUser?.role === 'user' && <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]"></span>}
                </button>
                <button
                  onClick={() => {
                    onSwitchRole('admin');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#334155] flex items-center justify-between cursor-pointer ${
                    currentUser?.role === 'admin' ? 'text-[#F43F5E] bg-[#334155]/50' : 'text-slate-300'
                  }`}
                >
                  <span>Quản trị (Admin)</span>
                  {currentUser?.role === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]"></span>}
                </button>
              </div>
            )}
          </div>

          {/* UPLOAD BUTTON */}
          <button
            onClick={() => {
              if (!currentUser) {
                onNavigate('auth');
              } else {
                onNavigate('upload');
              }
            }}
            className="flex items-center gap-2 bg-[#F43F5E] hover:bg-[#E11D48] text-white font-bold py-2 px-4 md:px-6 rounded-full border-b-4 border-[#881337] active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
          >
            <UploadCloud size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline uppercase font-black tracking-wider text-xs">UPLOAD</span>
          </button>

          {/* USER SECTION / AUTH BUTTONS */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowRoleMenu(false);
                }}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-white hover:border-[#38BDF8] focus:outline-none transition-all cursor-pointer"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#1E293B] border-2 border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                  <div className="px-4 py-2 border-b border-slate-800 mb-2">
                    <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 truncate leading-tight mt-0.5">{currentUser.email}</p>
                    <span className="inline-block px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase rounded-md bg-[#334155] text-[#38BDF8] mt-2">
                      {currentUser.role}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      onNavigate('profile', currentUser.id);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-[#334155] flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon size={16} className="text-[#38BDF8]" />
                    <span>Hồ sơ cá nhân</span>
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-950/20 flex items-center gap-2 cursor-pointer border-t border-slate-800 mt-1 pt-2"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="flex items-center gap-2 bg-[#38BDF8] hover:bg-[#0ea5e9] text-white font-bold py-2 px-4 rounded-full border-b-4 border-[#0369a1] active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
            >
              <LogIn size={16} strokeWidth={2.5} />
              <span className="uppercase font-black tracking-wider text-xs">LOGIN</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
