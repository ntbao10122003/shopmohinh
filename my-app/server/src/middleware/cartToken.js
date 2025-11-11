import cookieParser from 'cookie-parser';
import { v4 as uuid } from 'uuid';

export const cookieMw = cookieParser();

export function ensureCartToken(req, res, next) {
  let token =
    req.headers['x-cart-token'] ||
    req.cookies?.cart_token ||
    null;

  if (!token && !req.user) {
    token = uuid();
    // lưu cookie (7 ngày). httpOnly=false để Postman đọc dễ hơn khi debug.
    res.cookie('cart_token', token, {
      httpOnly: false,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 3600 * 1000
    });
  }

  req.cartToken = token || null;
  next();
}
