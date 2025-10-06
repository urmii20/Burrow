import React from 'react';
import { Package, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="site-footer" className="bg-burrow-background border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-8 w-8 text-burrow-primary" />
              <span className="text-2xl font-extrabold bg-gradient-to-r from-burrow-primary to-burrow-secondary bg-clip-text text-transparent tracking-tight">
                Burrow
              </span>
            </div>
            <p className="text-burrow-text-secondary text-sm">
              Delivery rescheduling made simple. Take control of your deliveries and schedule them on your terms.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-burrow-text-primary mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-burrow-text-secondary">
              <li><Link to="/how-it-works" className="hover:text-burrow-primary transition-colors">How It Works</Link></li>
              <li><Link to="/warehouses" className="hover:text-burrow-primary transition-colors">Warehouses</Link></li>
              <li><Link to="/pricing" className="hover:text-burrow-primary transition-colors">Pricing</Link></li>
              <li><Link to="/tracking" className="hover:text-burrow-primary transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-burrow-text-primary mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-burrow-text-secondary">
              <li><Link to="/help" className="hover:text-burrow-primary transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-burrow-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-burrow-primary transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-burrow-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-burrow-text-primary mb-4">Contact</h3>
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

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-burrow-text-secondary">
            © 2024 Burrow. All rights reserved. |
            <Link to="/privacy" className="hover:text-burrow-primary transition-colors ml-1">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
