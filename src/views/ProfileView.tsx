import React, { useEffect, useState } from 'react';
import { Sparkles, Calendar, ShieldCheck, Heart, Download, UploadCloud, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { User, Resource } from '../types';
import ResourceCard from '../components/ResourceCard';
import { formatDate } from '../utils';

interface ProfileViewProps {
  userId: string;
  currentUser: User | null;
  onBack: () => void;
  onLike: (e: React.MouseEvent, id: string) => void;
  onDownload: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onSelectResource: (resource: Resource) => void;
}

export default function ProfileView({
  userId,
  currentUser,
  onBack,
  onLike,
  onDownload,
  onDelete,
  onSelectResource,
}: ProfileViewProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<{ uploadsCount: number; likesCount: number; downloadsCount: number }>({
    uploadsCount: 0,
    likesCount: 0,
    downloadsCount: 0,
  });
  const [userResources, setUserResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch profile and stats
        const profileRes = await fetch(`/api/users/${userId}/profile`);
        const profileJson = await profileRes.json();
        
        if (profileJson.success) {
          setProfile(profileJson.data.profile);
          setStats(profileJson.data.stats);
        } else {
          setError(profileJson.message || 'Không thể tải thông tin hồ sơ.');
          setLoading(false);
          return;
        }

        // Fetch assets by this author
        const resList = await fetch(`/api/resources?userId=${userId}`);
        const resJson = await resList.json();
        if (resJson.success) {
          setUserResources(resJson.data);
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ khi truy vấn hồ sơ.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={32} className="animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm font-semibold text-slate-500">Đang tải hồ sơ nghệ sĩ...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <p className="text-red-500 font-semibold text-sm">{error || 'Không tìm thấy hồ sơ người dùng.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Trở lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 md:px-0">
      
      {/* Back CTA */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm mb-6 cursor-pointer group"
      >
        <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform text-[#F43F5E]" />
        <span>Trở lại</span>
      </button>

      {/* HEADER BIO INFO */}
      <div className="bg-[#1E293B] border-2 border-slate-700 rounded-3xl p-6 md:p-8 mb-8 shadow-md">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Avatar frame */}
          <div className="relative flex-shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-white object-cover shadow-sm"
              referrerPolicy="no-referrer"
            />
            {profile.role === 'admin' && (
              <span className="absolute -bottom-1 -right-1 bg-[#F43F5E] text-white p-1 rounded-lg shadow-md border-2 border-white" title="Quản trị viên">
                <ShieldCheck size={12} />
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-black heading-font text-white leading-none uppercase">
                {profile.name}
              </h2>
              <span className="inline-block px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase rounded-md bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/25">
                {profile.role === 'admin' ? 'Quản trị' : 'Thành viên'}
              </span>
            </div>

            <p className="text-sm text-slate-300 font-medium">
              {profile.bio || 'Chưa cập nhật tiểu sử cá nhân.'}
            </p>

            {/* Meta Row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-[#38BDF8]" />
                <span>{profile.email}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#FCD34D]" />
                <span>Tham gia: {formatDate(profile.createdAt)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS STATS */}
      <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Uploads count */}
        <div className="p-4 md:p-6 bg-[#1E293B] border-2 border-slate-700 rounded-2xl text-center shadow-xs">
          <div className="w-9 h-9 bg-[#38BDF8]/10 text-[#38BDF8] rounded-xl flex items-center justify-center mx-auto mb-2 border border-[#38BDF8]/20">
            <UploadCloud size={18} />
          </div>
          <p className="text-xl md:text-2xl font-black font-mono text-white">
            {stats.uploadsCount}
          </p>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 select-none heading-font">
            Đã tải lên
          </p>
        </div>

        {/* Likes count received */}
        <div className="p-4 md:p-6 bg-[#1E293B] border-2 border-slate-700 rounded-2xl text-center shadow-xs">
          <div className="w-9 h-9 bg-[#F43F5E]/10 text-[#F43F5E] rounded-xl flex items-center justify-center mx-auto mb-2 border border-[#F43F5E]/20">
            <Heart size={18} fill="currentColor" className="text-[#F43F5E]" />
          </div>
          <p className="text-xl md:text-2xl font-black font-mono text-white">
            {stats.likesCount}
          </p>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 select-none heading-font">
            Yêu thích nhận
          </p>
        </div>

        {/* Downloads count received */}
        <div className="p-4 md:p-6 bg-[#1E293B] border-2 border-slate-700 rounded-2xl text-center shadow-xs">
          <div className="w-9 h-9 bg-[#FCD34D]/10 text-[#FCD34D] rounded-xl flex items-center justify-center mx-auto mb-2 border border-[#FCD34D]/20">
            <Download size={18} strokeWidth={2.5} />
          </div>
          <p className="text-xl md:text-2xl font-black font-mono text-white">
            {stats.downloadsCount}
          </p>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 select-none heading-font">
            Lượt tải về
          </p>
        </div>
      </div>

      {/* USER UPLOADED ASSETS LIST */}
      <div>
        <h3 className="text-lg font-bold heading-font text-white mb-4 flex items-center gap-2 uppercase">
          <Sparkles size={16} className="text-[#F43F5E]" />
          <span>Tài nguyên của tác giả ({userResources.length})</span>
        </h3>

        {userResources.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-700 rounded-2xl bg-[#1E293B]/50">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nghệ sĩ chưa tải lên tài nguyên nào.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userResources.map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                currentUser={currentUser}
                onLike={onLike}
                onDownload={onDownload}
                onDelete={onDelete}
                onClick={() => onSelectResource(res)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
