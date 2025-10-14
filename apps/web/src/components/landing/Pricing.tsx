"use client";

import React from 'react';
import { Button } from '@repo/ui';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const Pricing: React.FC = () => {
  const router = useRouter();

  const handlePurchaseClick = (planName: string) => {
    if(planName === "Free") router.push("/signup");
    else toast.info(`${planName} plan will be available soon.`);
  };

  const plans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "5 mock interviews per week",
        "Basic AI feedback",
        "Progress tracking",
        "Community support",
        "Max 30 mins per session"
      ],
      buttonText: "Try Now",
      buttonVariant: "secondary" as const,
      popular: false
    },
    {
      name: "Pro",
      price: "9",
      period: "month",
      description: "Best for regular practice",
      features: [
        "Unlimited mock interviews",
        "Advanced model support",
        "Detailed analytics",
        "Priority support",
        "Max 2 hrs per session",
        "Custom question sets"
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Lifetime",
      price: "129",
      period: "one-time",
      description: "Pay once, use forever",
      features: [
        "Everything in Pro",
        "Lifetime access",
        "Future updates included",
        "No recurring fees",
        "VIP support",
        "Early access to new features"
      ],
      buttonText: "Buy Lifetime",
      buttonVariant: "default" as const,
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the plan that works best for you. Start for free and upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-white text-black shadow-2xl scale-105'
                  : 'bg-gray-900 text-white border border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className={`text-lg ${plan.popular ? 'text-gray-600' : 'text-gray-400'}`}>
                    /{plan.period}
                  </span>
                </div>
                <p className={`${plan.popular ? 'text-gray-600' : 'text-gray-400'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg
                      className={`w-5 h-5 mr-3 ${
                        plan.popular ? 'text-green-500' : 'text-green-400'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className={plan.popular ? 'text-gray-700' : 'text-gray-300'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "default" : plan.buttonVariant}
                className={`w-full rounded-full cursor-pointer ${
                  plan.popular
                    ? 'bg-black text-white hover:bg-gray-800'
                    : plan.name === 'Lifetime'
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : ''
                }`}
                onClick={() => handlePurchaseClick(plan.name)}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;