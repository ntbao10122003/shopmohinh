import { Order } from '../models/Order.js';
import AppError from '../utils/appError.js';

export const getOrders = async (req, res, next) => {
  try {
    // 1) Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 2) Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryObj.$or = [
        { 'orderCode': { $regex: searchRegex } },
        { 'customer.fullName': { $regex: searchRegex } },
        { 'customer.phone': { $regex: searchRegex } },
        { 'customer.email': { $regex: searchRegex } }
      ];
    }

    // 3) Execute query
    let query = Order.find(queryObj);

    // 4) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 5) Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(queryObj);

    query = query.skip(skip).limit(limit);

    // 6) Populate product info
    query = query.populate('items.product', 'name price image');

    const orders = await query;

    // 7) Send response
    res.status(200).json({
      status: 'success',
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price image');

    if (!order) {
      return next(new AppError('Không tìm thấy đơn hàng', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    // This assumes you have user information in req.user from your auth middleware
    const orders = await Order.find({ 'customer.user': req.user?.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name price image');

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, shippingInfo, paymentInfo } = req.body;

    // Only allow updating specific fields
    const updateData = {};
    if (status) updateData.status = status;
    if (shippingInfo) updateData.shippingInfo = shippingInfo;
    if (paymentInfo) updateData.paymentInfo = paymentInfo;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.product', 'name price image');

    if (!order) {
      return next(new AppError('Không tìm thấy đơn hàng', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByIdAndDelete(id);
    
    if (!order) {
      return next(new AppError('Không tìm thấy đơn hàng', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
