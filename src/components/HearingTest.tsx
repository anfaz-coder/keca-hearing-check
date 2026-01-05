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
  decibel: number;
  ear: "left" | "right";
  heard: boolean | null;
  threshold: number | null; // The lowest dB at which the tone was heard
}

// Audiometric frequencies for hearing test
// 4 key frequencies used for Pure Tone Average (PTA) calculation
const frequencies = [
  { hz: 500, label: "500 Hz", category: "Low", description: "Low frequency tone" },
  { hz: 1000, label: "1000 Hz", category: "Mid", description: "Mid-range speech frequency" },
  { hz: 2000, label: "2000 Hz", category: "Mid-High", description: "Speech clarity frequency" },
  { hz: 4000, label: "4000 Hz", category: "High", description: "High frequency tone" },
];

// 5 Decibel levels for threshold testing (5-40 dB HL)
// Ordered from softest to loudest for Hughson-Westlake procedure
const decibelLevels = [
  { db: 5, gain: 0.003, label: "5 dB" },
  { db: 10, gain: 0.006, label: "10 dB" },
  { db: 20, gain: 0.02, label: "20 dB" },
  { db: 30, gain: 0.06, label: "30 dB" },
  { db: 40, gain: 0.2, label: "40 dB" },
];

// Starting index for Hughson-Westlake: 20 dB (index 2)
const STARTING_DB_INDEX = 2;

// Randomize delay between 800-1600ms to prevent guessing
const getRandomDelay = () => Math.floor(Math.random() * 800) + 800;

interface TestState {
  frequencyIndex: number;
  decibelIndex: number;
  ear: "left" | "right";
  thresholdFound: boolean;
  currentThreshold: number | null;
}

