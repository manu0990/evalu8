import React from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-800/50 bg-black">
      <div className="container mx-auto pt-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-semibold text-white tracking-tighter mb-4 block">evalu8</span>
            <p className="text-gray-400 mb-4 max-w-md">
              AI-powered interview practice platform helping professionals prepare, practice, and perform at their best.
            </p>
            <div className="flex space-x-4">
              <Button variant="secondary" className="rounded-full text-sm hover:bg-gray-200 transition-all cursor-pointer">
                <Link href="signup">Sign Up Free</Link>
              </Button>
              <Button className="text-gray-400 hover:text-white transition-colors text-sm underline cursor-pointer">
                <Link href="signin">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-gray-400 hover:text-white transition text-sm">Features</Link></li>
              <li><Link href="#pricing" className="text-gray-400 hover:text-white transition text-sm">Pricing</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition text-sm">Demo</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition text-sm">Contact Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition text-sm">Status</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-5 pb-3 border-t border-gray-800/50 gap-4">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} evalu8. All rights reserved.</p>
            <div className="flex items-center space-x-6">
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition">Privacy Policy</Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition">Terms of Service</Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition">Cookie Policy</Link>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;