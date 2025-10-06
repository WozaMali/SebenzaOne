"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Coins, DollarSign, TrendingUp, Users, MapPin, Clock, ArrowRight, CheckCircle, Building, Heart, Shield } from "lucide-react";

interface CommunityDividendsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommunityDividendsPopup = ({ isOpen, onClose }: CommunityDividendsPopupProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Users,
      title: "Household Benefits",
      description: "When families separate waste at source, they create direct economic value for their communities.",
      details: [
        "Earn money by selling recyclables to reclaimers",
        "Reduce household waste disposal costs",
        "Create cleaner, healthier living environments",
        "Build community pride and environmental awareness"
      ],
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/10",
      stats: "R50-200 monthly income per household"
    },
    {
      icon: DollarSign,
      title: "Reclaimer Earnings",
      description: "Source separation dramatically increases earnings for waste reclaimers and informal recyclers.",
      details: [
        "Higher quality materials fetch better prices",
        "Reduced sorting time increases daily collections",
        "Cleaner materials reduce health risks",
        "More predictable income streams"
      ],
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-500/10 to-cyan-600/10",
      stats: "2-3x higher daily earnings"
    },
    {
      icon: Building,
      title: "Municipal Savings",
      description: "Cities save millions by reducing landfill costs and extending landfill lifespans.",
      details: [
        "Reduced waste transportation costs",
        "Extended landfill capacity and lifespan",
        "Lower waste management operational costs",
        "Reduced environmental cleanup expenses"
      ],
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-500/10 to-pink-600/10",
      stats: "R2-5 million annual savings per city"
    },
    {
      icon: TrendingUp,
      title: "Economic Multiplier Effect",
      description: "Recycling creates a ripple effect that benefits the entire local economy.",
      details: [
        "New businesses in recycling and processing",
        "Increased local purchasing power",
        "Job creation across the value chain",
        "Reduced import dependence on raw materials"
      ],
      color: "from-orange-500 to-yellow-600",
      bgColor: "from-orange-500/10 to-yellow-600/10",
      stats: "3-5x economic multiplier effect"
    }
  ];

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border border-border rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-orange/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Community Dividends</h2>
              <p className="text-muted-foreground">Discover the economic benefits of recycling</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  index <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 rounded ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <div className={`inline-flex rounded-2xl bg-gradient-to-br ${currentStepData.bgColor} p-4 mb-4`}>
              <currentStepData.icon className={`h-12 w-12 text-primary`} />
            </div>
            <h3 className="text-3xl font-bold mb-3">{currentStepData.title}</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              {currentStepData.description}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold">
              <TrendingUp className="h-4 w-4" />
              {currentStepData.stats}
            </div>
          </div>

          <div className="grid gap-4 mb-8">
            {currentStepData.details.map((detail, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground">{detail}</p>
              </div>
            ))}
          </div>

          {/* Economic Impact Summary */}
          <div className="bg-gradient-to-r from-primary/5 to-orange/5 rounded-2xl p-6 mb-8">
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Economic Impact Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">R50-200</div>
                <div className="text-sm text-muted-foreground">Monthly household income</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2-3x</div>
                <div className="text-sm text-muted-foreground">Higher reclaimer earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">R2-5M</div>
                <div className="text-sm text-muted-foreground">Annual municipal savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">3-5x</div>
                <div className="text-sm text-muted-foreground">Economic multiplier</div>
              </div>
            </div>
          </div>

          {/* Success Stories */}
          <div className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl p-6 mb-8">
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-600" />
              Real Community Impact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-green-700">Soweto Success Story</h5>
                  <p className="text-sm text-muted-foreground">Over 500 households now earn R150+ monthly through source separation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-green-700">Johannesburg Impact</h5>
                  <p className="text-sm text-muted-foreground">City saves R3.2M annually through reduced landfill costs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  onClose();
                }
              }}
              className="flex items-center gap-2"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Complete'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDividendsPopup;
