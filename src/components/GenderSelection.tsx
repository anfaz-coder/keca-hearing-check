import { useState } from "react";
import { Button } from "@/components/ui/button";
import KECALogo from "@/components/KECALogo";
import ProgressIndicator from "@/components/ProgressIndicator";

interface GenderSelectionProps {
  onContinue: (gender: "female" | "male") => void;
  onBack: () => void;
}

const GenderSelection = ({ onContinue, onBack }: GenderSelectionProps) => {
  const [selectedGender, setSelectedGender] = useState<"female" | "male" | null>(null);

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

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          {/* Progress */}
          <div className="mb-8">
            <ProgressIndicator currentStep={1} totalSteps={5} />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-heading-md font-bold text-foreground mb-3">
              Welcome to the KECA Online Hearing Test
            </h1>
            <p className="text-body-md text-muted-foreground">
              To give you the most accurate result, we need a few basic details first.
            </p>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h2 className="text-body-lg font-semibold text-foreground text-center mb-6">
              Please choose your gender
            </h2>
          </div>

          {/* Gender Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setSelectedGender("female")}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                selectedGender === "female"
                  ? "border-primary bg-primary/5 shadow-keca"
                  : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
              }`}
              aria-pressed={selectedGender === "female"}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                selectedGender === "female" ? "bg-primary/10" : "bg-secondary"
              }`}>
                ♀
              </div>
              <span className={`text-body-lg font-semibold ${
                selectedGender === "female" ? "text-primary" : "text-foreground"
              }`}>
                Female
              </span>
            </button>

            <button
              onClick={() => setSelectedGender("male")}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                selectedGender === "male"
                  ? "border-primary bg-primary/5 shadow-keca"
                  : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
              }`}
              aria-pressed={selectedGender === "male"}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                selectedGender === "male" ? "bg-primary/10" : "bg-secondary"
              }`}>
                ♂
              </div>
              <span className={`text-body-lg font-semibold ${
                selectedGender === "male" ? "text-primary" : "text-foreground"
              }`}>
                Male
              </span>
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-body-sm text-muted-foreground text-center mb-8">
            This information helps fine-tune the hearing test calibration.
          </p>

          {/* Spacer */}
          <div className="flex-1" />

          {/* CTA */}
          <Button
            variant="cta"
            size="xl"
            className="w-full"
            disabled={!selectedGender}
            onClick={() => selectedGender && onContinue(selectedGender)}
          >
            Continue
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GenderSelection;
