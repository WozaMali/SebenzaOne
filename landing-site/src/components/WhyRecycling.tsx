"use client"

import { useState, useEffect, useRef } from "react";
import { Recycle, Users, TrendingUp, Leaf, Factory, DollarSign, Zap, Globe, Heart, Shield, ArrowRightLeft, Sparkles, RotateCcw, Building2, Coins, TreePine, Wrench, Sparkle, Target, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CircularEconomyPopup from "./CircularEconomyPopup";
import JobsChainPopup from "./JobsChainPopup";
import CommunityDividendsPopup from "./CommunityDividendsPopup";

const WhyRecycling = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isJobsPopupOpen, setIsJobsPopupOpen] = useState(false);
  const [isDividendsPopupOpen, setIsDividendsPopupOpen] = useState(false);
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
  const impacts = [
    {
      icon: RotateCcw,
      title: "Circular value",
      description: "Plastics, paper, glass, and metals get reused, cutting landfill loads and pollution.",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-500/10 to-emerald-600/10",
    },
    {
      icon: Building2,
      title: "Jobs across the chain",
      description: "Collection, transport, sorting, cleaning, and remanufacturing—it's work with dignity and impact.",
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-500/10 to-cyan-600/10",
    },
    {
      icon: Coins,
      title: "Community dividends",
      description: "When households separate at source, reclaimers earn more and municipalities save millions in landfill costs.",
      gradient: "from-orange-500 to-yellow-600",
      bgGradient: "from-orange-500/10 to-yellow-600/10",
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className={`mb-16 text-center transition-all duration-1000 ease-out ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-12 opacity-0'
        }`}>
          <h2 className={`mb-4 text-4xl font-bold md:text-5xl transition-all duration-1200 ease-out delay-200 ${
            isVisible 
              ? 'translate-x-0 opacity-100' 
              : '-translate-x-8 opacity-0'
          }`}>
            Why recycling <span className={`text-gradient transition-all duration-1200 ease-out delay-400 ${
              isVisible 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-8 opacity-0'
            }`}>matters</span>
          </h2>
          <p className={`mx-auto max-w-3xl text-lg text-muted-foreground transition-all duration-1000 ease-out delay-600 ${
            isVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-8 opacity-0'
          }`}>
            Recycling keeps valuable materials in the economy and out of our environment—while creating real livelihoods across collection, sorting, and manufacturing.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 card-container">
          {impacts.map((impact, index) => (
            <div key={index} className="relative group">
              <Card
                className={`border-border bg-card transform-gpu relative overflow-hidden card-hover ${
                  isVisible 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-20 opacity-0'
                }`}
                style={{
                  transitionDelay: `${800 + index * 300}ms`,
                  transform: isVisible 
                    ? 'perspective(1000px) rotateX(5deg) rotateY(-2deg)' 
                    : 'perspective(1000px) rotateX(15deg) rotateY(-10deg) translateY(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
              <CardContent className="p-8 relative z-10">
                {/* Floating Icon with Depth */}
                <div 
                  className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${impact.bgGradient} p-4 transform-gpu shadow-lg`}
                  style={{
                    transform: 'translateZ(20px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <impact.icon className="h-10 w-10 text-orange-500" />
                </div>
                
                {/* Text with Layered Depth */}
                <div className="space-y-4">
                  <h3 
                    className={`text-2xl font-bold text-foreground transform-gpu transition-all duration-1000 ease-out ${
                      isVisible 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-8 opacity-0'
                    }`}
                    style={{ 
                      transform: 'translateZ(10px)',
                      transitionDelay: `${1000 + index * 300}ms`
                    }}
                  >
                    {impact.title}
                  </h3>
                  <p 
                    className={`text-muted-foreground leading-relaxed transform-gpu transition-all duration-1000 ease-out ${
                      isVisible 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-12 opacity-0'
                    }`}
                    style={{ 
                      transform: 'translateZ(5px)',
                      transitionDelay: `${1200 + index * 300}ms`
                    }}
                  >
                    {impact.description}
                  </p>
                  <button 
                    onClick={() => {
                      console.log('Button clicked for index:', index);
                      if (index === 0) {
                        setIsPopupOpen(true);
                      } else if (index === 1) {
                        setIsJobsPopupOpen(true);
                      } else if (index === 2) {
                        setIsDividendsPopupOpen(true);
                      }
                    }}
                    className={`group/btn flex items-center text-sm font-medium text-primary hover:text-primary/80 transform-gpu cursor-pointer relative z-20 transition-all duration-500 hover:scale-110 overflow-hidden ${
                      isVisible 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-16 opacity-0'
                    }`}
                    style={{ 
                      transform: 'translateZ(8px)',
                      transitionDelay: `${1400 + index * 300}ms`
                    }}
                  >
                    <span className="relative z-10 transition-all duration-500 group-hover/btn:translate-x-2 group-hover/btn:scale-105">
                      Learn more
                    </span>
                    <ArrowRightLeft className="ml-2 h-4 w-4 transition-all duration-500 group-hover/btn:translate-x-2 group-hover/btn:rotate-180 group-hover/btn:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-md opacity-0 group-hover/btn:opacity-100 transition-all duration-500"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-md blur-sm opacity-0 group-hover/btn:opacity-100 transition-all duration-500"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-md scale-0 group-hover/btn:scale-100 transition-transform duration-500 origin-left"></div>
                  </button>
                </div>

                {/* Subtle 3D Border Effect */}
                <div 
                  className="absolute inset-0 rounded-lg border-2 border-transparent"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent, rgba(0,0,0,0.1))',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'xor',
                    WebkitMaskComposite: 'xor'
                  }}
                ></div>
              </CardContent>

              {/* Ambient Light Effect */}
              <div 
                className="absolute top-0 left-0 w-full h-full opacity-30"
                style={{
                  background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  transform: 'translateZ(-5px)'
                }}
              ></div>

                {/* Hover Flare Effect */}
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      {/* Circular Economy Popup */}
      <CircularEconomyPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
      
      {/* Jobs Chain Popup */}
      <JobsChainPopup 
        isOpen={isJobsPopupOpen} 
        onClose={() => setIsJobsPopupOpen(false)} 
      />
      
      {/* Community Dividends Popup */}
      <CommunityDividendsPopup 
        isOpen={isDividendsPopupOpen} 
        onClose={() => setIsDividendsPopupOpen(false)} 
      />
    </section>
  );
};

export default WhyRecycling;
