import React, { useState } from 'react';
import { SlidersHorizontal, ArrowUpDown, Sparkles, Filter, RefreshCcw } from 'lucide-react';
import { Resource, User, ResourceCategory } from '../types';
import ResourceCard from '../components/ResourceCard';
import EmptyState from '../components/EmptyState';
import { CATEGORIES } from '../components/Navbar';

interface HomeViewProps {
  resources: Resource[];
  currentUser: User | null;
  selectedCategory: ResourceCategory | 'all';
  onLike: (e: React.MouseEvent, id: string) => void;
  onDownload: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onSelectResource: (resource: Resource) => void;
  onNavigateToUpload: () => void;
}

export default function HomeView({
  resources,
  currentUser,
  selectedCategory,
  onLike,
  onDownload,
  onDelete,
  onSelectResource,
  onNavigateToUpload,
}: HomeViewProps) {
  const [sortOption, setSortOption] = useState<'newest' | 'popular' | 'liked'>('newest');

  // Sort resources in memory for instant UX response
  const sortedResources = [...resources].sort((a, b) => {
    if (sortOption === 'popular') {
      return b.downloadCount - a.downloadCount;
    } else if (sortOption === 'liked') {
      return b.likeCount - a.likeCount;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Calculate stats for current filter
  const currentCategoryLabel = CATEGORIES.find(c => c.value === selectedCategory)?.label || 'Tất cả';

  return (
    <div className="w-full">
      
      {/* HERO BANNER SECTION (2D / Game Art Style) */}
      <section className="relative w-full overflow-hidden bg-[#1E293B] border-4 border-[#F43F5E] text-white rounded-3xl p-8 md:p-12 mb-8 shadow-[6px_6px_0px_#881337]">
        {/* Decorative Grid and Ambient Lights */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#F43F5E]/10 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#38BDF8]/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 left-1/3 w-40 h-40 bg-[#FCD34D]/10 rounded-full blur-2xl"></div>

        <div className="relative max-w-2xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-[#F43F5E] text-xs font-bold uppercase tracking-wider mb-4 animate-pulse heading-font">
            <Sparkles size={12} />
            <span>Cộng đồng Artist & Game Developer 2D</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black heading-font tracking-tight mb-4 leading-tight uppercase">
            Kho tài nguyên <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F43F5E] via-[#FCD34D] to-[#38BDF8]">Hoạt hình & Game</span> đỉnh cao
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 font-medium">
            Tải lên, lưu trữ và chia sẻ miễn phí các Sprite nhân vật, Đạo cụ vẽ tay, Bối cảnh Parallax, Hiệu ứng âm thanh và các Công cụ hỗ trợ làm game tuyệt vời nhất.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={onNavigateToUpload}
              className="px-6 py-3 bg-[#F43F5E] hover:bg-[#E11D48] text-white font-extrabold rounded-full border-b-4 border-[#881337] active:border-b-0 active:translate-y-1 transition-all cursor-pointer uppercase text-xs tracking-wider"
            >
              Chia sẻ tài nguyên ngay
            </button>
            <a
              href="#explore-section"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-[#1E293B] font-extrabold rounded-full border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 transition-all cursor-pointer uppercase text-xs tracking-wider"
            >
              Khám phá thêm
            </a>
          </div>
        </div>

        {/* Dynamic Vector floating art (representation only) */}
        <div className="absolute bottom-0 right-8 hidden lg:block w-96 h-full pointer-events-none select-none">
          <div className="absolute bottom-4 right-4 w-64 h-64 border-4 border-dashed border-[#F43F5E]/20 rounded-full animate-spin [animation-duration:40s]"></div>
          <div className="absolute bottom-16 right-16 w-32 h-32 bg-[#38BDF8]/20 rounded-3xl transform rotate-12 blur-xs"></div>
          <div className="absolute bottom-28 right-36 text-center">
            <span className="text-[120px] font-black tracking-tighter text-slate-800/20 select-none heading-font">2D</span>
          </div>
        </div>
      </section>

      {/* FILTER & SORT CONTROLS */}
      <div id="explore-section" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2">
        <div>
          <h2 className="text-xl font-bold heading-font text-slate-100 flex items-center gap-2">
            <Filter size={18} className="text-[#F43F5E]" />
            <span>Danh mục: {currentCategoryLabel}</span>
            <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#1E293B] border border-slate-700 px-2.5 py-0.5 rounded-md">
              {sortedResources.length} mục
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
            Đang hiển thị tài nguyên đã qua kiểm duyệt trong hệ thống.
          </p>
        </div>

        {/* Sort Trigger */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wide">
            <ArrowUpDown size={14} />
            <span>Sắp xếp:</span>
          </span>
          <div className="inline-flex p-1 bg-[#1E293B] rounded-xl border border-slate-700">
            <button
              onClick={() => setSortOption('newest')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                sortOption === 'newest'
                  ? 'bg-[#F43F5E] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mới nhất
            </button>
            <button
              onClick={() => setSortOption('popular')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                sortOption === 'popular'
                  ? 'bg-[#F43F5E] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tải nhiều nhất
            </button>
            <button
              onClick={() => setSortOption('liked')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                sortOption === 'liked'
                  ? 'bg-[#F43F5E] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yêu thích
            </button>
          </div>
        </div>
      </div>

      {/* GRID LAYOUT / EMPTY STATE */}
      {sortedResources.length === 0 ? (
        <EmptyState 
          onUploadClick={onNavigateToUpload} 
          message="Chưa có tài nguyên nào được đăng tải trong danh mục này hoặc không tìm thấy kết quả phù hợp. Hãy là người đầu tiên upload!" 
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              currentUser={currentUser}
              onLike={onLike}
              onDownload={onDownload}
              onDelete={onDelete}
              onClick={() => onSelectResource(resource)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
