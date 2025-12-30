import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import KECALogo from "./KECALogo";
import ProgressIndicator from "./ProgressIndicator";
import { Volume2, Check, X, HelpCircle } from "lucide-react";

interface HearingTestProps {
  onComplete: (results: TestResult[]) => void;
  onBack: () => void;
}

export interface TestResult {
  frequency: number;
  frequencyLabel: string;
  ear: "left" | "right";
  heard: boolean | null;
}

const frequencies = [
  { hz: 500, label: "Low", description: "Low frequency tone" },
  { hz: 1000, label: "Medium", description: "Medium frequency tone" },
  { hz: 2000, label: "High", description: "High frequency tone" },
];

const HearingTest = ({ onComplete, onBack }: HearingTestProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentEar, setCurrentEar] = useState<"left" | "right">("left");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const totalSteps = frequencies.length * 2; // Both ears
  const currentFrequency = frequencies[currentStep % frequencies.length];
  const progressStep = currentStep + (currentEar === "right" ? frequencies.length : 0) + 1;

  const playTone = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const panNode = audioContext.createStereoPanner();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(currentFrequency.hz, audioContext.currentTime);

    // Lower volume for the test tones
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);

    // Pan to left or right ear
    panNode.pan.setValueAtTime(currentEar === "left" ? -1 : 1, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(audioContext.destination);

    oscillator.start();
    oscillatorRef.current = oscillator;
    setIsPlaying(true);

    // Stop after 2 seconds and show buttons
    setTimeout(() => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
        setIsPlaying(false);
        setShowButtons(true);
      }
    }, 2000);
  }, [currentFrequency.hz, currentEar]);

  const handleResponse = (heard: boolean | null) => {
    const result: TestResult = {
      frequency: currentFrequency.hz,
      frequencyLabel: currentFrequency.label,
      ear: currentEar,
      heard,
    };

    const newResults = [...results, result];
    setResults(newResults);
    setShowButtons(false);

    // Check if we need to switch to the next frequency or ear
    if (currentStep < frequencies.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentEar === "left") {
      // Switch to right ear
      setCurrentEar("right");
      setCurrentStep(0);
    } else {
      // Test complete
      onComplete(newResults);
      return;
    }
  };

  useEffect(() => {
    // Auto-play the tone when the step changes
    if (!showButtons && !isPlaying) {
      const timer = setTimeout(() => {
        playTone();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, currentEar, showButtons, isPlaying, playTone]);

  return (
    <div className="min-h-screen keca-gradient-soft">
      {/* Header */}
      <header className="container flex items-center justify-center py-6">
        <KECALogo size="md" />
      </header>

      <main className="container pb-12">
        <div className="mx-auto max-w-md">
          {/* Progress */}
          <div className="mb-8">
            <ProgressIndicator currentStep={progressStep + 1} totalSteps={totalSteps + 2} />
          </div>

          {/* Ear Indicator */}
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-4 rounded-full bg-card px-6 py-3 shadow-soft">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-body-sm font-bold ${
                  currentEar === "left"
                    ? "keca-gradient text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                L
              </div>
              <span className="text-body font-medium text-foreground">
                {currentEar === "left" ? "Left Ear" : "Right Ear"}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-body-sm font-bold ${
                  currentEar === "right"
                    ? "keca-gradient text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                R
              </div>
            </div>
          </div>

          {/* Sound Animation */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              {isPlaying && (
                <>
                  <div className="absolute inset-0 animate-ripple rounded-full bg-primary/20" />
                  <div
                    className="absolute inset-0 animate-ripple rounded-full bg-primary/20"
                    style={{ animationDelay: "0.5s" }}
                  />
                </>
              )}
              <div
                className={`relative rounded-full bg-card p-8 shadow-elevated transition-all duration-300 ${
                  isPlaying ? "keca-glow" : ""
                }`}
              >
                <Volume2
                  className={`h-20 w-20 transition-colors duration-300 ${
                    isPlaying ? "text-primary animate-pulse-soft" : "text-muted-foreground"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Frequency Info */}
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-heading text-foreground">
              {currentFrequency.label} Frequency
            </h1>
            <p className="text-body text-muted-foreground">
              {isPlaying
                ? "Listen carefully..."
                : showButtons
                ? "Did you hear the tone?"
                : "Preparing next tone..."}
            </p>
          </div>

          {/* Response Buttons */}
          {showButtons && (
            <div className="animate-scale-in space-y-4">
              <Button
                variant="success"
                size="lg"
                onClick={() => handleResponse(true)}
                className="w-full"
              >
                <Check className="h-5 w-5" />
                Yes, I hear it
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={() => handleResponse(false)}
                className="w-full"
              >
                <X className="h-5 w-5" />
                No, I don't
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleResponse(null)}
                className="w-full"
              >
                <HelpCircle className="h-5 w-5" />
                Not sure
              </Button>
            </div>
          )}

          {/* Back Button */}
          {!isPlaying && !showButtons && (
            <div className="mt-8">
              <Button variant="ghost" onClick={onBack} className="w-full">
                Cancel Test
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HearingTest;
