import { Button } from "@/components/ui/button";
import KECALogo from "./KECALogo";
import TrustBadges from "./TrustBadges";
import { Ear, Clock, HeartHandshake } from "lucide-react";

interface LandingPageProps {
  onStartTest: () => void;
}

const LandingPage = ({ onStartTest }: LandingPageProps) => {
  return (
    <div className="min-h-screen keca-gradient-soft">
      {/* Header */}
      <header className="container flex items-center justify-center py-6">
        <KECALogo size="md" />
      </header>

      {/* Hero Section */}
      <main className="container pb-12">
        <div className="mx-auto max-w-lg text-center">
          {/* Hero Icon */}
          <div className="animate-float mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ripple rounded-full bg-primary/20" />
              <div className="relative rounded-full bg-card p-6 shadow-elevated">
                <Ear className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up mb-4 text-display-sm text-foreground sm:text-display">
            Check Your Hearing in{" "}
            <span className="text-gradient">3 Minutes</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-slide-up mb-8 text-body-lg text-muted-foreground" style={{ animationDelay: "0.1s" }}>
            A simple online hearing test inspired by audiologists. Free by KECA.
          </p>

          {/* CTA Button */}
          <div className="animate-slide-up mb-10" style={{ animationDelay: "0.2s" }}>
            <Button
              variant="cta"
              size="xl"
              onClick={onStartTest}
              className="w-full sm:w-auto"
            >
              Start Free Hearing Test
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <TrustBadges />
          </div>
        </div>

        {/* Features Section */}
        <div className="mx-auto mt-16 max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Clock,
                title: "Quick & Easy",
                description: "Just 3 minutes to complete",
              },
              {
                icon: HeartHandshake,
                title: "Expert-Backed",
                description: "Designed with audiologists",
              },
              {
                icon: Ear,
                title: "4 Key Frequencies",
                description: "Tests essential hearing range",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="animate-slide-up rounded-2xl bg-card p-6 text-center shadow-soft"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 text-subheading text-foreground">
                  {feature.title}
                </h3>
                <p className="text-body-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container pb-8 text-center">
        <p className="text-body-sm text-muted-foreground">
          Your Hearing, KECA Cares
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
