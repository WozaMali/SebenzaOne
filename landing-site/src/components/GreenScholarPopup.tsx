"use client"

import { X, GraduationCap, Lightbulb, TrendingUp, Users, BookOpen, Heart, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GreenScholarPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const GreenScholarPopup = ({ isOpen, onClose }: GreenScholarPopupProps) => {
  if (!isOpen) return null;

  const fundDetails = [
    {
      icon: GraduationCap,
      title: "Education Support",
      description: "Direct funding for school fees, uniforms, books, and educational materials for children in disadvantaged communities.",
      impact: "0 children supported annually"
    },
    {
      icon: Lightbulb,
      title: "STEM Programs",
      description: "Science, Technology, Engineering, and Mathematics clubs that inspire innovation and critical thinking.",
      impact: "0 active STEM clubs across Soweto"
    },
    {
      icon: Users,
      title: "Community Workshops",
      description: "Educational sessions on recycling, environmental science, and sustainable living practices.",
      impact: "0 community members trained"
    },
    {
      icon: Heart,
      title: "Nutrition Programs",
      description: "School feeding schemes and nutrition education to ensure children have the energy to learn.",
      impact: "Daily meals for 0 students"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Collect PET",
      description: "Community members donate clean PET bottles to collection points"
    },
    {
      step: "2", 
      title: "Process & Sell",
      description: "PET is sorted, cleaned, and sold to recycling partners"
    },
    {
      step: "3",
      title: "Fund Education",
      description: "Proceeds directly fund educational programs and student support"
    },
    {
      step: "4",
      title: "Track Impact",
      description: "Transparent reporting on how funds are used and their impact"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border bg-gradient-to-r from-primary/5 to-green-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-green-500 rounded-xl shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Green Scholar Fund</h2>
              <p className="text-muted-foreground text-lg">Transforming PET into educational opportunities</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 hover:bg-muted/50 rounded-full transition-smooth"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Introduction */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">How Your PET Donations Create Change</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Every PET bottle you donate becomes a building block for education. The Green Scholar Fund 
              transforms recyclables into scholarships, school supplies, and STEM programs that empower 
              the next generation of leaders.
            </p>
          </div>

          {/* Fund Details */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">What We Fund</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {fundDetails.map((detail, index) => (
                <div key={index} className="p-6 border border-border rounded-2xl bg-card/50 hover:bg-card transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-green-500/10 rounded-xl">
                      <detail.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-foreground mb-2">{detail.title}</h4>
                      <p className="text-muted-foreground mb-3">{detail.description}</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">{detail.impact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">How It Works</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step, index) => (
                <div key={index} className="text-center p-6 border border-border rounded-2xl bg-card/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Stats */}
          <div className="bg-gradient-to-r from-primary/5 to-green-500/5 rounded-2xl p-8 border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Our Impact</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">0</div>
                <p className="text-muted-foreground">Children Supported</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">0</div>
                <p className="text-muted-foreground">Active STEM Clubs</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">0</div>
                <p className="text-muted-foreground">Community Members Trained</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center pt-6">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-green-500 text-white hover:from-primary/90 hover:to-green-500/90 shadow-lg hover:shadow-xl transition-all duration-300 px-8"
              onClick={() => window.open('https://wozamali.co.za', '_blank')}
            >
              Start Donating Today
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Every PET bottle makes a difference in a child's education
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreenScholarPopup;
