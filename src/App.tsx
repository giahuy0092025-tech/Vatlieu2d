import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeProvider } from './components/ThemeContext';
import Header from './components/Header';
import Navbar from './components/Navbar';
import HomeView from './views/HomeView';
import UploadView from './views/UploadView';
import DetailView from './views/DetailView';
import AuthView from './views/AuthView';
import ProfileView from './views/ProfileView';

import { User, Resource, ResourceCategory } from './types';
import { getAuthToken, setAuthToken, removeAuthToken, getSavedUser, setSavedUser, removeSavedUser } from './utils';

function MainApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getSavedUser());
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation states
  const [activeView, setActiveView] = useState<'home' | 'upload' | 'auth' | 'profile'>('home');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch resource list from full-stack Express server
  const fetchResources = async () => {
    setLoading(true);
    try {
      const url = `/api/resources?category=${selectedCategory}&query=${searchQuery}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.success) {
        setResources(json.data);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, searchQuery, activeView]);

  // Handle Authentication Callbacks
  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const json = await res.json();
      if (json.success) {
        setAuthToken(json.data.token);
        setSavedUser(json.data.user);
        setCurrentUser(json.data.user);
        setActiveView('home');
        return { success: true };
      } else {
        return { success: false, message: json.message };
      }
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  };

  const handleRegister = async (credentials: { email: string; name: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const json = await res.json();
      if (json.success) {
        setAuthToken(json.data.token);
        setSavedUser(json.data.user);
        setCurrentUser(json.data.user);
        setActiveView('home');
        return { success: true };
      } else {
        return { success: false, message: json.message };
      }
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  };

  const handleGoogleLogin = async (googleUser: { email: string; name: string; avatar?: string }) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser),
      });
      const json = await res.json();
      if (json.success) {
        setAuthToken(json.data.token);
        setSavedUser(json.data.user);
        setCurrentUser(json.data.user);
        setActiveView('home');
        return { success: true };
      } else {
        return { success: false, message: json.message };
      }
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối Google.' };
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    removeSavedUser();
    setCurrentUser(null);
    setActiveView('home');
  };

  // Switch roles quickly for ease of evaluation & demo
  const handleSwitchRole = async (role: 'guest' | 'user' | 'admin') => {
    if (role === 'guest') {
      handleLogout();
    } else {
      const email = role === 'admin' ? 'admin@animatehub.com' : 'user@animatehub.com';
      const password = role === 'admin' ? 'admin123' : 'user123';
      await handleLogin({ email, password });
    }
  };

  // Likes Interaction
  const handleLike = async (e: React.MouseEvent | null, resourceId: string) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      setActiveView('auth');
      return;
    }
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/resources/${resourceId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        // Refresh local resources
        fetchResources();
        return { success: true, likedCount: json.data.likedCount, liked: json.data.liked };
      }
    } catch (err) {
      console.error(err);
    }
    return { success: false, likedCount: 0, liked: false };
  };

  // Downloads Interaction
  const handleDownload = (e: React.MouseEvent | null, resourceId: string) => {
    if (e) e.stopPropagation();
    const token = getAuthToken() || '';
    
    // Direct trigger download through endpoint
    window.open(`/api/download/${resourceId}?token=${token}`, '_blank');
    
    // Locally increment counts for instant UI feedback
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, downloadCount: r.downloadCount + 1 } : r))
    );
  };

  // Delete Resource Interaction
  const handleDelete = async (e: React.MouseEvent | null, resourceId: string) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài nguyên này khỏi hệ thống? Thao tác không thể hoàn tác.')) {
      return;
    }
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        alert('Xoá tài nguyên thành công!');
        fetchResources();
        // If in detail view, go home
        if (selectedResource?.id === resourceId) {
          setSelectedResource(null);
        }
      } else {
        alert(json.message || 'Lỗi xảy ra khi xóa tài nguyên!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit resource upload
  const handleUploadSubmit = async (formData: FormData) => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        alert('Tải lên tài nguyên thành công!');
        setActiveView('home');
        return { success: true };
      } else {
        return { success: false, message: json.message };
      }
    } catch (err) {
      return { success: false, message: 'Lỗi mạng khi tải lên tệp tin.' };
    }
  };

  // Navigation handlers
  const handleNavigate = (view: 'home' | 'upload' | 'auth' | 'profile', targetId?: string) => {
    setActiveView(view);
    setSelectedResource(null);
    if (view === 'profile' && targetId) {
      setProfileUserId(targetId);
    } else {
      setProfileUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-16">
      
      {/* Universal header */}
      <Header
        currentUser={currentUser}
        onSearch={setSearchQuery}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
      />

      {/* Categories navbar - only shown on home list screen */}
      {activeView === 'home' && !selectedResource && (
        <Navbar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView + (selectedResource ? '-detail' : '') + (profileUserId ? `-${profileUserId}` : '')}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* VIEW DETAILS IF RESOURCE SELECTED */}
            {selectedResource ? (
              <DetailView
                resource={selectedResource}
                currentUser={currentUser}
                onBack={() => setSelectedResource(null)}
                onLike={(id) => handleLike(null, id)}
                onDownload={(id) => handleDownload(null, id)}
                onDelete={(id) => handleDelete(null, id)}
                onNavigateToAuthor={(authorId) => handleNavigate('profile', authorId)}
              />
            ) : (
              (() => {
                switch (activeView) {
                  case 'home':
                    return (
                      <HomeView
                        resources={resources}
                        currentUser={currentUser}
                        selectedCategory={selectedCategory}
                        onLike={handleLike}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onSelectResource={setSelectedResource}
                        onNavigateToUpload={() => {
                          if (!currentUser) {
                            setActiveView('auth');
                          } else {
                            setActiveView('upload');
                          }
                        }}
                      />
                    );
                  case 'upload':
                    return (
                      <UploadView
                        onUploadSubmit={handleUploadSubmit}
                        onCancel={() => setActiveView('home')}
                      />
                    );
                  case 'auth':
                    return (
                      <AuthView
                        onLogin={handleLogin}
                        onRegister={handleRegister}
                        onGoogleLogin={handleGoogleLogin}
                        onCancel={() => setActiveView('home')}
                      />
                    );
                  case 'profile':
                    return (
                      <ProfileView
                        userId={profileUserId || currentUser?.id || ''}
                        currentUser={currentUser}
                        onBack={() => handleNavigate('home')}
                        onLike={handleLike}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onSelectResource={setSelectedResource}
                      />
                    );
                  default:
                    return null;
                }
              })()
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
