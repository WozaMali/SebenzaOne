import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Lightbulb, TrendingUp, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import maishaImage from "@/assets/Maisha.png";
import greenScholarLogo from "@/assets/Green Scholar.png";
import GreenScholarPopup from "./GreenScholarPopup";

const GreenScholar = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    preference: "",
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      toast.error("Please provide your name and mobile number.");
      return;
    }
    toast.success("Thank you for your PET donation pledge! We'll contact you with pickup details.");
    setFormData({ name: "", mobile: "", preference: "" });
  };

  const impacts = [
    {
      icon: GraduationCap,
      text: "Education equity: Channel recyclables into learning support",
    },
    {
      icon: Lightbulb,
      text: "Community labs: Workshops on sorting, material science, and circular design",
    },
    {
      icon: TrendingUp,
      text: "Lifelong dividends: Education reduces poverty and amplifies local leadership",
    },
  ];

  return (
    <section ref={sectionRef} id="green-scholar" className="py-24 px-4 bg-secondary/30">
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
            <span className={`text-gradient transition-all duration-1200 ease-out delay-400 ${
              isVisible 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-8 opacity-0'
            }`}>Green Scholar</span>: Donate PET, change a life
          </h2>
          <p className={`mx-auto max-w-2xl text-xl text-muted-foreground mb-8 transition-all duration-1000 ease-out delay-600 ${
            isVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-8 opacity-0'
          }`}>
            PET can fund education in disadvantaged homes
          </p>
          <div className={`flex justify-center transition-all duration-1000 ease-out delay-800 ${
            isVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-8 opacity-0'
          }`}>
            <img
              src={greenScholarLogo}
              alt="Green Scholar Logo"
              className="h-32 w-auto"
            />
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Info */}
          <div>
            <p className="mb-8 text-lg text-foreground">
              Your donated PET supports children who need nutrition, school essentials, and STEM clubs through Green Scholar Fund. Small bags, big futures.
            </p>

            <div className="space-y-6">
              {impacts.map((impact, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <impact.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground pt-2">{impact.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Learn More Button */}
            <div className="mt-8 space-y-3">
              {/* Orange Box with "Learn more about" */}
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg shadow-lg">
                <span className="text-white font-semibold text-sm">Learn more about</span>
              </div>
              
              {/* Green Scholar Fund Card */}
              <div className="relative group">
                {/* Glow effect container - outside the card */}
                <div 
                  className="absolute -inset-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.2))',
                    filter: 'blur(8px)',
                    zIndex: -1
                  }}
                />
                <Card 
                  className="border-primary/30 bg-card/50 cursor-pointer transform-gpu relative overflow-hidden transition-all duration-500 ease-out" 
                  onClick={() => setIsPopupOpen(true)}
                  style={{
                    transform: 'perspective(1000px) rotateX(5deg) rotateY(-2deg)',
                    boxShadow: `
                      0 25px 50px rgba(0, 0, 0, 0.25),
                      0 12px 24px rgba(0, 0, 0, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                         onMouseEnter={(e) => {
                           e.currentTarget.style.transform = 'perspective(1000px) rotateX(2deg) rotateY(-1deg) translateY(-8px) scale(1.02)';
                           e.currentTarget.style.boxShadow = `
                             0 35px 70px rgba(0, 0, 0, 0.35),
                             0 20px 40px rgba(0, 0, 0, 0.25),
                             inset 0 1px 0 rgba(255, 255, 255, 0.2)
                           `;
                         }}
                         onMouseLeave={(e) => {
                           e.currentTarget.style.transform = 'perspective(1000px) rotateX(5deg) rotateY(-2deg)';
                           e.currentTarget.style.boxShadow = `
                             0 25px 50px rgba(0, 0, 0, 0.25),
                             0 12px 24px rgba(0, 0, 0, 0.15),
                             inset 0 1px 0 rgba(255, 255, 255, 0.1)
                           `;
                         }}
                >
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-lg font-bold text-primary transform-gpu"
                      style={{ transform: 'translateZ(10px)' }}
                    >
                      Green Scholar Fund
                    </span>
                    <ArrowRightLeft 
                      className="h-5 w-5 text-primary transform-gpu" 
                      style={{ transform: 'translateZ(15px)' }}
                    />
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
                       <div 
                         className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                         style={{
                           background: 'radial-gradient(circle at 50% 30%, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.15) 30%, transparent 60%)',
                           transform: 'translateZ(-3px)'
                         }}
                       ></div>
              </Card>
              </div>
            </div>
          </div>

          {/* Right: Maisha Image */}
          <div className="flex justify-center items-center">
            <div className="relative">
              <img
                src={maishaImage}
                alt="Maisha bottle buddy - Green Scholar mascot"
                className="w-full max-w-md h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Green Scholar Fund Popup */}
      <GreenScholarPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </section>
  );
};

export default GreenScholar;
