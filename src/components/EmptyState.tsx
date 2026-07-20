import React from 'react';
import { PackageOpen, UploadCloud } from 'lucide-react';

interface EmptyStateProps {
  onUploadClick?: () => void;
  message?: string;
}

export default function EmptyState({ onUploadClick, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center max-w-2xl text-center mx-auto py-12 px-6">
      <div className="relative mb-10 select-none">
        {/* Decorative shapes for the empty state */}
        <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#FCD34D] rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-4 -right-8 w-24 h-24 bg-[#38BDF8] rounded-2xl rotate-12 opacity-20"></div>
        
        <div className="w-64 h-64 bg-[#1E293B] border-4 border-dashed border-slate-600 rounded-[40px] flex items-center justify-center shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <PackageOpen size={80} className="text-slate-600 stroke-1" />
            <p className="text-slate-500 font-black text-xs uppercase tracking-widest heading-font">Empty Canvas</p>
          </div>
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-black mb-4 text-white uppercase tracking-tight heading-font">
        No resources here yet!
      </h2>
      <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed">
        {message || (
          <>
            Chưa có tài nguyên nào được đăng tải trong danh mục này.<br/>
            Hãy là người đầu tiên đóng góp cho cộng đồng phát triển game!
          </>
        )}
      </p>

      {onUploadClick && (
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onUploadClick}
            className="bg-[#FCD34D] text-[#78350F] font-black px-8 py-4 rounded-2xl border-b-4 border-[#B45309] flex items-center gap-3 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md hover:brightness-105"
          >
            <UploadCloud size={20} strokeWidth={2.5} />
            <span className="uppercase tracking-wider text-sm">UPLOAD YOUR FIRST ASSET</span>
          </button>
        </div>
      )}
    </div>
  );
}
