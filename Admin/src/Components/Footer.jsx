import React from "react";
import Powered from "./Loading/Powered";
import "../Styles/Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p className="footer-copyright">
          &copy; {currentYear} Kumaran E-Services. All rights reserved.
        </p>

        <div className="footer-links">
          <a href="#" className="footer-link">
            Privacy Policy
          </a>
          <a href="#" className="footer-link">
            Terms of Service
          </a>
          <div className="footer-powered">
            <Powered theme="light" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
