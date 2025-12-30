import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import KECALogo from "./KECALogo";
import { TestResult } from "./HearingTest";
import { LeadData } from "./LeadCapture";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Phone,
  Calendar,
  Download,
  Share2,
} from "lucide-react";

interface ResultsProps {
  results: TestResult[];
  leadData: LeadData;
  onRestart: () => void;
}

type HearingLevel = "normal" | "mild" | "moderate" | "severe";

const Results = ({ results, leadData, onRestart }: ResultsProps) => {
  const analysis = useMemo(() => {
    const leftEarResults = results.filter((r) => r.ear === "left");
    const rightEarResults = results.filter((r) => r.ear === "right");

    const calculateScore = (earResults: TestResult[]) => {
      const total = earResults.length;
      const heard = earResults.filter((r) => r.heard === true).length;
      const unsure = earResults.filter((r) => r.heard === null).length;
      return ((heard + unsure * 0.5) / total) * 100;
    };

    const leftScore = calculateScore(leftEarResults);
    const rightScore = calculateScore(rightEarResults);
    const overallScore = (leftScore + rightScore) / 2;

    const getLevel = (score: number): HearingLevel => {
      if (score >= 80) return "normal";
      if (score >= 60) return "mild";
      if (score >= 40) return "moderate";
      return "severe";
    };

    return {
      leftScore,
      rightScore,
      overallScore,
      leftLevel: getLevel(leftScore),
      rightLevel: getLevel(rightScore),
      overallLevel: getLevel(overallScore),
    };
  }, [results]);

  const levelConfig = {
    normal: {
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success-light",
      borderColor: "border-success",
      title: "Normal Hearing",
      description:
        "Great news! Your hearing appears to be within normal range. Keep protecting your ears from loud noises.",
      recommendation:
        "Continue your current habits and consider an annual hearing check-up.",
    },
    mild: {
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning-light",
      borderColor: "border-warning",
      title: "Mild Hearing Concern",
      description:
        "Your results show some mild hearing difficulties. This is common and often manageable.",
      recommendation:
        "We recommend a professional hearing evaluation to understand your hearing better.",
    },
    moderate: {
      icon: AlertCircle,
      color: "text-warning",
      bgColor: "bg-warning-light",
      borderColor: "border-warning",
      title: "Moderate Hearing Concern",
      description:
        "Your results indicate moderate hearing difficulties that may affect daily communication.",
      recommendation:
        "A comprehensive hearing assessment by a KECA specialist is recommended.",
    },
    severe: {
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive",
      title: "Significant Hearing Concern",
      description:
        "Your results suggest significant hearing difficulties. Early intervention can make a big difference.",
      recommendation:
        "Please schedule a priority consultation with a KECA hearing specialist.",
    },
  };

  const config = levelConfig[analysis.overallLevel];
  const Icon = config.icon;

  return (
    <div className="min-h-screen keca-gradient-soft">
      {/* Header */}
      <header className="container flex items-center justify-center py-6">
        <KECALogo size="md" />
      </header>

      <main className="container pb-12">
        <div className="mx-auto max-w-md">
          {/* Result Icon */}
          <div className="mb-8 flex justify-center">
            <div className={`rounded-full ${config.bgColor} p-8 shadow-elevated`}>
              <Icon className={`h-20 w-20 ${config.color}`} />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center text-heading text-foreground">
            {config.title}
          </h1>

          {/* Description */}
          <p className="mb-8 text-center text-body-lg text-muted-foreground">
            {config.description}
          </p>

          {/* Score Card */}
          <div className="mb-6 overflow-hidden rounded-2xl bg-card shadow-elevated">
            {/* Overall Score */}
            <div className={`border-b-4 ${config.borderColor} p-6`}>
              <div className="mb-2 text-center text-body-sm font-medium text-muted-foreground">
                Overall Hearing Score
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-display ${config.color}`}>
                  {Math.round(analysis.overallScore)}%
                </span>
              </div>
            </div>

            {/* Individual Ears */}
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="p-4 text-center">
                <div className="mb-1 text-body-sm text-muted-foreground">
                  Left Ear
                </div>
                <div className="text-heading text-foreground">
                  {Math.round(analysis.leftScore)}%
                </div>
              </div>
              <div className="p-4 text-center">
                <div className="mb-1 text-body-sm text-muted-foreground">
                  Right Ear
                </div>
                <div className="text-heading text-foreground">
                  {Math.round(analysis.rightScore)}%
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="mb-8 rounded-2xl bg-primary-light p-6">
            <h2 className="mb-2 text-subheading text-foreground">
              KECA Recommendation
            </h2>
            <p className="text-body text-muted-foreground">
              {config.recommendation}
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-4">
            <Button variant="cta" size="xl" className="w-full">
              <Calendar className="h-5 w-5" />
              Book Free Consultation
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              <Phone className="h-5 w-5" />
              Talk to a KECA Expert
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
              Share Results
            </Button>
          </div>

          {/* Retake Test */}
          <div className="mt-8 text-center">
            <button
              onClick={onRestart}
              className="text-body-sm text-primary underline-offset-4 hover:underline"
            >
              Take the test again
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container pb-8 text-center">
        <p className="text-body-sm text-muted-foreground">
          Results sent to {leadData.email}
        </p>
      </footer>
    </div>
  );
};

export default Results;
