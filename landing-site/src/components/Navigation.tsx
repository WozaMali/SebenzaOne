"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import ContactForm from "./ContactForm";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

const Navigation = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Safe theme access with fallback
  let theme = 'light';
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
  } catch (error) {
    // Fallback to light theme if context is not available
    theme = 'light';
  }
  
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src={theme === 'light' ? "/SNW LOGO 1.png" : "/SNWG LOGO.png"}
              alt="Sebenza Nathi Waste Group Logo"
              width={64}
              height={64}
              className="h-16 w-auto"
            />
          </div>

                 {/* Navigation Links */}
                 <div className="hidden md:flex items-center gap-4">
                   <button
                     onClick={() => scrollToSection("woza-mali")}
                     className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
                   >
                     Woza Mali
                   </button>
                   <button
                     onClick={() => scrollToSection("green-scholar")}
                     className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
                   >
                     Green Scholar
                   </button>
                   <button
                     onClick={() => scrollToSection("make-soweto-green")}
                     className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
                   >
                     Make Soweto Green
                   </button>
                   <Button
                     size="sm"
                     onClick={() => setIsContactOpen(true)}
                     className="bg-[hsl(var(--orange))] text-[hsl(var(--orange-foreground))] hover:bg-[hsl(var(--orange))]/90 transition-smooth"
                   >
                     Contact
                   </Button>
                 </div>

                 {/* Mobile Menu Button */}
                 <div className="md:hidden">
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                     className="h-10 w-10 p-0"
                   >
                     {isMobileMenuOpen ? (
                       <X className="h-5 w-5" />
                     ) : (
                       <Menu className="h-5 w-5" />
                     )}
                   </Button>
                 </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-4">
              <button
                onClick={() => scrollToSection("woza-mali")}
                className="block w-full text-left text-sm font-medium text-foreground hover:text-primary transition-smooth py-2"
              >
                Woza Mali
              </button>
              <button
                onClick={() => scrollToSection("green-scholar")}
                className="block w-full text-left text-sm font-medium text-foreground hover:text-primary transition-smooth py-2"
              >
                Green Scholar
              </button>
              <button
                onClick={() => scrollToSection("make-soweto-green")}
                className="block w-full text-left text-sm font-medium text-foreground hover:text-primary transition-smooth py-2"
              >
                Make Soweto Green
              </button>
              <Button
                size="sm"
                onClick={() => {
                  setIsContactOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[hsl(var(--orange))] text-[hsl(var(--orange-foreground))] hover:bg-[hsl(var(--orange))]/90 transition-smooth"
              >
                Contact
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />
    </nav>
  );
};

export default Navigation;
