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
  threshold: number | null;
}

const frequencies = [
  { hz: 500, label: "500 Hz", category: "Low", description: "Low frequency tone" },
  { hz: 1000, label: "1000 Hz", category: "Mid", description: "Mid-range speech frequency" },
  { hz: 2000, label: "2000 Hz", category: "Mid-High", description: "Speech clarity frequency" },
  { hz: 4000, label: "4000 Hz", category: "High", description: "High frequency tone" },
];

const decibelLevels = [
  { db: 5, gain: 0.003, label: "5 dB" },
  { db: 10, gain: 0.006, label: "10 dB" },
  { db: 20, gain: 0.02, label: "20 dB" },
  { db: 30, gain: 0.06, label: "30 dB" },
  { db: 40, gain: 0.2, label: "40 dB" },
];

const STARTING_DB_INDEX = 2;
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
    decibelIndex: STARTING_DB_INDEX,
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
  const totalSteps = totalFrequencies * 2;
  const currentFrequency = frequencies[testState.frequencyIndex];
  const currentDecibel = decibelLevels[testState.decibelIndex];
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
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(currentDecibel.gain, audioContext.currentTime + 0.1);
    panNode.pan.setValueAtTime(testState.ear === "left" ? -1 : 1, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(audioContext.destination);

    oscillator.start();
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    setIsPlaying(true);

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
    return {
      frequency: currentFrequency.hz,
      frequencyLabel: currentFrequency.label,
      decibel: currentDecibel.db,
      ear: testState.ear,
      heard,
      threshold,
    } as TestResult;
  }, [currentFrequency, currentDecibel, testState.ear]);

  const moveToNextFrequency = useCallback((result: TestResult) => {
    const newResults = [...results, result];
    setResults(newResults);
    setTestPhase("initial");

    if (testState.frequencyIndex < frequencies.length - 1) {
      setTestState(prev => ({
        frequencyIndex: prev.frequencyIndex + 1,
        decibelIndex: STARTING_DB_INDEX,
        ear: prev.ear,
        thresholdFound: false,
        currentThreshold: null,
      }));
    } else if (testState.ear === "left") {
      setTestState({
        frequencyIndex: 0,
        decibelIndex: STARTING_DB_INDEX,
        ear: "right",
        thresholdFound: false,
        currentThreshold: null,
      });
    } else {
      onComplete(newResults);
    }
  }, [results, testState.frequencyIndex, testState.ear, onComplete]);

  const handleResponse = (heard: boolean | null) => {
    setShowButtons(false);

    if (heard === true) {
      if (testState.decibelIndex > 0) {
        setTestState(prev => ({
          ...prev,
          decibelIndex: prev.decibelIndex - 1,
          currentThreshold: currentDecibel.db,
        }));
        setTestPhase("descending");
      } else {
        const result = recordResult(true, decibelLevels[0].db);
        moveToNextFrequency(result);
      }
    } else {
      if (testPhase === "descending" && testState.currentThreshold !== null) {
        const result = recordResult(true, testState.currentThreshold);
        moveToNextFrequency(result);
      } else if (testState.decibelIndex < decibelLevels.length - 1) {
        setTestState(prev => ({
          ...prev,
          decibelIndex: prev.decibelIndex + 1,
        }));
        setTestPhase("ascending");
      } else {
        const result = recordResult(false, null);
        moveToNextFrequency(result);
      }
    }
  };

  useEffect(() => {
    if (!showButtons && !isPlaying) {
      const randomDelay = getRandomDelay();
      const timer = setTimeout(() => {
        playTone();
      }, randomDelay);
      return () => clearTimeout(timer);
    }
  }, [testState.frequencyIndex, testState.decibelIndex, testState.ear, showButtons, isPlaying, playTone]);

  return (
    <div className="min-h-screen keca-gradient-soft flex flex-col">
      {/* Compact Header */}
      <header className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={!isPlaying && !showButtons ? onBack : undefined}
          className={`p-2 -ml-2 transition-colors ${
            !isPlaying && !showButtons
              ? "text-muted-foreground hover:text-foreground"
              : "text-transparent pointer-events-none"
          }`}
          aria-label="Cancel test"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <KECALogo size="sm" />
        <div className="w-8" />
      </header>

      {/* Main Content - scrollable area */}
      <main className="flex-1 flex flex-col px-5 pb-4 overflow-y-auto">
        <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
          {/* Progress */}
          <div className="mb-4">
            <ProgressIndicator currentStep={progressStep + 1} totalSteps={totalSteps + 2} />
          </div>

          {/* Ear Indicator */}
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-3 rounded-full bg-card px-5 py-2.5 shadow-soft">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  testState.ear === "left"
                    ? "keca-gradient text-primary-foreground scale-110"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                L
              </div>
              <span className="text-sm font-semibold text-foreground">
                {testState.ear === "left" ? "Left Ear" : "Right Ear"}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  testState.ear === "right"
                    ? "keca-gradient text-primary-foreground scale-110"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                R
              </div>
            </div>
          </div>

          {/* Sound Animation - central focus */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
            <div className="relative mb-6">
              {isPlaying && (
                <>
                  <div className="absolute inset-0 animate-ripple rounded-full bg-primary/20" />
                  <div className="absolute inset-0 animate-ripple rounded-full bg-primary/20" style={{ animationDelay: "0.5s" }} />
                </>
              )}
              <div className={`relative rounded-full bg-card p-7 shadow-elevated transition-all duration-300 ${isPlaying ? "keca-glow" : ""}`}>
                <Volume2 className={`h-14 w-14 transition-colors duration-300 ${isPlaying ? "text-primary animate-pulse-soft" : "text-muted-foreground"}`} />
              </div>
            </div>

            {/* Frequency Info */}
            <div className="text-center">
              <h1 className="mb-1 text-xl font-bold text-foreground">
                {currentFrequency.label}
              </h1>
              <p className="mb-1 text-sm text-muted-foreground">
                {currentFrequency.description}
              </p>
              <p className="text-sm font-medium text-primary">
                {isPlaying
                  ? "Listen carefully..."
                  : showButtons
                  ? "Did you hear the tone?"
                  : "Preparing next tone..."}
              </p>
            </div>

            {/* Frequency Progress Dots */}
            <div className="mt-4 flex justify-center gap-2">
              {frequencies.map((freq, idx) => (
                <div
                  key={freq.hz}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    idx < testState.frequencyIndex
                      ? "bg-primary"
                      : idx === testState.frequencyIndex
                      ? "bg-primary scale-125 ring-2 ring-primary/30"
                      : "bg-muted"
                  }`}
                  title={freq.label}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Response Buttons */}
      {showButtons && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50 px-5 py-4 safe-bottom animate-slide-up">
          <div className="mx-auto max-w-md space-y-2.5">
            <Button
              variant="success"
              size="lg"
              onClick={() => handleResponse(true)}
              className="w-full h-14 text-base"
            >
              <Check className="h-5 w-5" />
              Yes, I heard it
            </Button>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="destructive"
                size="lg"
                onClick={() => handleResponse(false)}
                className="w-full h-12"
              >
                <X className="h-5 w-5" />
                No
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleResponse(null)}
                className="w-full h-12"
              >
                <HelpCircle className="h-5 w-5" />
                Not sure
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HearingTest;
