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

function saveBase64ImageToUploads(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!match) throw new Error('Formato de imagen base64 inválido');

  const mime = match[1].toLowerCase();
  const b64 = match[2];
  const ext =
    mime === 'image/png' ? '.png' :
    mime === 'image/webp' ? '.webp' :
    mime === 'image/gif' ? '.gif' :
    '.jpg';

  const filename = safeFilename(`cropped${ext}`);
  const filePath = path.join(uploadDir, filename);
  const buffer = Buffer.from(b64, 'base64');

  // límite de 5MB aprox alineado con multer
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error('La imagen recortada supera el límite de 5MB');
  }

  fs.writeFileSync(filePath, buffer);
  return { publicUrl: `/uploads/productos/${filename}`, filePath };
}

module.exports = { upload, saveBase64ImageToUploads };

