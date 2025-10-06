"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Building2, Users, Truck, Wrench, Factory, TrendingUp, ArrowRight, CheckCircle, MapPin, Clock, DollarSign } from "lucide-react";

interface JobsChainPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const JobsChainPopup = ({ isOpen, onClose }: JobsChainPopupProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Users,
      title: "Collection Jobs",
      description: "The first step in the recycling chain creates employment opportunities in waste collection and sorting.",
      details: [
        "Waste collectors and sorters at source",
        "Community recycling coordinators",
        "Route planners and logistics coordinators",
        "Quality control and inspection staff"
      ],
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-500/10 to-cyan-600/10",
      stats: "Creates 3-5 jobs per 1000 households"
    },
    {
      icon: Truck,
      title: "Transport & Logistics",
      description: "Moving recyclables from collection points to processing facilities creates transportation jobs.",
      details: [
        "Truck drivers and logistics coordinators",
        "Route optimization specialists",
        "Fleet maintenance technicians",
        "Dispatch and scheduling coordinators"
      ],
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/10",
      stats: "Each route supports 2-3 direct jobs"
    },
    {
      icon: Wrench,
      title: "Processing & Sorting",
      description: "Recycling facilities create skilled jobs in material processing and quality control.",
      details: [
        "Machine operators and technicians",
        "Quality control and sorting specialists",
        "Maintenance and repair technicians",
        "Process optimization engineers"
      ],
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-500/10 to-pink-600/10",
      stats: "Processing facilities employ 15-50 people"
    },
    {
      icon: Factory,
      title: "Manufacturing & Remanufacturing",
      description: "Converting recycled materials into new products creates manufacturing employment.",
      details: [
        "Production line workers and supervisors",
        "Quality assurance specialists",
        "Product development engineers",
        "Supply chain coordinators"
      ],
      color: "from-orange-500 to-yellow-600",
      bgColor: "from-orange-500/10 to-yellow-600/10",
      stats: "Manufacturing creates 5-10x more jobs than disposal"
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
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Jobs Across the Chain</h2>
              <p className="text-muted-foreground">Discover employment opportunities in recycling</p>
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

          {/* Job Impact Summary */}
          <div className="bg-gradient-to-r from-primary/5 to-orange/5 rounded-2xl p-6 mb-8">
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Economic Impact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">3-5x</div>
                <div className="text-sm text-muted-foreground">More jobs than disposal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">R15-25</div>
                <div className="text-sm text-muted-foreground">Hourly wage range</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Jobs per city</div>
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

export default JobsChainPopup;
