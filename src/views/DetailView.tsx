import React, { useState } from 'react';
import { ArrowLeft, Download, Heart, Trash2, Calendar, HardDrive, FileType, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Resource, User } from '../types';
import { formatBytes, formatDate } from '../utils';
import AudioPlayer from '../components/AudioPlayer';

interface DetailViewProps {
  resource: Resource;
  currentUser: User | null;
  onBack: () => void;
  onLike: (id: string) => Promise<{ success: boolean; likedCount: number; liked: boolean }>;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigateToAuthor: (authorId: string) => void;
}

export default function DetailView({
  resource: initialResource,
  currentUser,
  onBack,
  onLike,
  onDownload,
  onDelete,
  onNavigateToAuthor,
}: DetailViewProps) {
  const [resource, setResource] = useState<Resource>(initialResource);
  const [isLiking, setIsLiking] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const isLikedByMe = currentUser ? resource.likes.includes(currentUser.id) : false;
  const isAuthor = currentUser ? resource.authorId === currentUser.id : false;
  const isAdmin = currentUser ? currentUser.role === 'admin' : false;

  const handleLikeToggle = async () => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để có thể yêu thích tài nguyên này!');
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await onLike(resource.id);
      if (res.success) {
        setResource((prev) => ({
          ...prev,
          likeCount: res.likedCount,
          likes: res.liked
            ? [...prev.likes, currentUser.id]
            : prev.likes.filter((id) => id !== currentUser.id),
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDownloadTrigger = () => {
    onDownload(resource.id);
    // Locally increment counter immediately to reflect live update
    setResource((prev) => ({ ...prev, downloadCount: prev.downloadCount + 1 }));
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const getExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 md:px-0">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm mb-6 cursor-pointer group"
      >
        <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform text-[#F43F5E]" />
        <span>Quay lại trang chủ</span>
      </button>

      {/* TWO COLUMN DETAIL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: PREVIEW AND CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visual Frame */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 flex items-center justify-center shadow-lg">
            {resource.previewUrl ? (
              <img
                src={resource.previewUrl}
                alt={resource.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center p-8">
                <FileType size={64} className="mx-auto text-slate-600" />
                <p className="text-sm font-black text-[#38BDF8] font-mono mt-3 uppercase">
                  {getExtension(resource.fileName)} Asset
                </p>
              </div>
            )}
          </div>

          {/* Heading Info */}
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-black heading-font text-white leading-tight tracking-tight uppercase">
              {resource.title}
            </h1>
            
            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {resource.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 text-xs font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Description */}
          <div className="p-6 bg-[#1E293B] border-2 border-slate-700 rounded-2xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider select-none heading-font">
              Mô tả chi tiết
            </h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {resource.description || 'Chưa có mô tả chi tiết cho tài nguyên này.'}
            </p>
          </div>

          {/* AUDIO PLAYER SPECIFIC BOX */}
          {resource.category === 'audio' && (
            <div className="p-6 bg-[#1E293B] border-2 border-slate-700 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-[#F43F5E] uppercase tracking-wider select-none">
                Trình nghe thử âm thanh
              </h3>
              <AudioPlayer src={resource.fileUrl} title={resource.title} />
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: SPECS, METRICS, CTA ACTIONS */}
        <div className="space-y-6">
          
          {/* ACTION PANEL (Download, Like) */}
          <div className="p-6 bg-[#1E293B] border-2 border-slate-700 rounded-2xl space-y-4 shadow-md">
            
            {/* Download CTA Button */}
            <button
              onClick={handleDownloadTrigger}
              className="w-full flex items-center justify-center gap-2 h-12 bg-[#FCD34D] text-[#78350F] font-black rounded-xl border-b-4 border-[#B45309] active:border-b-0 active:translate-y-1 transition-all cursor-pointer uppercase text-xs tracking-wider"
            >
              <Download size={18} strokeWidth={2.5} />
              <span>Tải về trực tiếp</span>
            </button>

            {downloadSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                <CheckCircle size={14} className="flex-shrink-0" />
                <span>Trình tải xuống đã bắt đầu!</span>
              </div>
            )}

            {/* Like and Delete row */}
            <div className="flex gap-2.5">
              
              {/* Like toggle */}
              <button
                onClick={handleLikeToggle}
                disabled={isLiking}
                className={`flex-1 h-11 flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                  isLikedByMe
                    ? 'bg-[#F43F5E] text-white border-[#881337]'
                    : 'bg-[#334155] border-slate-600 text-slate-300 hover:bg-[#475569] hover:text-white'
                }`}
              >
                {isLiking ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Heart size={16} fill={isLikedByMe ? 'currentColor' : 'none'} />
                )}
                <span>{isLikedByMe ? 'Đã yêu thích' : 'Yêu thích'}</span>
              </button>

              {/* Delete trigger */}
              {(isAuthor || isAdmin) && (
                <button
                  onClick={() => onDelete(resource.id)}
                  className="px-3.5 h-11 border-2 border-red-900/40 text-red-400 hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                  title="Xoá tài nguyên"
                >
                  <Trash2 size={16} />
                </button>
              )}

            </div>
          </div>

          {/* SPECIFICATIONS PANEL */}
          <div className="p-6 bg-[#1E293B] border-2 border-slate-700 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider select-none border-b border-slate-700 pb-2 heading-font">
              Thông số tệp tin
            </h3>

            <div className="space-y-3">
              {/* Size */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Dung lượng</span>
                <span className="text-[#38BDF8] font-mono">{formatBytes(resource.fileSize)}</span>
              </div>
              
              {/* Type / Ext */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Định dạng</span>
                <span className="text-[#FCD34D] font-mono uppercase bg-[#334155] px-2 py-0.5 rounded-md border border-slate-600">
                  {getExtension(resource.fileName)}
                </span>
              </div>

              {/* Upload Date */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Ngày đăng tải</span>
                <span className="text-slate-200">{formatDate(resource.createdAt)}</span>
              </div>

              {/* Total Downloads */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Lượt tải về</span>
                <span className="text-slate-200 font-mono">{resource.downloadCount}</span>
              </div>

              {/* Total Likes */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Lượt yêu thích</span>
                <span className="text-slate-200 font-mono">{resource.likeCount}</span>
              </div>
            </div>
          </div>

          {/* AUTHOR PROFILE CARD */}
          <div className="p-6 bg-[#1E293B] border-2 border-slate-700 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none mb-3 heading-font">
              Tác giả
            </h3>
            
            <div className="flex items-start gap-3">
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(resource.authorName)}`}
                alt={resource.authorName}
                className="w-11 h-11 rounded-xl bg-slate-800 border-2 border-white"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {resource.authorName}
                </p>
                <button
                  onClick={() => onNavigateToAuthor(resource.authorId)}
                  className="text-xs text-[#38BDF8] hover:underline font-bold mt-1.5 flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem hồ sơ</span>
                  <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
