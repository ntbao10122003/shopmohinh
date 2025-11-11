import React from 'react';
import '../assets/footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-sm-6">
            <div className="single-box">
              <img src="img/logo.png" alt="" />
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quam repellendus sunt praesentium aspernatur iure molestias.
              </p>
              <h3>We Accect</h3>
              <div className="card-area">
                <i className="fa fa-cc-visa" aria-label="Visa"></i>
                <i className="fa fa-credit-card" aria-label="Credit Card"></i>
                <i className="fa fa-cc-mastercard" aria-label="Mastercard"></i>
                <i className="fa fa-cc-paypal" aria-label="PayPal"></i>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="single-box">
              <h2>Hosting</h2>
              <ul>
                <li><a href="#">Web Hosting</a></li>
                <li><a href="#">Cloud Hosting</a></li>
                <li><a href="#">CMS Hosting</a></li>
                <li><a href="#">WordPress Hosting</a></li>
                <li><a href="#">Email Hosting</a></li>
                <li><a href="#">VPS Hosting</a></li>
              </ul>
            </div>                    
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="single-box">
              <h2>Domain</h2>
              <ul>
                <li><a href="#">Web Domain</a></li>
                <li><a href="#">Cloud Domain</a></li>
                <li><a href="#">CMS Domain</a></li>
                <li><a href="#">WordPress Domain</a></li>
                <li><a href="#">Email Domain</a></li>
                <li><a href="#">VPS Domain</a></li>
              </ul>
            </div>                    
          </div>

          <div className="col-lg-3 col-sm-6">
            <div className="single-box">
              <h2>Newsletter</h2>
              <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Consequuntur doloremque earum similique fugiat nobis. Facere?
              </p>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Recipient's username"
                  aria-label="Enter your Email ..."
                  aria-describedby="basic-addon2"
                />
                <span className="input-group-text" id="basic-addon2">
                  <i className="fa fa-long-arrow-right" aria-label="Submit"></i>
                </span>
              </div>

              <h2>Follow us on</h2>
              <p className="socials">
                <i className="fa fa-facebook" aria-label="Facebook"></i>
                <i className="fa fa-dribbble" aria-label="Dribbble"></i>
                <i className="fa fa-pinterest" aria-label="Pinterest"></i>
                <i className="fa fa-twitter" aria-label="Twitter"></i>
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;