"use client"

import { Home, Scale, Share2 } from "lucide-react";

const HowPublicCreatesJobs = () => {
  const steps = [
    {
      icon: Home,
      title: "Separate at source",
      why: "Clean streams raise material value and reduce sorting time",
      impact: "More paid work across collection, sorting, and remanufacturing",
    },
    {
      icon: Scale,
      title: "Bring, weigh, and redeem",
      why: "Direct incentives drive consistent participation",
      impact: "Predictable demand stabilizes reclaimer earnings",
    },
    {
      icon: Share2,
      title: "Share your impact",
      why: "Social proof grows participation",
      impact: "Higher recycling rates, cleaner streets, stronger local economies",
    },
  ];

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Three steps: How the public <span className="text-gradient">creates jobs</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Simple, dignified, transparent
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="mb-6 inline-flex rounded-full bg-primary/10 p-6">
                <step.icon className="h-12 w-12 text-primary" />
              </div>
              <div className="mb-2 text-sm font-semibold text-primary">Step {index + 1}</div>
              <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
              <div className="mb-4 space-y-2">
                <div>
                  <span className="text-sm font-medium text-foreground">Why: </span>
                  <span className="text-sm text-muted-foreground">{step.why}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-primary">Impact: </span>
                  <span className="text-sm text-foreground">{step.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-muted-foreground italic">
          Integration with local reclaimers strengthens incomes and formal recycling rates
        </div>
      </div>
    </section>
  );
};

export default HowPublicCreatesJobs;
