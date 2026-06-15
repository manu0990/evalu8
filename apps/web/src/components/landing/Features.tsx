import React from 'react';
import { Card, CardContent } from '@repo/ui';

const Features: React.FC = () => {
  const features = [
    {
      title: "AI-Powered Interview Simulation",
      description: "Experience realistic interview scenarios with our advanced AI that adapts questions based on your responses and the specific role you're targeting."
    },
    {
      title: "Real-Time Performance Analytics",
      description: "Get instant feedback on your communication skills, technical accuracy, confidence level, and areas that need improvement after each session."
    },
    {
      title: "Role-Specific Question Banks",
      description: "Practice with tailored questions for your specific role and industry, from technical coding challenges to behavioral interview scenarios."
    },
    {
      title: "Progress Tracking & Insights",
      description: "Monitor your improvement over time with detailed analytics and personalized recommendations to help you prepare more effectively."
    },
    {
      title: "Speech & Communication Analysis",
      description: "Receive feedback on your speaking pace, clarity, filler words, and overall communication effectiveness to sound more confident."
    },
    {
      title: "Confidence Building Exercises",
      description: "Targeted practice sessions designed to build your interview confidence and help you perform at your best when it matters most."
    }
  ];

  return (
    <section id="features" className="min-h-screen py-20 bg-linear-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Why To Choose Evalu8
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our AI-powered platform gives you everything you need to prepare, practice, and perform at your absolute best in any interview scenario.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="bg-linear-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;