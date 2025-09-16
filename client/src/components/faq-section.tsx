import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How does AI SEO optimization work in 2025?",
    answer: "AI SEO optimization in 2025 focuses on structured data, conversational content, and entity recognition to help AI engines like Google SGE, Perplexity, and Bing Copilot understand and surface your content effectively. Our platform automates the implementation of 96+ optimization points including Schema.org markup, voice search readiness, and Core Web Vitals enhancement."
  },
  {
    question: "What Schema.org markup is required for AI discovery?",
    answer: "Essential Schema.org types include BlogPosting/Article, BreadcrumbList, Organization, Person, FAQPage, and WebPage. Recommended additions are HowTo, VideoObject, and QAPage for enhanced AI visibility. Our platform automatically generates and validates all required markup based on your content type."
  },
  {
    question: "How do I optimize content for voice search?",
    answer: "Voice search optimization requires natural language patterns, Q&A formatting, and conversational markers. Structure content with clear questions and concise answers, use semantic keyword clusters, and include local SEO elements. Our platform automatically formats content for optimal voice assistant compatibility."
  },
  {
    question: "Which AI engines does your optimization support?",
    answer: "Our optimization covers Google SGE, Perplexity, Bing Copilot, ChatGPT, Claude, and Meta AI. Each engine has specific requirements for content discovery, which we address through comprehensive structured data, entity recognition, and content formatting strategies."
  },
  {
    question: "What are Core Web Vitals and why do they matter for AI SEO?",
    answer: "Core Web Vitals measure page loading performance (LCP), visual stability (CLS), and interactivity (FID). AI engines prioritize fast, stable pages for better user experience. Our platform includes critical CSS inlining, image optimization, and performance monitoring to achieve optimal scores."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* FAQ Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="faq-title">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="faq-description">
            Everything you need to know about AI SEO optimization and our platform.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-background rounded-lg border border-border overflow-hidden"
              data-testid={`faq-item-${index}`}
            >
              <button
                className="w-full p-6 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                onClick={() => toggleFAQ(index)}
                data-testid={`faq-question-${index}`}
              >
                <span className="font-semibold pr-4">{faq.question}</span>
                <ChevronDown 
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              {openIndex === index && (
                <div 
                  className="px-6 pb-6 text-muted-foreground"
                  data-testid={`faq-answer-${index}`}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
