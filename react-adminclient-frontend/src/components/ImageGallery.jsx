import { useEffect, useState } from "react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

export default function ImageGallery() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/gallery");
        const json = await res.json();

        // API đang trả 1 object => convert thành array
        const data = json?.data?.data;

        if (data) {
          const arr = Array.isArray(data) ? data : [data];
          setPhotos(arr);
        }
      } catch (err) {
        console.log("❌ Error fetching gallery:", err);
      }
    };

    fetchGallery();
  }, []);

  useEffect(() => {
    Fancybox.bind("[data-fancybox='gallery']", {
      Thumbs: {
        autoStart: true,
      },
    });

    return () => {
      Fancybox.destroy();
    };
  }, []);

  return (
    <section className="sec-customer">
      <div className="customer-photo row">
        {photos.length === 0 && <p>Đang tải ảnh...</p>}

        {photos.map((p, i) => (
          <a key={i} href={p.imageUrl} className="item" data-fancybox="gallery">
            <figure>
              <img
                src={p.imageUrl}
                alt={p.altText || "gallery image"}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </a>
        ))}
      </div>
    </section>
  );
}
