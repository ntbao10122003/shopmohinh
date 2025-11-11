import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, cartItems } = location.state || {};

  // Nếu không có thông tin đơn hàng, chuyển hướng về trang chủ
  useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) return null;
  
  // Định dạng ngày
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="container" style={{ padding: '50px 0', textAlign: 'center' }}>
      <div className="success-message" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '80px', color: '#4CAF50', marginBottom: '20px' }}>✓</div>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>Đặt hàng thành công!</h1>
        <div style={{ textAlign: 'left', marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
            Thông tin đơn hàng
          </h3>
          
          <p><strong>Mã đơn hàng:</strong> {order.orderCode}</p>
          <p><strong>Ngày đặt hàng:</strong> {formatDate(order.createdAt || new Date())}</p>
          <p><strong>Trạng thái:</strong> <span style={{ color: '#4CAF50' }}>Đang xử lý</span></p>
          
          <h4 style={{ margin: '20px 0 10px 0' }}>Sản phẩm đã đặt:</h4>
          {cartItems && cartItems.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {cartItems.map((item, index) => (
                <li key={index} style={{ display: 'flex', marginBottom: '10px', padding: '10px', borderBottom: '1px solid #eee' }}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '15px' }} 
                  />
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{item.name}</p>
                    <p style={{ margin: '0', color: '#666' }}>Số lượng: {item.qty}</p>
                    <p style={{ margin: '5px 0 0 0', color: '#e74c3c', fontWeight: 'bold' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.qty)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có sản phẩm nào trong đơn hàng</p>
          )}
          
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
            <p style={{ textAlign: 'right', margin: '5px 0' }}>
              <strong>Tổng tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total || 0)}
            </p>
            {order.discount > 0 && (
              <p style={{ textAlign: 'right', margin: '5px 0', color: '#e74c3c' }}>
                <strong>Giảm giá:</strong> -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discount || 0)}
              </p>
            )}
            <p style={{ textAlign: 'right', margin: '5px 0', fontSize: '1.2em' }}>
              <strong>Thành tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPayable || order.total || 0)}
            </p>
          </div>
        </div>
        
        <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ marginTop: 0 }}>Thông tin giao hàng</h4>
          <p><strong>Người nhận:</strong> {order.customer?.fullName || 'N/A'}</p>
          <p><strong>Điện thoại:</strong> {order.customer?.phone || 'N/A'}</p>
          <p><strong>Địa chỉ:</strong> {[order.customer?.address, order.customer?.district, order.customer?.province].filter(Boolean).join(', ')}</p>
          <p><strong>Ghi chú:</strong> {order.customer?.note || 'Không có ghi chú'}</p>
          <p><strong>Hình thức thanh toán:</strong> {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}</p>
        </div>
        
        <p style={{ marginBottom: '30px', color: '#666' }}>
          Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.
          Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: <strong>1900 1234</strong>
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Về trang chủ
          </button>
          <button 
            onClick={() => navigate('/products')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
}
