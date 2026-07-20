import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { User, Resource, ResourceCategory } from './src/types';

const app = express();
const PORT = 3000;

// Directories
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Database initial state
interface DbSchema {
  users: User[];
  resources: Resource[];
  passwords: Record<string, string>; // userId -> password (simple storage)
}

function readDb(): DbSchema {
  if (!fs.existsSync(DB_FILE)) {
    const defaultDb: DbSchema = {
      users: [
        {
          id: 'admin-id',
          email: 'admin@animatehub.com',
          name: 'AnimateHub Admin',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          bio: 'Hệ thống Quản trị viên của AnimateHub.',
          createdAt: new Date().toISOString(),
          likedResourceIds: [],
          downloadedResourceIds: []
        },
        {
          id: 'user-id',
          email: 'user@animatehub.com',
          name: 'GameArtist2D',
          role: 'user',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          bio: 'Nhà phát triển game 2D tự do và họa sĩ thiết kế bối cảnh.',
          createdAt: new Date().toISOString(),
          likedResourceIds: [],
          downloadedResourceIds: []
        }
      ],
      resources: [], // Emtpy state by default
      passwords: {
        'admin-id': 'admin123',
        'user-id': 'user123'
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file, resetting to default', err);
    return { users: [], resources: [], passwords: {} };
  }
}

function writeDb(data: DbSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Multer Config for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for assets/APKs
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: authenticate user from headers
function getAuthenticatedUser(req: express.Request, db: DbSchema): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  // Simple token format: `token-{userId}-{timestamp}`
  const parts = token.split('-');
  if (parts.length < 3 || parts[0] !== 'token') {
    return null;
  }
  const userId = parts[1];
  const user = db.users.find(u => u.id === userId);
  return user || null;
}

// ================= AUTHENTICATION ENDPOINTS =================

// Register
app.post('/api/auth/register', (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin!' });
  }

  const db = readDb();
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Email này đã tồn tại trên hệ thống!' });
  }

  const newUser: User = {
    id: 'user-' + Date.now().toString(),
    email: email.toLowerCase(),
    name,
    role: 'user', // default role
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    bio: 'Thành viên mới của AnimateHub.',
    createdAt: new Date().toISOString(),
    likedResourceIds: [],
    downloadedResourceIds: []
  };

  db.users.push(newUser);
  db.passwords[newUser.id] = password;
  writeDb(db);

  const token = `token-${newUser.id}-${Date.now()}`;
  res.json({ success: true, data: { user: newUser, token } });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập Email và Mật khẩu!' });
  }

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || db.passwords[user.id] !== password) {
    return res.status(401).json({ success: false, message: 'Email hoặc Mật khẩu không chính xác!' });
  }

  const token = `token-${user.id}-${Date.now()}`;
  res.json({ success: true, data: { user, token } });
});

