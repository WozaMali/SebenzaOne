"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState, useRef } from "react";

const FAQ = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const faqs = [
    {
      question: "What can I bring?",
      answer: "Clean PET, aluminum cans, glass, paper, cardboard, and certain metals. No organic or hazardous waste.",
    },
    {
      question: "How are rates set?",
      answer: "Rates reflect current market demand and are published weekly. You see weight and reward instantly.",
    },
    {
      question: "Can reclaimers participate?",
      answer: "Yes. We co-create routes, depot schedules, and service fees aligned with integration principles.",
    },
    {
      question: "Do you operate in Soweto?",
      answer: "Yes. We prioritize Soweto corridors for clean-ups, depot activation, and inclusive earning.",
    },
    {
      question: "How does Green Scholar use PET donations?",
      answer: "PET value funds bursaries, school kits, and workshops—tracked and reported to donors.",
    },
    {
      question: "Is there a minimum amount to bring?",
      answer: "No minimum. Every contribution counts and adds to your impact tracker.",
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="group border border-border bg-card rounded-lg px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:border-primary/30"
            >
              <AccordionTrigger className="text-left text-foreground hover:text-primary transition-smooth">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
