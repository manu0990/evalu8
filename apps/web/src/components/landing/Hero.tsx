import React from 'react';
import { Button, Badge } from '@repo/ui';

const Hero = () => {
  return (
    <section className="flex justify-center items-center h-screen bg-gradient-to-br from-black via-gray-800 to-black text-white">
      <div className="text-center max-w-4xl px-6">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
          Rise Above The Rest
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
          Practice smarter with Evalu8 — your AI-powered interview coach.
        </p>
        
        {/* Main CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full px-8 w-full sm:w-auto cursor-pointer">
            Start For Free
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-8 w-full sm:w-auto cursor-pointer">
            Watch Demo
          </Button>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          <Badge variant="secondary" className="bg-gray-800/80 border border-gray-600 text-gray-200 rounded-full px-4 py-1.5">
            ✨ AI-Powered Analysis
          </Badge>
          <Badge variant="secondary" className="bg-gray-800/80 border border-gray-600 text-gray-200 rounded-full px-4 py-1.5">
            📊 Real-time Feedback
          </Badge>
          <Badge variant="secondary" className="bg-gray-800/80 border border-gray-600 text-gray-200 rounded-full px-4 py-1.5">
            🎯 Role-specific Practice
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default Hero;
