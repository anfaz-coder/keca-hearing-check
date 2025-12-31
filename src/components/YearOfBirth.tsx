import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import KECALogo from "@/components/KECALogo";
import ProgressIndicator from "@/components/ProgressIndicator";

interface YearOfBirthProps {
  onContinue: (year: number) => void;
  onBack: () => void;
}

const YearOfBirth = ({ onContinue, onBack }: YearOfBirthProps) => {
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const minYear = 1920;

  const validateYear = (value: string): boolean => {
    const yearNum = parseInt(value, 10);
    if (isNaN(yearNum)) return false;
    if (yearNum < minYear || yearNum > currentYear) return false;
    return true;
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYear(value);
    
    if (value.length === 4) {
      if (!validateYear(value)) {
        setError("Please enter a valid year.");
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  };

  const handleContinue = () => {
    if (validateYear(year)) {
      onContinue(parseInt(year, 10));
    } else {
      setError("Please enter a valid year.");
    }
  };

  const isValid = year.length === 4 && validateYear(year);

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
            <ProgressIndicator currentStep={2} totalSteps={5} />
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h1 className="text-heading-md font-bold text-foreground mb-3">
              When were you born?
            </h1>
          </div>

          {/* Input */}
          <div className="mb-4">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 1986"
              value={year}
              onChange={handleYearChange}
              className={`text-center text-heading-sm font-semibold ${
                error ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              maxLength={4}
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-body-sm text-destructive text-center mb-4">
              {error}
            </p>
          )}

          {/* Helper Text */}
          <p className="text-body-sm text-muted-foreground text-center mb-8">
            Age plays an important role in hearing patterns. This helps us interpret your results more accurately.
          </p>

          {/* Spacer */}
          <div className="flex-1" />

          {/* CTA */}
          <Button
            variant="cta"
            size="xl"
            className="w-full"
            disabled={!isValid}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </main>
    </div>
  );
};

export default YearOfBirth;
