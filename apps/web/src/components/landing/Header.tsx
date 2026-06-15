"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui';

const Header: React.FC = () => {

  const navClassName = "text-gray-300 hover:bg-gray-700 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm"

  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center relative">
        <Link href="/" className="text-2xl font-semibold text-white tracking-tighter">Evalu8</Link>

        {/* Desktop Navigation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block">
          <nav className="flex items-center space-x-1 bg-gray-900/70 border border-gray-700/80 rounded-full p-1 backdrop-blur-sm">
            <Link href="#features" className={navClassName}>Features</Link>
            <Link href="#pricing" className={navClassName}>Pricing</Link>
            <Link href="#faq" className={navClassName}>FAQ</Link>
          </nav>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-white rounded-full">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button size="sm" className="hidden sm:flex bg-white text-black hover:bg-gray-200 rounded-full">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>

      </div>
    </header>
  );
};

export default Header;