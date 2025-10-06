import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, RotateCcw, Recycle, Leaf, Factory, Users, TrendingUp, Globe, Heart, ArrowRight, CheckCircle } from "lucide-react";

interface CircularEconomyPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CircularEconomyPopup = ({ isOpen, onClose }: CircularEconomyPopupProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Recycle,
      title: "What is Circular Economy?",
      description: "A circular economy is an economic system that eliminates waste and pollution by keeping products and materials in use for as long as possible.",
      details: [
        "Design products to last longer and be easily repairable",
        "Use renewable energy and materials",
        "Create closed-loop systems where waste becomes input",
        "Focus on sharing, leasing, and service-based business models"
      ],
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/10"
    },
    {
      icon: Factory,
      title: "How to Create Circular Systems",
      description: "Transform your business or community to operate in a circular way by following these key principles.",
      details: [
        "Redesign products for durability and recyclability",
        "Implement take-back programs for used products",
        "Use renewable and recyclable materials",
        "Create partnerships with recycling facilities"
      ],
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-500/10 to-cyan-600/10"
    },
    {
      icon: Users,
      title: "Community Action Steps",
      description: "Every individual and community can contribute to the circular economy through simple daily actions.",
      details: [
        "Separate waste at home (paper, plastic, glass, metal)",
        "Buy products made from recycled materials",
        "Repair and maintain items instead of replacing",
        "Support local recycling programs and businesses"
      ],
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-500/10 to-pink-600/10"
    },
    {
      icon: TrendingUp,
      title: "Economic Benefits",
      description: "Circular economy creates new opportunities and reduces costs for businesses and communities.",
      details: [
        "Reduces material costs by 20-30%",
        "Creates new jobs in recycling and repair sectors",
        "Reduces waste disposal costs for municipalities",
        "Increases resource security and independence"
      ],
      color: "from-orange-500 to-yellow-600",
      bgColor: "from-orange-500/10 to-yellow-600/10"
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
              <RotateCcw className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Circular Economy Guide</h2>
              <p className="text-muted-foreground">Learn how to create sustainable systems</p>
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
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentStepData.description}
            </p>
          </div>

          <div className="grid gap-4 mb-8">
            {currentStepData.details.map((detail, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground">{detail}</p>
              </div>
            ))}
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

export default CircularEconomyPopup;