const HearingTest = ({ onComplete, onBack }: HearingTestProps) => {
  const [testState, setTestState] = useState<TestState>({
    frequencyIndex: 0,
    decibelIndex: STARTING_DB_INDEX, // Start at 20 dB per Hughson-Westlake
    ear: "left",
    thresholdFound: false,
    currentThreshold: null,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testPhase, setTestPhase] = useState<"initial" | "descending" | "ascending">("initial");
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const totalFrequencies = frequencies.length;
  const totalSteps = totalFrequencies * 2; // Both ears
  const currentFrequency = frequencies[testState.frequencyIndex];
  const currentDecibel = decibelLevels[testState.decibelIndex];
  
  // Calculate progress based on completed frequencies (not individual dB tests)
  const completedTests = testState.frequencyIndex + (testState.ear === "right" ? totalFrequencies : 0);
  const progressStep = completedTests + 1;

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

    // Set gain based on current decibel level
    gainNode.gain.setValueAtTime(currentDecibel.gain, audioContext.currentTime);

    // Smooth fade in/out to prevent clicks
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(currentDecibel.gain, audioContext.currentTime + 0.1);

    // Pan to left or right ear
    panNode.pan.setValueAtTime(testState.ear === "left" ? -1 : 1, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(audioContext.destination);

    oscillator.start();
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    setIsPlaying(true);

    // Stop after 2 seconds with fade out
    setTimeout(() => {
      if (gainNodeRef.current && oscillatorRef.current) {
        const ctx = audioContextRef.current;
        if (ctx) {
          gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
          setTimeout(() => {
            if (oscillatorRef.current) {
              oscillatorRef.current.stop();
              oscillatorRef.current = null;
            }
            setIsPlaying(false);
            setShowButtons(true);
          }, 150);
        }
      }
    }, 1500);
  }, [currentFrequency.hz, currentDecibel.gain, testState.ear]);

  const recordResult = useCallback((heard: boolean | null, threshold: number | null) => {
    const result: TestResult = {
      frequency: currentFrequency.hz,
      frequencyLabel: currentFrequency.label,
      decibel: currentDecibel.db,
      ear: testState.ear,
      heard,
      threshold,
    };
    return result;
  }, [currentFrequency, currentDecibel, testState.ear]);

  const handleResponse = (heard: boolean | null) => {
    setShowButtons(false);

    // Modified Hughson-Westlake ascending technique:
    // - Start at 20 dB
    // - If heard: decrease intensity (go to softer level)
    // - If not heard or not sure: increase intensity (go to louder level)
    
    if (heard === true) {
      // User heard the tone - DECREASE intensity (try softer level)
      if (testState.decibelIndex > 0) {
        // Go to softer dB level (lower index = softer)
        setTestState(prev => ({
          ...prev,
          decibelIndex: prev.decibelIndex - 1,
          currentThreshold: currentDecibel.db,
        }));
        setTestPhase("descending");
      } else {
        // Already at softest level (5 dB) and heard - excellent hearing
        const result = recordResult(true, decibelLevels[0].db);
        moveToNextFrequency(result);
      }
    } else {
      // User didn't hear or not sure - INCREASE intensity (try louder level)
      if (testPhase === "descending" && testState.currentThreshold !== null) {
        // We were descending and now they can't hear - threshold is the last heard level
        const result = recordResult(true, testState.currentThreshold);
        moveToNextFrequency(result);
      } else if (testState.decibelIndex < decibelLevels.length - 1) {
        // Go to louder dB level (higher index = louder)
        setTestState(prev => ({
          ...prev,
          decibelIndex: prev.decibelIndex + 1,
        }));
        setTestPhase("ascending");
      } else {
        // At loudest level (40 dB) and still can't hear
        const result = recordResult(false, null);
        moveToNextFrequency(result);
      }
    }
  };

  const moveToNextFrequency = (result: TestResult) => {
    const newResults = [...results, result];
    setResults(newResults);

    // Reset for next frequency - start at 20 dB per Hughson-Westlake
    setTestPhase("initial");

    if (testState.frequencyIndex < frequencies.length - 1) {
      // Next frequency, same ear
      setTestState(prev => ({
        frequencyIndex: prev.frequencyIndex + 1,
        decibelIndex: STARTING_DB_INDEX,
        ear: prev.ear,
        thresholdFound: false,
        currentThreshold: null,
      }));
    } else if (testState.ear === "left") {
      // Switch to right ear
      setTestState({
        frequencyIndex: 0,
        decibelIndex: STARTING_DB_INDEX,
        ear: "right",
        thresholdFound: false,
        currentThreshold: null,
      });
    } else {
      // Test complete
      onComplete(newResults);
    }
  };

  useEffect(() => {
    // Auto-play the tone when ready with randomized delay to prevent guessing
    if (!showButtons && !isPlaying) {
      const randomDelay = getRandomDelay();
      const timer = setTimeout(() => {
        playTone();
      }, randomDelay);
      return () => clearTimeout(timer);
    }
  }, [testState.frequencyIndex, testState.decibelIndex, testState.ear, showButtons, isPlaying, playTone]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Low":
        return "bg-blue-500";
      case "Mid":
        return "bg-green-500";
      case "Mid-High":
        return "bg-yellow-500";
      case "High":
        return "bg-orange-500";
      case "Ultra-High":
        return "bg-red-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="min-h-screen keca-gradient-soft">
      {/* Header */}
      <header className="container flex items-center justify-center py-6">
        <KECALogo size="md" />
      </header>

      <main className="container pb-12">
        <div className="mx-auto max-w-md">
          {/* Progress */}
          <div className="mb-6">
            <ProgressIndicator currentStep={progressStep + 1} totalSteps={totalSteps + 2} />
            <div className="mt-2 text-center text-body-sm text-muted-foreground">
              Testing {totalFrequencies} frequencies per ear
            </div>
          </div>

          {/* Ear Indicator */}
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-4 rounded-full bg-card px-6 py-3 shadow-soft">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-body-sm font-bold ${
                  testState.ear === "left"
                    ? "keca-gradient text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                L
              </div>
              <span className="text-body font-medium text-foreground">
                {testState.ear === "left" ? "Left Ear" : "Right Ear"}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-body-sm font-bold ${
                  testState.ear === "right"
                    ? "keca-gradient text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                R
              </div>
            </div>
          </div>

          {/* Frequency & Decibel Info */}
          <div className="mb-4 flex justify-center gap-2">
            <span className={`rounded-full px-3 py-1 text-body-sm font-medium text-white ${getCategoryColor(currentFrequency.category)}`}>
              {currentFrequency.category}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-body-sm font-medium text-muted-foreground">
              {currentDecibel.label}
            </span>
          </div>

          {/* Sound Animation */}
          <div className="mb-6 flex justify-center">
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
                  className={`h-16 w-16 transition-colors duration-300 ${
                    isPlaying ? "text-primary animate-pulse-soft" : "text-muted-foreground"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Frequency Info */}
          <div className="mb-6 text-center">
            <h1 className="mb-1 text-heading text-foreground">
              {currentFrequency.label}
            </h1>
            <p className="mb-2 text-body text-muted-foreground">
              {currentFrequency.description}
            </p>
            <p className="text-body-sm text-primary font-medium">
              {isPlaying
                ? "Listen carefully..."
                : showButtons
                ? "Did you hear the tone?"
                : "Preparing next tone..."}
            </p>
          </div>

          {/* Response Buttons */}
          {showButtons && (
            <div className="animate-scale-in space-y-3">
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

          {/* Frequency Progress Dots */}
          <div className="mt-8 flex justify-center gap-1.5">
            {frequencies.map((freq, idx) => (
              <div
                key={freq.hz}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx < testState.frequencyIndex
                    ? "bg-primary"
                    : idx === testState.frequencyIndex
                    ? "bg-primary scale-125"
                    : "bg-muted"
                }`}
                title={freq.label}
              />
            ))}
          </div>

          {/* Back Button */}
          {!isPlaying && !showButtons && (
            <div className="mt-6">
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
