import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, BarChart3, Zap, Home, Scale, DollarSign, TrendingUp } from "lucide-react";
import landImage from "@/assets/Land.png";
import { useEffect, useState, useRef } from "react";

const WozaMali = () => {
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

  const perks = [
    { icon: Coins, text: "Guaranteed rewards: Transparent rates per kg" },
    { icon: BarChart3, text: "Impact tracker: See CO2 savings and landfill diversion" },
    { icon: Zap, text: "Fast payouts: Seamless rewards and partner redemptions" },
  ];

  const flowSteps = [
    {
      icon: Home,
      title: "Separate at home",
      description: "Sort PET, cans, paper, glass, and metals into clean streams",
    },
    {
      icon: Scale,
      title: "Our Reclaimers collect at your door step",
      description: "We weigh your recyclables with transparent, live rates",
    },
    {
      icon: Coins,
      title: "Earn instant rewards",
      description: "Points convert to cash or partner rewards immediately",
    },
    {
      icon: TrendingUp,
      title: "Track your impact",
      description: "See your CO₂ savings, landfill diversion, and earnings history",
    },
  ];

  return (
    <section ref={sectionRef} id="woza-mali" className="py-24 px-4 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={landImage}
          alt="Landfill landscape"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/90"></div>
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
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
            }`}>Woza Mali</span> is here for you
          </h2>
          <p className={`mx-auto max-w-2xl text-xl text-muted-foreground transition-all duration-1000 ease-out delay-600 ${
            isVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-8 opacity-0'
          }`}>
            Earn cash for clean recycling
          </p>
        </div>

        {/* Perks Section */}
        <div className="mb-16">
          <div className="grid gap-6 md:grid-cols-3">
            {perks.map((perk, index) => (
              <Card
                key={index}
                     className={`group border-border bg-card transform-gpu relative overflow-hidden transition-all duration-1000 ease-out ${
                       isVisible 
                         ? 'translate-y-0 opacity-100' 
                         : 'translate-y-20 opacity-0'
                     }`}
                     style={{
                       transitionDelay: `${800 + index * 300}ms`,
                       transform: isVisible 
                         ? 'perspective(1000px) rotateX(5deg) rotateY(-2deg)' 
                         : 'perspective(1000px) rotateX(15deg) rotateY(-10deg) translateY(20px)',
                       boxShadow: isVisible 
                         ? `
                           0 25px 50px rgba(0, 0, 0, 0.25),
                           0 12px 24px rgba(0, 0, 0, 0.15),
                           inset 0 1px 0 rgba(255, 255, 255, 0.1)
                         `
                         : `
                           0 50px 100px rgba(0, 0, 0, 0.4),
                           0 25px 50px rgba(0, 0, 0, 0.3),
                           inset 0 1px 0 rgba(255, 255, 255, 0.05)
                         `,
                       border: '1px solid rgba(255, 255, 255, 0.1)'
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
                     <CardContent className="p-6 relative z-10">
                       {/* Floating Icon with Depth */}
                       <div 
                         className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-4 transform-gpu shadow-lg"
                         style={{
                           transform: 'translateZ(20px)',
                           boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                         }}
                       >
                         <perk.icon className="h-8 w-8 text-white" />
                  </div>
                       
                       {/* Text with Layered Depth */}
                       <p 
                         className={`text-foreground font-medium transform-gpu transition-all duration-1000 ease-out ${
                           isVisible 
                             ? 'translate-x-0 opacity-100' 
                             : 'translate-x-12 opacity-0'
                         }`}
                         style={{ 
                           transform: 'translateZ(10px)',
                           transitionDelay: `${1000 + index * 300}ms`
                         }}
                       >
                         {perk.text}
                       </p>

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

        {/* Flow Chart with Illustrations */}
        <div className="mb-12">
          <h3 className="mb-8 text-center text-2xl font-semibold">How you earn through Woza Mali</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {flowSteps.map((step, index) => (
              <div key={index} className="relative">
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
                           className="border-primary/30 bg-card/50 h-full transform-gpu relative overflow-hidden transition-all duration-500 ease-out"
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
                         <CardContent className="p-6 text-center relative z-10">
                           {/* Floating Icon with Depth */}
                           <div 
                             className="mb-4 mx-auto inline-flex rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-4 transform-gpu shadow-lg"
                             style={{
                               transform: 'translateZ(20px)',
                               boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                             }}
                           >
                             <step.icon className="h-8 w-8 text-white" />
                           </div>
                           
                           {/* Text with Layered Depth */}
                           <div className="space-y-3">
                             <div 
                               className="text-sm font-bold text-primary transform-gpu"
                               style={{ transform: 'translateZ(15px)' }}
                             >
                               Step {index + 1}
                             </div>
                             <h4 
                               className="text-lg font-semibold text-foreground transform-gpu"
                               style={{ transform: 'translateZ(10px)' }}
                             >
                               {step.title}
                             </h4>
                             <p 
                               className="text-sm text-muted-foreground transform-gpu"
                               style={{ transform: 'translateZ(5px)' }}
                             >
                               {step.description}
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
                </div>
                {/* Connector Arrow */}
                {index < flowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="text-primary/50 text-2xl">→</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className={`text-center transition-all duration-1000 ease-out delay-1200 ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-8 opacity-0'
        }`}>
          <Button
            size="lg"
            asChild
            className="group relative bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 shadow-glow transition-all duration-300 text-lg px-12 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 overflow-hidden"
          >
            <a href="https://wozamali.co.za" target="_blank" rel="noopener noreferrer">
              <span className="relative z-10">Join Woza Mali Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-md blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            </a>
          </Button>
          <p className={`mt-4 text-sm text-muted-foreground transition-all duration-1000 ease-out delay-1400 ${
            isVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-4 opacity-0'
          }`}>
            Start earning rewards for your recyclables today
          </p>
        </div>
      </div>
    </section>
  );
};

export default WozaMali;
