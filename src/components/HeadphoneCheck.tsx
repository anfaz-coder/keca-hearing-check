import { Button } from "@/components/ui/button";
import KECALogo from "./KECALogo";
import { Headphones, Volume2, AlertCircle } from "lucide-react";

interface HeadphoneCheckProps {
  onContinue: () => void;
  onBack: () => void;
}

const HeadphoneCheck = ({ onContinue, onBack }: HeadphoneCheckProps) => {
  return (
    <div className="min-h-screen keca-gradient-soft">
      {/* Header */}
      <header className="container flex items-center justify-center py-6">
        <KECALogo size="md" />
      </header>

      <main className="container pb-12">
        <div className="mx-auto max-w-md">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="animate-pulse-soft rounded-full bg-card p-8 shadow-elevated">
              <Headphones className="h-20 w-20 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-center text-heading text-foreground">
            Use Headphones for Best Results
          </h1>

          {/* Description */}
          <p className="mb-8 text-center text-body-lg text-muted-foreground">
            For accurate hearing test results, please wear headphones in a quiet environment.
          </p>

          {/* Tips Card */}
          <div className="mb-8 rounded-2xl bg-card p-6 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-subheading text-foreground">
              <Volume2 className="h-5 w-5 text-primary" />
              Quick Tips
            </h2>
            <ul className="space-y-3">
              {[
                "Use over-ear or in-ear headphones",
                "Find a quiet room without distractions",
                "Ensure headphones are properly connected",
                "Set your device volume to 50-70%",
              ].map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-body text-muted-foreground"
                >
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-light text-body-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Warning */}
          <div className="mb-8 flex items-start gap-3 rounded-xl bg-warning-light p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <p className="text-body-sm text-foreground">
              Taking this test without headphones may affect the accuracy of your results.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button variant="cta" size="lg" onClick={onContinue} className="w-full">
              I Have My Headphones Ready
            </Button>
            <Button variant="ghost" onClick={onBack} className="w-full">
              Go Back
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeadphoneCheck;
