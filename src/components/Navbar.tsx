import React from 'react';
import { User, Sword, Image, Music, Wrench } from 'lucide-react';
import { ResourceCategory } from '../types';

interface NavbarProps {
  selectedCategory: ResourceCategory | 'all';
  onSelectCategory: (category: ResourceCategory | 'all') => void;
}

export const CATEGORIES: { value: ResourceCategory | 'all'; label: string; description: string; icon: any }[] = [
  { value: 'all', label: 'Tất cả', description: 'Tất cả tài nguyên', icon: null },
  { value: 'characters', label: 'Nhân vật', description: 'Sprites, Skeletal, Chibi', icon: User },
  { value: 'props', label: 'Đạo cụ', description: 'Vũ khí, Item, Hiệu ứng', icon: Sword },
  { value: 'backgrounds', label: 'Bối cảnh / Nền', description: 'Backgrounds, Tilemaps, Parallax', icon: Image },
  { value: 'audio', label: 'Âm thanh', description: 'SFX, Nhạc nền, Loop', icon: Music },
  { value: 'tools', label: 'Công cụ / APK', description: 'Phần mềm, Game Demo, APK', icon: Wrench },
];

export default function Navbar({ selectedCategory, onSelectCategory }: NavbarProps) {
  return (
    <div className="w-full bg-[#1E293B] border-b border-slate-700 sticky top-20 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-start overflow-x-auto gap-3 py-3.5 scrollbar-none scroll-smooth">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.value;

            return (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#F43F5E] text-white border-b-2 border-[#881337] active:border-b-0 active:translate-y-[2px]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {IconComponent && <IconComponent size={18} strokeWidth={2.5} />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
