import Hero from "@/components/Hero";
import WhyRecycling from "@/components/WhyRecycling";
import WozaMali from "@/components/WozaMali";
import HowPublicCreatesJobs from "@/components/HowPublicCreatesJobs";
import GreenScholar from "@/components/GreenScholar";
import MakeSowetoGreen from "@/components/MakeSowetoGreen";
import ProblemsSolved from "@/components/ProblemsSolved";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <WhyRecycling />
      <WozaMali />
      <HowPublicCreatesJobs />
      <GreenScholar />
      <MakeSowetoGreen />
      <ProblemsSolved />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