// Google OAuth simulation
app.post('/api/auth/google', (req, res) => {
  const { email, name, avatar } = req.body;
  if (!email || !name) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin tài khoản Google!' });
  }

  const db = readDb();
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    user = {
      id: 'google-' + Date.now().toString(),
      email: email.toLowerCase(),
      name,
      role: 'user',
      avatar: avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`,
      bio: 'Đăng nhập thông qua Google.',
      createdAt: new Date().toISOString(),
      likedResourceIds: [],
      downloadedResourceIds: []
    };
    db.users.push(user);
    db.passwords[user.id] = 'google-oauth-dummy-pw';
    writeDb(db);
  }

  const token = `token-${user.id}-${Date.now()}`;
  res.json({ success: true, data: { user, token } });
});

// Get profile & current authenticated user info
app.get('/api/auth/me', (req, res) => {
  const db = readDb();
  const user = getAuthenticatedUser(req, db);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập!' });
  }
  res.json({ success: true, data: user });
});


// ================= RESOURCE ENDPOINTS =================

// Get resources with search and filters
app.get('/api/resources', (req, res) => {
  const { query, category, sort, userId } = req.query;
  const db = readDb();
  let list = [...db.resources];

  // Category filter
  if (category && category !== 'all') {
    list = list.filter(r => r.category === category);
  }

  // Search keyword filter
  if (query) {
    const q = (query as string).toLowerCase().trim();
    list = list.filter(r => 
      r.title.toLowerCase().includes(q) || 
      r.description.toLowerCase().includes(q) ||
      r.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  // Filtering by specific author (for Profile page)
  if (userId) {
    list = list.filter(r => r.authorId === userId);
  }

  // Sorting
  if (sort === 'popular') {
    list.sort((a, b) => b.downloadCount - a.downloadCount);
  } else if (sort === 'liked') {
    list.sort((a, b) => b.likeCount - a.likeCount);
  } else {
    // default: newest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ success: true, data: list });
});

// Get a single resource detail
app.get('/api/resources/:id', (req, res) => {
  const db = readDb();
  const resource = db.resources.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tài nguyên!' });
  }
  res.json({ success: true, data: resource });
});

// Create/Upload a new resource
// Multer fields:
// - file: the main archive/binary file
// - preview: optional preview thumbnail
app.post('/api/resources', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'preview', maxCount: 1 }
]), (req, res) => {
  const db = readDb();
  const user = getAuthenticatedUser(req, db);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để tải lên tài nguyên!' });
  }

  const { title, description, category, tags } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!title || !category || !files || !files['file'] || files['file'].length === 0) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin tài nguyên hoặc tập tin tải lên!' });
  }

  const uploadedFile = files['file'][0];
  const previewFile = files['preview'] ? files['preview'][0] : null;

  // Build files paths
  const fileUrl = `/uploads/${uploadedFile.filename}`;
  let previewUrl = '';
  if (previewFile) {
    previewUrl = `/uploads/${previewFile.filename}`;
  } else {
    // Default placeholder representations based on category
    if (category === 'audio') {
      previewUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400';
    } else if (category === 'tools') {
      previewUrl = 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=400';
    } else {
      previewUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400';
    }
  }

  // Parse tags
  let tagList: string[] = [];
  if (tags) {
    try {
      tagList = JSON.parse(tags);
    } catch {
      tagList = String(tags).split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  const newResource: Resource = {
    id: 'res-' + Date.now().toString(),
    title,
    description: description || 'Chưa có mô tả chi tiết.',
    category: category as ResourceCategory,
    fileUrl,
    fileName: uploadedFile.originalname,
    fileSize: uploadedFile.size,
    fileType: uploadedFile.mimetype || 'application/octet-stream',
    downloadCount: 0,
    likeCount: 0,
    previewUrl,
    tags: tagList,
    authorId: user.id,
    authorName: user.name,
    createdAt: new Date().toISOString(),
    likes: []
  };

  db.resources.unshift(newResource);
  writeDb(db);

  res.json({ success: true, data: newResource });
});

// Like / unlike toggle
app.post('/api/resources/:id/like', (req, res) => {
  const db = readDb();
  const user = getAuthenticatedUser(req, db);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để yêu thích tài nguyên!' });
  }

  const resourceId = req.params.id;
  const resource = db.resources.find(r => r.id === resourceId);
  if (!resource) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tài nguyên!' });
  }

  const userInDb = db.users.find(u => u.id === user.id);
  if (!userInDb) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });

  const likeIdx = resource.likes.indexOf(user.id);
  let liked = false;

  if (likeIdx > -1) {
    // Unlike
    resource.likes.splice(likeIdx, 1);
    resource.likeCount = resource.likes.length;
    userInDb.likedResourceIds = userInDb.likedResourceIds.filter(id => id !== resourceId);
  } else {
    // Like
    resource.likes.push(user.id);
    resource.likeCount = resource.likes.length;
    userInDb.likedResourceIds.push(resourceId);
    liked = true;
  }

  writeDb(db);
  res.json({ success: true, data: { resource, liked, likedCount: resource.likeCount } });
});

// Direct Download Resource File
app.get('/api/download/:id', (req, res) => {
  const db = readDb();
  const resource = db.resources.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).send('Không tìm thấy tài nguyên!');
  }

  // Increment download count
  resource.downloadCount += 1;

  // Optional: tracking in user downloads if token provided
  const authHeader = req.headers.authorization || req.query.token;
  if (authHeader) {
    const token = String(authHeader).startsWith('Bearer ') ? String(authHeader).split(' ')[1] : String(authHeader);
    const parts = token.split('-');
    if (parts[0] === 'token') {
      const userId = parts[1];
      const userInDb = db.users.find(u => u.id === userId);
      if (userInDb && !userInDb.downloadedResourceIds.includes(resource.id)) {
        userInDb.downloadedResourceIds.push(resource.id);
      }
    }
  }

  writeDb(db);

  // Send the actual file
  const relativeFilePath = resource.fileUrl.replace('/uploads/', '');
  const fullFilePath = path.join(UPLOADS_DIR, relativeFilePath);

  if (fs.existsSync(fullFilePath)) {
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resource.fileName)}"`);
    res.setHeader('Content-Type', resource.fileType);
    res.sendFile(fullFilePath);
  } else {
    // If file somehow went missing on disk but is in DB, we mock sending an empty/text demo file content
    // so it doesn't fail the download flow!
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resource.fileName)}"`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(`Demo content for ${resource.title} (${resource.fileName}). Trình tải mô phỏng tập tin thành công!`);
  }
});

// Delete a resource
app.delete('/api/resources/:id', (req, res) => {
  const db = readDb();
  const user = getAuthenticatedUser(req, db);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập!' });
  }

  const resourceIdx = db.resources.findIndex(r => r.id === req.params.id);
  if (resourceIdx === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tài nguyên!' });
  }

  const resource = db.resources[resourceIdx];

  // Authorization check: User must be original author OR an admin
  if (resource.authorId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền xoá tài nguyên này!' });
  }

  // Remove files
  try {
    if (resource.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), resource.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (resource.previewUrl && resource.previewUrl.startsWith('/uploads/')) {
      const previewPath = path.join(process.cwd(), resource.previewUrl);
      if (fs.existsSync(previewPath)) fs.unlinkSync(previewPath);
    }
  } catch (err) {
    console.error('Error removing files from disk', err);
  }

  // Update lists
  db.resources.splice(resourceIdx, 1);
  db.users.forEach(u => {
    u.likedResourceIds = u.likedResourceIds.filter(id => id !== req.params.id);
    u.downloadedResourceIds = u.downloadedResourceIds.filter(id => id !== req.params.id);
  });

  writeDb(db);
  res.json({ success: true, message: 'Xoá tài nguyên thành công!' });
});

// User profile and stats
app.get('/api/users/:id/profile', (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
  }

  const uploads = db.resources.filter(r => r.authorId === user.id);
  const likesCount = uploads.reduce((acc, r) => acc + r.likeCount, 0);
  const downloadsCount = uploads.reduce((acc, r) => acc + r.downloadCount, 0);

  res.json({
    success: true,
    data: {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt
      },
      stats: {
        uploadsCount: uploads.length,
        likesCount,
        downloadsCount
      }
    }
  });
});

// Vite Server Configuration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
