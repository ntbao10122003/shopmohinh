import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import banner1 from "../assets/images/site49/site49_bann_col0_slide.png";

export default function Banner() {
  const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    dots: false,
    arrows: false,
    infinite: true,
    speed: 1200,
    fade: false,
    cssEase: "linear",
  };

  const slides = [1, 2, 3, 4, 5];

  return (
    <div className="site49_bann_col0_slide">
      <Slider className="bann_slide_home wow fadeInDown" {...settings}>
        {slides.map((n) => (
          <div className="single-image" key={n}>
              <img src={banner1} alt="" />
          </div>
        ))}
      </Slider>
    </div>
  );
}

