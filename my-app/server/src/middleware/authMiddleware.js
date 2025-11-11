import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-123';

// Bảo vệ route - yêu cầu đăng nhập
export const protect = async (req, res, next) => {
  try {
    // 1) Lấy token từ header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Bạn chưa đăng nhập! Vui lòng đăng nhập để truy cập.', 401)
      );
    }

    // 2) Xác minh token
    const decoded = await jwt.verify(token, JWT_SECRET);

    // 3) Kiểm tra xem người dùng có tồn tại không
    // Ở đây bạn có thể thêm logic kiểm tra người dùng trong database nếu cần
    // const currentUser = await User.findById(decoded.id);
    // if (!currentUser) {
    //   return next(new AppError('Người dùng không còn tồn tại.', 401));
    // }

    // 4) Gán thông tin người dùng vào request
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 401));
  }
};

// Giới hạn quyền truy cập dựa trên vai trò
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'editor']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Bạn không có quyền thực hiện hành động này', 403)
      );
    }
    next();
  };
};

// Middleware xác thực cũ (giữ lại để tương thích ngược)
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Thiếu token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Thay đổi từ req.admin thành req.user để thống nhất
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
};
export function protectOptional(req, _res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = { id: decoded.id };
  } catch {
    // token invalid -> coi như khách
  }
  next();
}