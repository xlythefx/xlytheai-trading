import { PublicNav } from "@/components/PublicNav";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      
      <div className="pt-24 pb-16">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            How Inner Circle Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            This page is coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
