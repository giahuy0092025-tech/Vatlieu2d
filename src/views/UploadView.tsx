import React, { useState, useRef } from 'react';
import { UploadCloud, File, Image as ImageIcon, Sparkles, AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../components/Navbar';
import { ResourceCategory } from '../types';
import { formatBytes } from '../utils';

interface UploadViewProps {
  onUploadSubmit: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
  onCancel: () => void;
}

export default function UploadView({ onUploadSubmit, onCancel }: UploadViewProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('characters');
  const [tagsInput, setTagsInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Files state
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewImgUrl, setPreviewImgUrl] = useState<string | null>(null);

  // Drag and Drop drag over states
  const [isDraggingAsset, setIsDraggingAsset] = useState(false);
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);

  const assetInputRef = useRef<HTMLInputElement | null>(null);
  const previewInputRef = useRef<HTMLInputElement | null>(null);

  // Handle asset file selected
  const handleAssetSelect = (file: File) => {
    setAssetFile(file);
    // Auto populate title from file name if empty
    if (!title) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setTitle(nameWithoutExt.replace(/[-_]/g, ' '));
    }
  };

  // Handle preview file selected
  const handlePreviewSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Tập tin xem trước phải là định dạng hình ảnh (PNG, JPG, WebP)!');
      return;
    }
    setPreviewFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImgUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAssetDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAsset(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAssetSelect(e.dataTransfer.files[0]);
    }
  };

  const handlePreviewDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPreview(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePreviewSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề tài nguyên!');
      return;
    }

    if (!assetFile) {
      setError('Bạn chưa chọn tập tin tài nguyên để tải lên!');
      return;
    }

    setIsUploading(true);

    try {
      // Prepare form-data to send to full-stack endpoint
      const form = new FormData();
      form.append('title', title.trim());
      form.append('description', description.trim());
      form.append('category', category);
      
      // Split tags by comma
      const tagsArray = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
      form.append('tags', JSON.stringify(tagsArray));

      form.append('file', assetFile);
      if (previewFile) {
        form.append('preview', previewFile);
      }

      const res = await onUploadSubmit(form);
      if (!res.success) {
        setError(res.message || 'Lỗi xảy ra trong quá trình tải lên!');
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra sự cố bất thường khi tải lên tài nguyên.');
    } finally {
      setIsUploading(false);
    }
  };

  const allowedCategories = CATEGORIES.filter(c => c.value !== 'all');

  return (
    <div className="max-w-3xl mx-auto py-4 px-4 md:px-0">
      
      {/* Title Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold heading-font text-white flex items-center gap-2 uppercase">
          <UploadCloud size={24} className="text-[#F43F5E]" />
          <span>Tải lên tài nguyên mới</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1 font-semibold uppercase tracking-wider">
          Hỗ trợ chia sẻ đa dạng các tập tin chất lượng cao cho cộng đồng hoạt họa 2D & làm game.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div className="font-bold">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ROW 1: CATEGORY & TITLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CATEGORY PICKER */}
          <div className="md:col-span-1">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2 select-none heading-font">
              Danh mục tài nguyên
            </label>
            <div className="space-y-2">
              {allowedCategories.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => setCategory(cat.value as ResourceCategory)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                    category === cat.value
                      ? 'bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E]'
                      : 'bg-[#1E293B] border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                  {category === cat.value && <span className="w-2 h-2 rounded-full bg-[#F43F5E]"></span>}
                </button>
              ))}
            </div>
          </div>

          {/* METADATA FIELDS */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2 heading-font">
                Tiêu đề tài nguyên *
              </label>
              <input
                type="text"
                required
                placeholder="Nhập tiêu đề ngắn gọn (ví dụ: Chibi Ninja Sprite Sheet)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-4 bg-[#1E293B] border-2 border-slate-700 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-[#F43F5E]/20 focus:border-[#F43F5E] transition-all font-semibold"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2 heading-font">
                Mô tả chi tiết
              </label>
              <textarea
                rows={4}
                placeholder="Mô tả định dạng, số lượng frames, độ phân giải hoặc cách thức sử dụng sản phẩm..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-[#1E293B] border-2 border-slate-700 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-[#F43F5E]/20 focus:border-[#F43F5E] transition-all resize-none font-medium"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1 heading-font">
                Gắn thẻ (Tags)
              </label>
              <p className="text-[10px] text-slate-500 mb-2 font-semibold uppercase tracking-wider">
                Gõ các từ khóa cách nhau bởi dấu phẩy để mọi người dễ tìm thấy hơn.
              </p>
              <input
                type="text"
                placeholder="ví dụ: chibi, pixelart, 16bit, loop, weapon"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full h-11 px-4 bg-[#1E293B] border-2 border-slate-700 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-[#F43F5E]/20 focus:border-[#F43F5E] transition-all font-semibold"
              />
            </div>

          </div>
        </div>

        {/* ROW 2: FILE SELECTION DRAG & DROP AREAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* MAIN ASSET FILE DRAG/DROP */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2 heading-font">
              Tập tin tài nguyên chính *
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingAsset(true); }}
              onDragLeave={() => setIsDraggingAsset(false)}
              onDrop={handleAssetDrop}
              onClick={() => assetInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] ${
                isDraggingAsset
                  ? 'border-[#F43F5E] bg-[#F43F5E]/10'
                  : assetFile
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-slate-700 bg-[#1E293B] hover:border-[#38BDF8] hover:bg-slate-800'
              }`}
            >
              <input
                ref={assetInputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleAssetSelect(e.target.files[0])}
              />

              {assetFile ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-emerald-950/50 rounded-xl text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <File size={22} />
                  </div>
                  <p className="text-xs font-bold text-white truncate max-w-[260px] mx-auto">
                    {assetFile.name}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    Kích thước: {formatBytes(assetFile.size)}
                  </p>
                  <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-950/40 rounded-sm border border-emerald-500/20">
                    Đã nạp thành công
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-[#38BDF8]/10 rounded-xl text-[#38BDF8] flex items-center justify-center mx-auto">
                    <UploadCloud size={22} />
                  </div>
                  <p className="text-xs font-bold text-slate-300">
                    Kéo thả tập tin chính vào đây hoặc nhấp để chọn
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Hỗ trợ tệp ZIP, APK, MP3, WAV, PNG, v.v. (Tối đa 100MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* THUMBNAIL PREVIEW DRAG/DROP */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2 heading-font">
              Hình ảnh xem trước / Thumbnail (Tùy chọn)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingPreview(true); }}
              onDragLeave={() => setIsDraggingPreview(false)}
              onDrop={handlePreviewDrop}
              onClick={() => previewInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden ${
                isDraggingPreview
                  ? 'border-[#F43F5E] bg-[#F43F5E]/10'
                  : previewFile
                    ? 'border-[#38BDF8]'
                    : 'border-slate-700 bg-[#1E293B] hover:border-[#FCD34D] hover:bg-slate-800'
              }`}
            >
              <input
                ref={previewInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePreviewSelect(e.target.files[0])}
              />

              {previewImgUrl ? (
                <div className="absolute inset-0">
                  <img
                    src={previewImgUrl}
                    alt="Preview Thumbnail"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-xs font-bold flex items-center gap-1.5 bg-slate-950/80 px-3 py-2 rounded-xl">
                      <RefreshCcw size={14} className="animate-spin" />
                      <span>Thay đổi hình ảnh</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-[#FCD34D]/10 rounded-xl text-[#FCD34D] flex items-center justify-center mx-auto">
                    <ImageIcon size={22} />
                  </div>
                  <p className="text-xs font-bold text-slate-300">
                    Kéo thả ảnh Thumbnail vào đây hoặc nhấp để chọn
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Định dạng hình ảnh PNG, JPG, WebP (Khuyên dùng tỷ lệ 16:9)
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* BOTTOM FORM BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="px-6 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm rounded-xl border-2 border-slate-700 cursor-pointer disabled:opacity-50 transition-all"
          >
            Hủy bỏ
          </button>
          
          <button
            type="submit"
            disabled={isUploading}
            className="flex items-center gap-2 px-6 h-11 bg-[#F43F5E] hover:bg-[#E11D48] text-white font-black text-sm rounded-xl border-b-4 border-[#881337] active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer disabled:opacity-50 uppercase tracking-wider text-xs"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang tải lên... {assetFile ? formatBytes(assetFile.size) : ''}</span>
              </>
            ) : (
              <>
                <UploadCloud size={16} strokeWidth={2.5} />
                <span>Hoàn tất & Đăng tải</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
