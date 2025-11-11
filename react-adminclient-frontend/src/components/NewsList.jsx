import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function NewsList() {
  const [posts, setPosts] = useState([]);

  const settings = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: false,
    arrows: false,
    autoplay: false,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 1270,
        settings: {
          cssEase: "cubic-bezier(0.77, 0, 0.18, 1)",
          variableWidth: true,
          slidesToShow: 1
        }
      }
    ]
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/posts");
        const json = await res.json();

        // Backend trả về: data.data
        setPosts(json?.data?.data || []);
      } catch (err) {
        console.log("❌ Error fetch posts:", err);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return { day, month, year };
  };

  return (
    <div className="site49_new_col12_tintuc">
      <div className="container">
        <div className="item-title">
          <h2 className="title1">Kiến thức cần thiết</h2>
        </div>

        <Slider className="slide-news-item" {...settings}>
          {posts.map((post) => {
            const { day, month, year } = formatDate(post.createdAt);
            return (
              <div className="item-product" key={post.id}>
                <a href={`/post/${post.id}`} title="">
                  <div className="imagets">
                    <img
                      src={post.coverImage || "/images/no-img.png"}
                      alt={post.title}
                    />
                    <div className="date">
                      <h3>{day}</h3>
                      <span>{month}</span>
                      <span>/{year}</span>
                    </div>
                    <div className="gets-title">
                      <span className="title2_1_1">{post.title}</span>
                    </div>
                  </div>

                  <div className="item-detail">
                    <h3 className="title2_1_1">{post.title}</h3>
                    <p className="title3_1">
                      {post.content.substring(0, 80)}...
                    </p>
                  </div>
                </a>
              </div>
            );
          })}

          {posts.length === 0 && (
            <div className="item-product">
              <p>Đang tải tin tức...</p>
            </div>
          )}
        </Slider>

        <a href="/news" className="butt butt_more butt_cl2">
          Xem tất cả
        </a>
      </div>
    </div>
  );
}
