export function formatBytes(bytes: number, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Token helper
export const getAuthToken = () => localStorage.getItem('animatehub_token');
export const setAuthToken = (token: string) => localStorage.setItem('animatehub_token', token);
export const removeAuthToken = () => localStorage.removeItem('animatehub_token');

export const getSavedUser = () => {
  const user = localStorage.getItem('animatehub_user');
  return user ? JSON.parse(user) : null;
};
export const setSavedUser = (user: any) => localStorage.setItem('animatehub_user', JSON.stringify(user));
export const removeSavedUser = () => localStorage.removeItem('animatehub_user');
