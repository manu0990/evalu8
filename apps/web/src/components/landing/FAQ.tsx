"use client"

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui';

const faqData = [
  {
    question: "How does AI-powered interview evaluation work?",
    answer: "evalu8 uses advanced AI to analyze your responses, speech patterns, confidence level, and technical accuracy. Our system provides instant feedback on your communication skills, technical knowledge, and areas for improvement - just like a real interviewer would."
  },
  {
    question: "Can I practice for any job role or industry?",
    answer: "Absolutely! Our AI adapts to any role - from software engineering and data science to marketing, finance, consulting, and more. Simply upload a job description or select from our curated list of popular roles to get tailored questions and evaluation criteria."
  },
  {
    question: "What makes evalu8 different from other interview prep tools?",
    answer: "Unlike static question banks, evalu8 provides real-time AI analysis, personalized coaching tips, and adaptive questioning based on your responses. You get immediate feedback on both technical skills and soft skills, helping you improve faster and build genuine confidence."
  },
  {
    question: "Is my interview data secure and private?",
    answer: "Yes, absolutely. Your interview sessions, resume data, and personal information are encrypted and never shared with third parties. All practice sessions are confidential, and you have full control over your data. See our Privacy Policy for complete details."
  },
];


const FAQ: React.FC = () => {
  return (
    <section id="faq" className="py-24 bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">Everything you need to know about evalu8 and how it helps you ace your interviews</p>
        </div>
        <div className="w-full p-4 sm:p-0">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqData.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-gray-800/50 rounded-2xl px-6 py-2 hover:bg-gray-700/50 transition-all duration-700 ease-in-out">
                <AccordionTrigger className="text-white hover:text-gray-200 text-left font-semibold text-lg py-4 hover:no-underline cursor-pointer">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 pb-6 pt-2 text-base leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;