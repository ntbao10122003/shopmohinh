import { useState } from "react";
import { Link } from "react-router-dom";

export default function ProductCard({
  href = "#",
  image,
  title,
  category,
  price,
  priceDisplay,
  priceOld,
  priceOldDisplay,
  sale
}) {
  const [liked, setLiked] = useState(false);
  // Chuyển đổi priceOld và price sang số nếu chúng là chuỗi
  const priceNum = typeof price === 'string' ? parseFloat(price) : price || 0;
  const priceOldNum = priceOld ? (typeof priceOld === 'string' ? parseFloat(priceOld) : priceOld) : 0;
  
  // Hiển thị giá cũ nếu có giá và khác giá hiện tại
  const showOldPrice = priceOldNum > 0 && priceOldNum !== priceNum;
  
  // Calculate discount percentage if showOldPrice is true
  const discountPercentage = showOldPrice && priceOldNum > priceNum
    ? Math.round(((priceOldNum - priceNum) / priceOldNum) * 100)
    : 0;

  return (
    <div className="item-sanpham-single wow fadeIn">
      <Link to={href}>
        <div className="single-sanpham">
          <div className="image">
            <img src={image} alt={title} />
          </div>

          <div className="item-titlesp">
            <i className="tuvan butt_online">{category}</i>
            <div className="title">
              <h3 className="title5">{title}</h3>
            </div>

            <div className="giaban">
              {priceNum > 0 ? (
                <>
                  <p className="title3">{priceDisplay}₫</p>
                  {showOldPrice && (
                    <p className="title5 price-old">
                      {priceOldDisplay}₫
                    </p>
                  )}
                </>
              ) : (
                <p className="title3">Liên hệ</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
