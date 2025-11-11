import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Tạo __dirname trong ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tạo thư mục uploads nếu chưa tồn tại
import fs from 'fs';
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// Lọc file ảnh
const imageFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, GIF, WebP)!'), false);
  }
};

// Khởi tạo multer
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
});

export default upload;
