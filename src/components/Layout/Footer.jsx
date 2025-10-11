import React from 'react';
import { Package, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

// Footer provides quick links and contact information.
const Footer = () => {
  return (
    <footer id="site-footer" className="footer">
      <div className="footer-container">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Package className="h-8 w-8 text-burrow-primary drop-shadow" />
            <span className="text-2xl font-extrabold text-burrow-primary tracking-tight">Burrow</span>
          </div>
          <p className="text-burrow-text-secondary text-sm">
            Delivery rescheduling made simple. Take control of your deliveries and schedule them on your terms.
          </p>
        </div>

        <div>
          <h3 className="footer-heading">Services</h3>
          <ul className="space-y-2 text-sm text-burrow-text-secondary">
            <li><Link to="/how-it-works" className="footer-link">How It Works</Link></li>
            <li><Link to="/warehouses" className="footer-link">Warehouses</Link></li>
            <li><Link to="/pricing" className="footer-link">Pricing</Link></li>
            <li><Link to="/track" className="footer-link">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="footer-heading">Support</h3>
          <ul className="space-y-2 text-sm text-burrow-text-secondary">
            <li><Link to="/help" className="footer-link">Help Center</Link></li>
            <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
            <li><Link to="/faq" className="footer-link">FAQ</Link></li>
            <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="footer-heading">Contact</h3>
          <div className="space-y-2 text-sm text-burrow-text-secondary">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-burrow-primary" />
              <span>support@burrow.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-burrow-primary" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-burrow-primary" />
              <span>Mumbai, India</span>
            </div>
          </div>
        </div>
      </div>

      <div className="layout-container border-t border-burrow-border/80 mt-8 pt-8 text-center">
        <p className="text-sm text-burrow-text-secondary">
          © 2024 Burrow. All rights reserved. |
          <Link to="/privacy" className="footer-link ml-1">Privacy Policy</Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
