import { useState, useRef, useEffect } from "react";
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
  const hasNavigated = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();
  const minYear = 1900;

  // Auto-focus input on mount for mobile keyboard
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const validateYear = (value: string): boolean => {
    const yearNum = parseInt(value, 10);
    if (isNaN(yearNum)) return false;
    if (yearNum < minYear || yearNum > currentYear) return false;
    return true;
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasNavigated.current) return;
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYear(value);

    if (value.length === 4) {
      if (!validateYear(value)) {
        setError("Please enter a valid year between 1900 and " + currentYear + ".");
      } else {
        setError("");
        hasNavigated.current = true;
        setTimeout(() => {
          onContinue(parseInt(value, 10));
        }, 400);
      }
    } else {
      setError("");
    }
  };

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
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 1986"
              value={year}
              onChange={handleYearChange}
              className={`text-center text-heading-sm font-semibold ${
                error ? "border-destructive focus-visible:ring-destructive" : ""
              } ${hasNavigated.current ? "border-primary bg-primary/5" : ""}`}
              maxLength={4}
              autoComplete="off"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-2 mb-4" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
              </svg>
              <p className="text-body-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Helper Text */}
          <p className="text-body-sm text-muted-foreground text-center">
            Age plays an important role in hearing patterns. This helps us interpret your results more accurately.
          </p>
        </div>
      </main>
    </div>
  );
};

export default YearOfBirth;
