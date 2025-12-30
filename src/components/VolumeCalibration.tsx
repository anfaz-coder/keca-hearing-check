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
  const gainNodeRef = useRef<GainNode | null>(null);

  const playCalibrationTone = useCallback(() => {
    if (isPlaying) {
      // Stop the tone
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    // Create or resume audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;

    // Create oscillator for 1000Hz tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    setIsPlaying(true);
    setHasPlayed(true);

    // Auto-stop after 3 seconds
    setTimeout(() => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
        setIsPlaying(false);
      }
    }, 3000);
  }, [isPlaying]);

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
            <ProgressIndicator currentStep={1} totalSteps={5} />
          </div>

          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div
              className={`rounded-full bg-card p-8 shadow-elevated transition-all duration-300 ${
                isPlaying ? "keca-glow" : ""
              }`}
            >
              <Volume2
                className={`h-20 w-20 transition-colors duration-300 ${
                  isPlaying ? "text-primary animate-pulse-soft" : "text-primary"
                }`}
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-center text-heading text-foreground">
            Adjust Your Volume
          </h1>

          {/* Description */}
          <p className="mb-8 text-center text-body-lg text-muted-foreground">
            Play the calibration tone and adjust your device volume until it's comfortable but clearly audible.
          </p>

          {/* Play Button */}
          <div className="mb-8 flex justify-center">
            <button
              onClick={playCalibrationTone}
              className={`flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 ${
                isPlaying
                  ? "keca-gradient shadow-keca-lg"
                  : "bg-card shadow-elevated hover:shadow-keca-lg"
              }`}
            >
              {isPlaying ? (
                <Pause className="h-10 w-10 text-primary-foreground" />
              ) : (
                <Play className="h-10 w-10 text-primary ml-1" />
              )}
            </button>
          </div>

          <p className="mb-8 text-center text-body-sm text-muted-foreground">
            {isPlaying
              ? "Adjust your volume to a comfortable level..."
              : "Tap to play calibration tone"}
          </p>

          {/* Volume Tips */}
          <div className="mb-8 rounded-2xl bg-card p-6 shadow-soft">
            <h2 className="mb-3 text-subheading text-foreground">
              Perfect Volume Level
            </h2>
            <ul className="space-y-2 text-body text-muted-foreground">
              <li>• Should be clearly audible</li>
              <li>• Not too loud or uncomfortable</li>
              <li>• You'll hear softer tones during the test</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              variant="cta"
              size="lg"
              onClick={onContinue}
              className="w-full"
              disabled={!hasPlayed}
            >
              {hasPlayed ? "Volume is Set, Continue" : "Play Tone First"}
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

export default VolumeCalibration;
