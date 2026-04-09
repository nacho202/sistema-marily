const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../../public/uploads/productos');
fs.mkdirSync(uploadDir, { recursive: true });

function safeFilename(originalname) {
  const ext = path.extname(originalname || '').toLowerCase().slice(0, 10);
  const base = path
    .basename(originalname || 'file', ext)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base || 'img'}-${stamp}-${rand}${ext || ''}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, safeFilename(file.originalname)),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    const ok = /^image\//.test(file.mimetype);
    cb(ok ? null : new Error('Solo se permiten imágenes'), ok);
  },
});

module.exports = { upload };

