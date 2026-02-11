import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import KECALogo from "./KECALogo";
import ProgressIndicator from "./ProgressIndicator";
import { Volume2, Play, Pause } from "lucide-react";

interface VolumeCalibrationProps {
  onContinue: () => void;
  onBack: () => void;
}

const VolumeCalibration = ({ onContinue, onBack }: VolumeCalibrationProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const playCalibrationTone = useCallback(() => {
    if (isPlaying) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillatorRef.current = oscillator;
    setIsPlaying(true);
    setHasPlayed(true);

    setTimeout(() => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
        setIsPlaying(false);
      }
    }, 3000);
  }, [isPlaying]);

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
          {/* Progress */}
          <div className="mb-6">
            <ProgressIndicator currentStep={1} totalSteps={5} />
          </div>

          {/* Icon - compact */}
          <div className="mb-5 flex justify-center">
            <div
              className={`rounded-full bg-primary/10 p-5 transition-all duration-300 ${
                isPlaying ? "ring-4 ring-primary/30 bg-primary/15" : ""
              }`}
            >
              <Volume2
                className={`h-10 w-10 text-primary transition-all ${
                  isPlaying ? "animate-pulse" : ""
                }`}
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center text-xl font-bold text-foreground">
            Adjust Your Volume
          </h1>

          {/* Description */}
          <p className="mb-6 text-center text-body text-muted-foreground">
            Play the tone and adjust your volume until it's comfortable but clearly audible.
          </p>

          {/* Play Button */}
          <div className="mb-2 flex justify-center">
            <button
              onClick={playCalibrationTone}
              className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 ${
                isPlaying
                  ? "bg-primary shadow-lg shadow-primary/30"
                  : "bg-card border-2 border-border hover:border-primary/50 active:scale-95"
              }`}
              aria-label={isPlaying ? "Pause calibration tone" : "Play calibration tone"}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-primary-foreground" />
              ) : (
                <Play className="h-8 w-8 text-primary ml-1" />
              )}
            </button>
          </div>

          <p className="mb-6 text-center text-body-sm text-muted-foreground">
            {isPlaying ? "Adjust your volume now..." : "Tap to play calibration tone"}
          </p>

          {/* Tips - compact */}
          <div className="rounded-2xl bg-card border border-border/50 p-4">
            <h2 className="mb-2 text-body font-semibold text-foreground">
              Perfect Volume Level
            </h2>
            <ul className="space-y-1.5 text-body-sm text-muted-foreground">
              <li>• Should be clearly audible</li>
              <li>• Not too loud or uncomfortable</li>
              <li>• You'll hear softer tones during the test</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50 px-4 py-4 pb-safe-bottom">
        <div className="mx-auto max-w-md flex flex-col gap-2">
          <Button
            variant="cta"
            size="lg"
            onClick={onContinue}
            className="w-full h-14 text-base font-semibold"
            disabled={!hasPlayed}
          >
            {hasPlayed ? "Volume Adjusted, Continue" : "Play Tone First"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onBack} className="w-full text-muted-foreground">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VolumeCalibration;
