import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function NewsDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/v1/posts/${id}`);
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu bài viết');
        }
        const result = await response.json();
        // Extract the nested data
        const postData = result.data?.data || result.data || result;
        console.log('Extracted post data:', postData);
        setPost(postData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Debug log
  console.log('Current post data:', post);
  console.log('Loading:', loading, 'Error:', error);

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">Lỗi: {error}</div>;
  if (!post) return <div className="not-found">Không tìm thấy bài viết</div>;

  // Format the data to match the existing component structure
  const breadcrumb = [
    { name: "Trang chủ", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: post.title || "Bài viết", href: "#" },
  ];

  const hero = {
    image: post.coverImage || "/images/site49/chitiettintuc.png",
    title: post.title || "",
    dateIcon: "/images/site49/dh.png",
    dateText: new Date(post.createdAt || new Date()).toLocaleDateString('vi-VN'),
  };

  // Split content into paragraphs for the intro section
  console.log('Post content:', post.content);
  const intro = post.content 
    ? (Array.isArray(post.content) 
        ? post.content 
        : String(post.content).split('\n').filter(p => p.trim() !== '')
      )
    : [];

  // Section data (you can modify this based on your API response)
  const section = {
    number: "1",
    heading: post.title || "Nội dung bài viết",
    paras: intro,
    image: post.image || "/images/site49/image1.png",
  };
  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="site49_breadcrumb_col3_chitiettintuc breadcrumb">
        {breadcrumb.map((b, i) => (
          // Nếu dùng react-router-dom: <Link key={i} to={b.href} title={b.name}>{b.name}</Link>
          <a key={i} href={b.href} title={b.name}>
            {b.name}
          </a>
        ))}
      </div>

      <div className="item_page_news">
        <div className="site49_new_col9_chitiettintuc">
          <div className="content z-index">
            {/* Hero */}
            <div className="bann-chitiettintuc ">
             
              <div className="title">
                <h2 className="title1_3">{hero.title}</h2>
              </div>
            </div>
             <div className="image">
                <img src={hero.image} alt={hero.title} />
              </div>

            <div className="desc-content">
                {post.content}
            </div>
          
          </div>
        </div>
      </div>
    </div>
  );
}
