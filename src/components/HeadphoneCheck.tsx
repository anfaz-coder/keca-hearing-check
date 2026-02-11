import { Button } from "@/components/ui/button";
import KECALogo from "./KECALogo";
import { Headphones, Volume2, AlertCircle } from "lucide-react";

interface HeadphoneCheckProps {
  onContinue: () => void;
  onBack: () => void;
}

const HeadphoneCheck = ({ onContinue, onBack }: HeadphoneCheckProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-border/50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <KECALogo size="sm" />
          <div className="w-10" />
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 flex flex-col overflow-y-auto px-4 pt-6 pb-28">
        <div className="mx-auto max-w-md w-full">
          {/* Icon - compact */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-5">
              <Headphones className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center text-xl font-bold text-foreground">
            Use Headphones for Best Results
          </h1>

          {/* Description */}
          <p className="mb-6 text-center text-body text-muted-foreground">
            For accurate results, please wear headphones in a quiet environment.
          </p>

          {/* Tips Card - compact */}
          <div className="mb-4 rounded-2xl bg-card border border-border/50 p-4">
            <h2 className="mb-3 flex items-center gap-2 text-body-lg font-semibold text-foreground">
              <Volume2 className="h-4 w-4 text-primary" />
              Quick Tips
            </h2>
            <ul className="space-y-2">
              {[
                "Use over-ear or in-ear headphones",
                "Find a quiet room without distractions",
                "Ensure headphones are properly connected",
                "Set your device volume to 50–70%",
              ].map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-body-sm text-muted-foreground"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Warning - compact */}
          <div className="flex items-start gap-2.5 rounded-xl bg-destructive/5 border border-destructive/20 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-body-sm text-foreground">
              Taking this test without headphones may affect result accuracy.
            </p>
          </div>
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50 px-4 py-4 pb-safe-bottom">
        <div className="mx-auto max-w-md flex flex-col gap-2">
          <Button variant="cta" size="lg" onClick={onContinue} className="w-full h-14 text-base font-semibold">
            I'm Using Headphones
          </Button>
          <Button variant="ghost" size="sm" onClick={onBack} className="w-full text-muted-foreground">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeadphoneCheck;
