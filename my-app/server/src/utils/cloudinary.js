import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hàm upload ảnh lên Cloudinary
export const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'shopmohinh', // Thư mục lưu trữ trên Cloudinary
      use_filename: true,
      unique_filename: true,
    });
    return result;
  } catch (error) {
    console.error('Lỗi khi upload ảnh lên Cloudinary:', error);
    throw new Error('Không thể upload ảnh lên Cloudinary');
  }
};

// Hàm xóa ảnh khỏi Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Lỗi khi xóa ảnh khỏi Cloudinary:', error);
    throw new Error('Không thể xóa ảnh khỏi Cloudinary');
  }
};

export default cloudinary;
