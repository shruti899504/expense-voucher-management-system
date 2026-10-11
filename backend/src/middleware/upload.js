import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  }
});
function fileFilter(_req, file, cb) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
    return cb(new Error('Signature must be a PNG, JPG, or WEBP image.'));
  }
  cb(null, true);
}
export const upload = multer({
  storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 }
});
