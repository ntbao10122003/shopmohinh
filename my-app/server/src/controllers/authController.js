import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Admin } from '../models/Admin.js'

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-123'

export const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Thiếu username hoặc password' })

    const existing = await Admin.findOne({ username })
    if (existing)
      return res.status(400).json({ success: false, message: 'Admin đã tồn tại' })

    const hash = await bcrypt.hash(password, 10)
    const admin = await Admin.create({ username, password: hash })

    res.json({ success: true, message: 'Đăng ký thành công', data: { id: admin._id, username } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body
    const admin = await Admin.findOne({ username })
    if (!admin)
      return res.status(400).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' })

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid)
      return res.status(400).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' })

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '2d' }
    )

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      data: { id: admin._id, username: admin.username },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
