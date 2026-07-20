import React from 'react';
import { Download, Heart, Trash2, Wrench, Music, Image as ImageIcon, Sword, User as UserIcon, Play } from 'lucide-react';
import { Resource, User } from '../types';
import { formatBytes } from '../utils';
import AudioPlayer from './AudioPlayer';

interface ResourceCardProps {
  key?: string | number;
  resource: Resource;
  currentUser: User | null;
  onLike: (e: React.MouseEvent, id: string) => void;
  onDownload: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onClick: () => void;
}

export default function ResourceCard({
  resource,
  currentUser,
  onLike,
  onDownload,
  onDelete,
  onClick,
}: ResourceCardProps) {
  const isLikedByMe = currentUser ? resource.likes.includes(currentUser.id) : false;
  const isAuthor = currentUser ? resource.authorId === currentUser.id : false;
  const isAdmin = currentUser ? currentUser.role === 'admin' : false;

  // Choose badge background/text and category icon
  const getCategoryDetails = (category: string) => {
    switch (category) {
      case 'characters':
        return {
          icon: <UserIcon size={14} strokeWidth={2.5} />,
          label: 'Nhân vật',
          color: 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30',
        };
      case 'props':
        return {
          icon: <Sword size={14} strokeWidth={2.5} />,
          label: 'Đạo cụ',
          color: 'bg-[#FCD34D]/10 text-[#FCD34D] border-[#FCD34D]/30',
        };
      case 'backgrounds':
        return {
          icon: <ImageIcon size={14} strokeWidth={2.5} />,
          label: 'Bối cảnh',
          color: 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/30',
        };
      case 'audio':
        return {
          icon: <Music size={14} strokeWidth={2.5} />,
          label: 'Âm thanh',
          color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        };
      case 'tools':
        return {
          icon: <Wrench size={14} strokeWidth={2.5} />,
          label: 'Công cụ',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      default:
        return {
          icon: <Wrench size={14} strokeWidth={2.5} />,
          label: 'Tài nguyên',
          color: 'bg-slate-500/10 text-slate-400 border-slate-700',
        };
    }
  };

  const catDetails = getCategoryDetails(resource.category);

  // File extension parser
  const getExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <div
      id={`resource-card-${resource.id}`}
      onClick={onClick}
      className="group relative flex flex-col bg-[#1E293B] border-2 border-slate-700/80 rounded-2xl overflow-hidden shadow-sm hover:border-[#F43F5E] hover:scale-[1.01] hover:shadow-[4px_4px_0px_#881337] transition-all duration-200 cursor-pointer"
    >
      {/* THUMBNAIL AREA */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950 flex items-center justify-center">
        {resource.previewUrl ? (
          <img
            src={resource.previewUrl}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-[#1E293B] flex flex-col items-center justify-center p-4">
            <div className="text-slate-500 group-hover:scale-110 transition-transform duration-300">
              {catDetails.icon}
            </div>
            <span className="text-xs font-black mt-2 font-mono text-[#38BDF8]">
              {getExtension(resource.fileName)}
            </span>
          </div>
        )}

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0F172A]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* File extension floating badge */}
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-extrabold font-mono uppercase bg-[#0F172A] border border-slate-600 text-[#38BDF8] rounded-md shadow-xs select-none">
          {getExtension(resource.fileName)}
        </span>

        {/* Category floating badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-bold rounded-full border flex items-center gap-1 backdrop-blur-xs select-none ${catDetails.color}`}>
          {catDetails.icon}
          <span>{catDetails.label}</span>
        </span>

        {/* Quick action buttons (Delete overlay for author/admin) */}
        {(isAuthor || isAdmin) && (
          <button
            onClick={(e) => onDelete(e, resource.id)}
            className="absolute bottom-3 right-3 p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer opacity-0 group-hover:opacity-100 duration-200"
            title="Xoá tài nguyên này"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* CARD CONTENT */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Author & File Size */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-semibold tracking-wide uppercase leading-none">
            <span className="truncate max-w-[120px]">Bởi: @{resource.authorName}</span>
            <span className="font-mono text-[#38BDF8]">{formatBytes(resource.fileSize)}</span>
          </div>

          {/* Title */}
          <h4 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-[#F43F5E] transition-colors line-clamp-1 heading-font">
            {resource.title}
          </h4>

          {/* Description Snippet */}
          <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
            {resource.description}
          </p>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5 mb-2">
              {resource.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[9px] font-bold text-slate-400 bg-[#334155]/60 rounded-md border border-slate-700/60"
                >
                  #{tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="text-[9px] font-extrabold text-[#38BDF8] px-1 py-0.5">
                  +{resource.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM METRICS & INLINE AUDIO PLAYER */}
        <div className="mt-3 pt-3 border-t border-slate-700/80">
          {/* Audio player inline for audio assets! */}
          {resource.category === 'audio' ? (
            <div className="mb-3">
              <AudioPlayer src={resource.fileUrl} title={resource.title} />
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            {/* Likes */}
            <button
              onClick={(e) => onLike(e, resource.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                isLikedByMe
                  ? 'bg-[#F43F5E] text-white border-[#881337]'
                  : 'bg-[#334155] text-slate-300 border-slate-700 hover:bg-[#475569] hover:text-white'
              }`}
            >
              <Heart size={14} fill={isLikedByMe ? 'currentColor' : 'none'} className={isLikedByMe ? 'scale-110' : ''} />
              <span>{resource.likeCount}</span>
            </button>

            {/* Downloads */}
            <button
              onClick={(e) => onDownload(e, resource.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#38BDF8] hover:bg-[#0ea5e9] text-white border-b-2 border-[#0369a1] active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer"
            >
              <Download size={14} strokeWidth={2.5} />
              <span>{resource.downloadCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
