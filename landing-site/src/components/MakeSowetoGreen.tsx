import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Briefcase } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const MakeSowetoGreen = () => {
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
      icon: MapPin,
      title: "Safer neighborhoods",
      text: "Less dumping, more visibility and pride",
    },
    {
      icon: Users,
      title: "Inclusive growth",
      text: "Formal pathways for reclaimers align with SA's integration guidelines",
    },
    {
      icon: Briefcase,
      title: "Tourism readiness",
      text: "Cleaner corridors support local business and culture",
    },
  ];

  return (
    <section ref={sectionRef} id="make-soweto-green" className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className={`mb-16 text-center transition-all duration-1000 ease-out ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="text-gradient">Make Soweto Green</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            We're cleaning up Soweto and building economic inclusion for reclaimers. Community clean-ups, separation-at-source drills, and service fees that dignify reclaimer work.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {impacts.map((impact, index) => (
            <Card
              key={index}
              className={`group border-border bg-card transform-gpu relative overflow-hidden transition-all duration-500 ease-out ${
                isVisible 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-12 opacity-0'
              }`}
              style={{
                transform: 'perspective(1000px) rotateX(5deg) rotateY(-2deg)',
                boxShadow: `
                  0 25px 50px rgba(0, 0, 0, 0.25),
                  0 12px 24px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transitionDelay: `${index * 150}ms`
              }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'perspective(1000px) rotateX(2deg) rotateY(-1deg) translateY(-8px) scale(1.02)';
                       e.currentTarget.style.boxShadow = `
                         0 35px 70px rgba(0, 0, 0, 0.35),
                         0 20px 40px rgba(0, 0, 0, 0.25),
                         0 0 40px rgba(34, 197, 94, 0.4),
                         0 0 80px rgba(34, 197, 94, 0.2),
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
              <CardContent className="p-8 relative z-10">
                {/* Floating Icon with Depth */}
                <div 
                  className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 transform-gpu shadow-lg"
                  style={{
                    transform: 'translateZ(20px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <impact.icon className="h-8 w-8 text-primary" />
                </div>
                
                {/* Text with Layered Depth */}
                <div className="space-y-3">
                  <h3 
                    className="text-xl font-semibold transform-gpu"
                    style={{ transform: 'translateZ(10px)' }}
                  >
                    {impact.title}
                  </h3>
                  <p 
                    className="text-muted-foreground transform-gpu"
                    style={{ transform: 'translateZ(5px)' }}
                  >
                    {impact.text}
                  </p>
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default MakeSowetoGreen;
