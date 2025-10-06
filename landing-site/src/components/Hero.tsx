"use client"

import { Button } from "@/components/ui/button";
import Navigation from "./Navigation";
import { useEffect, useState } from "react";

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Navigation />
      <section className="relative h-screen w-full overflow-hidden">
        {/* Video/Image Background */}
        <div className="absolute inset-0">
          <img
            src="/SNWG Soweto.jpg"
            alt="Landfill waste management and recycling activities"
            className="w-full h-full object-cover"
            style={{
              transform: isLoaded ? 'scale(1)' : 'scale(2.5)',
              filter: isLoaded ? 'brightness(1) contrast(1) saturate(1)' : 'brightness(0.5) contrast(1.3) saturate(1.2)',
              transformOrigin: 'center center',
              transition: 'all 8000ms ease-out'
            }}
            onError={(e) => {
              console.error('Hero image failed to load:', e);
              console.log('Attempting to load:', e.currentTarget.src);
              // Try alternative paths
              const img = e.currentTarget;
              if (!img.src.includes('snwg-soweto.jpg')) {
                img.src = '/snwg-soweto.jpg';
              } else if (!img.src.includes('hero-landfill.jpg')) {
                img.src = '/hero-landfill.jpg';
              } else {
                img.style.display = 'none';
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full items-center justify-center px-4">
          <div className="max-w-5xl text-center">
            <h1 className={`mb-4 sm:mb-6 text-3xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight transition-all duration-1000 ease-out ${
              isLoaded 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-12 opacity-0'
            }`}>
              <span className={`inline-block transition-all duration-1500 ease-out delay-300 ${
                isLoaded 
                  ? 'translate-x-0 rotate-0 opacity-100' 
                  : '-translate-x-16 -rotate-3 opacity-0'
              }`}>
                Waste becomes wealth when we do it{" "}
                <span className={`text-gradient transition-all duration-1500 ease-out delay-600 ${
                  isLoaded 
                    ? 'translate-x-0 rotate-0 opacity-100' 
                    : 'translate-x-16 rotate-3 opacity-0'
                }`}>
                  together
                </span>
              </span>
            </h1>
            <p className={`mb-6 sm:mb-8 text-lg sm:text-xl md:text-2xl text-muted-foreground transition-all duration-1200 ease-out delay-900 ${
              isLoaded 
                ? 'translate-y-0 scale-100 opacity-100' 
                : 'translate-y-12 scale-95 opacity-0'
            }`}>
              <span className={`inline-block transition-all duration-1000 ease-out delay-1000 ${
                isLoaded 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-4 opacity-0'
              }`}>
                Join Woza Mali. 
              </span>
              <span className={`inline-block transition-all duration-1000 ease-out delay-1100 ${
                isLoaded 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-4 opacity-0'
              }`}>
                Earn for recycling. 
              </span>
              <span className={`inline-block transition-all duration-1000 ease-out delay-1200 ${
                isLoaded 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-4 opacity-0'
              }`}>
                Back Green Scholar. 
              </span>
              <span className={`inline-block transition-all duration-1000 ease-out delay-1300 ${
                isLoaded 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-4 opacity-0'
              }`}>
                Make Soweto Green.
              </span>
            </p>
            <div className={`flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center transition-all duration-1000 ease-out delay-1400 overflow-hidden ${
              isLoaded 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}>
              <Button
                size="lg"
                className={`group relative bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all duration-1000 ease-out text-base sm:text-lg hover:scale-110 hover:shadow-2xl hover:shadow-primary/30 overflow-hidden ${
                  isLoaded ? 'button-slide-in' : 'button-slide-left'
                }`}
                onClick={() => scrollToSection("woza-mali")}
                style={{
                  transitionDelay: '1500ms'
                }}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:translate-x-1">Join Woza Mali</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-md blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={`group relative border-orange-500/50 text-orange-600 hover:bg-orange-500/10 transition-all duration-1000 ease-out text-base sm:text-lg hover:scale-110 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 overflow-hidden ${
                  isLoaded ? 'button-slide-in' : 'button-slide-right'
                }`}
                onClick={() => scrollToSection("green-scholar")}
                style={{
                  transitionDelay: '1600ms'
                }}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:translate-x-1">Donate PET</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-orange-500/5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 to-transparent rounded-md blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-orange-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              </Button>
            </div>
            <p className={`mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground transition-all duration-1000 ease-out delay-1000 ${
              isLoaded 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-4 opacity-0'
            }`}>
              Premium, community-first recycling by Sebenza Nathi Waste
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
