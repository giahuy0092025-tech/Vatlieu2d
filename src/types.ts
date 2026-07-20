export type ResourceCategory = 'characters' | 'props' | 'backgrounds' | 'audio' | 'tools';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'guest' | 'user' | 'admin';
  avatar: string;
  bio?: string;
  createdAt: string;
  likedResourceIds: string[];
  downloadedResourceIds: string[];
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadCount: number;
  likeCount: number;
  previewUrl?: string; // Image thumbnail URL
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: string[]; // User IDs who liked this
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
