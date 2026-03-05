import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import KECALogo from "./KECALogo";
import { TestResult } from "./HearingTest";
import { LeadData } from "./LeadCapture";
import { UserProfile } from "@/pages/Index";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Phone,
  Calendar,
  Download,
  Share2,
  User,
} from "lucide-react";

interface ResultsProps {
  results: TestResult[];
  leadData: LeadData;
  userProfile: UserProfile;
  onRestart: () => void;
}

type HearingLevel = "normal" | "mild" | "moderate" | "severe";

// Standard audiometric frequency labels
const frequencyLabels = ["500", "1K", "2K", "4K"];

const Results = ({ results, leadData, userProfile, onRestart }: ResultsProps) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - userProfile.birthYear;
  const gender = userProfile.gender;
  const analysis = useMemo(() => {
    const leftEarResults = results.filter((r) => r.ear === "left");
    const rightEarResults = results.filter((r) => r.ear === "right");

    // Calculate Pure Tone Average (PTA) - standard uses 500, 1000, 2000 Hz
    const calculatePTA = (earResults: TestResult[]) => {
      const ptaFrequencies = [500, 1000, 2000];
      const ptaResults = earResults.filter(r => ptaFrequencies.includes(r.frequency));
      
      if (ptaResults.length === 0) return null;
      
      const thresholds = ptaResults.map(r => r.threshold ?? (r.heard ? 20 : 60));
      return thresholds.reduce((a, b) => a + b, 0) / thresholds.length;
    };

    // Calculate score based on threshold detection
    const calculateScore = (earResults: TestResult[]) => {
      const total = earResults.length;
      if (total === 0) return 0;
      
      let score = 0;
      earResults.forEach(r => {
        if (r.threshold !== null) {
          // Convert threshold to score (lower threshold = better hearing)
          // 5dB = 100%, 40dB = 20%
          score += Math.max(0, 100 - ((r.threshold - 5) * 2.3));
        } else if (r.heard === true) {
          score += 80;
        } else if (r.heard === null) {
          score += 50;
        } else {
          score += 10;
        }
      });
      return score / total;
    };

    // Get threshold data for audiogram
    const getThresholdData = (earResults: TestResult[]) => {
      return earResults.map(r => ({
        frequency: r.frequency,
        threshold: r.threshold ?? (r.heard ? 20 : 60),
        heard: r.heard,
      }));
    };

    const leftScore = calculateScore(leftEarResults);
    const rightScore = calculateScore(rightEarResults);
    const overallScore = (leftScore + rightScore) / 2;

    const leftPTA = calculatePTA(leftEarResults);
    const rightPTA = calculatePTA(rightEarResults);

    const getLevel = (score: number): HearingLevel => {
      if (score >= 75) return "normal";
      if (score >= 55) return "mild";
      if (score >= 35) return "moderate";
      return "severe";
    };

    const getPTALevel = (pta: number | null): string => {
      if (pta === null) return "Unknown";
      if (pta <= 20) return "Normal";
      if (pta <= 40) return "Mild Loss";
      if (pta <= 55) return "Moderate Loss";
      if (pta <= 70) return "Moderate-Severe";
      return "Severe Loss";
    };

    return {
      leftScore,
      rightScore,
      overallScore,
      leftLevel: getLevel(leftScore),
      rightLevel: getLevel(rightScore),
      overallLevel: getLevel(overallScore),
      leftPTA,
      rightPTA,
      leftPTALevel: getPTALevel(leftPTA),
      rightPTALevel: getPTALevel(rightPTA),
      leftThresholds: getThresholdData(leftEarResults),
      rightThresholds: getThresholdData(rightEarResults),
    };
  }, [results]);

  // Age-related hearing insights
  const getAgeInsight = () => {
    if (age < 40) {
      return "At your age, hearing loss is less common but can occur due to noise exposure or other factors.";
    } else if (age < 55) {
      return "Some age-related hearing changes may begin around this stage of life.";
    } else if (age < 65) {
      return "Gradual hearing changes are common at this age. Regular monitoring is recommended.";
    } else {
      return "Age-related hearing loss (presbycusis) affects many adults in this age group.";
    }
  };

  // Gender-specific insights
  const getGenderInsight = () => {
    if (gender === "male") {
      return "Men are statistically more likely to experience hearing loss, often due to occupational noise exposure.";
    } else {
      return "Women may experience different patterns of hearing loss, sometimes affected by hormonal changes.";
    }
  };

  // Personalized recommendation based on age and hearing level
  const getPersonalizedRecommendation = (level: HearingLevel) => {
    const baseRecommendations = {
      normal: {
        young: "Your hearing is excellent! Protect it by limiting exposure to loud sounds and using ear protection in noisy environments.",
        middle: "Great hearing for your age! Continue with annual check-ups to monitor any changes.",
        senior: "Your hearing is well-preserved. Continue protecting your ears and schedule regular audiological assessments.",
      },
      mild: {
        young: "Some mild concerns detected. This is unusual at your age—we recommend a professional evaluation to identify any underlying causes.",
        middle: "Mild hearing changes are not uncommon at your age. A professional assessment can help determine if intervention would benefit you.",
        senior: "Some mild hearing changes detected, which is common at your age. Consider hearing aids or assistive devices to enhance your quality of life.",
      },
      moderate: {
        young: "Moderate hearing concerns at your age warrant prompt professional attention to prevent further decline.",
        middle: "Your results suggest moderate hearing difficulties. Early intervention with hearing aids could significantly improve your daily life.",
        senior: "Moderate hearing loss is manageable with the right support. KECA hearing aids are designed specifically for adults with similar profiles.",
      },
      severe: {
        young: "These results require immediate professional attention. Early intervention is crucial for maintaining communication abilities.",
        middle: "Significant hearing concerns detected. Please schedule a priority consultation—modern hearing solutions can make a tremendous difference.",
        senior: "Professional hearing care is strongly recommended. Many people with similar results experience significant improvement with hearing aids.",
      },
    };

    const ageCategory = age < 45 ? "young" : age < 60 ? "middle" : "senior";
    return baseRecommendations[level][ageCategory];
  };

  const levelConfig = {
    normal: {
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success-light",
      borderColor: "border-success",
      title: "Normal Hearing",
      description:
        "Great news! Your hearing appears to be within normal range across all tested frequencies.",
    },
    mild: {
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning-light",
      borderColor: "border-warning",
      title: "Mild Hearing Concern",
      description:
        "Your results show some difficulty with certain frequencies. This is common and often manageable.",
    },
    moderate: {
      icon: AlertCircle,
      color: "text-warning",
      bgColor: "bg-warning-light",
      borderColor: "border-warning",
      title: "Moderate Hearing Concern",
      description:
        "Your results indicate moderate hearing difficulties across multiple frequencies.",
    },
    severe: {
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive",
      title: "Significant Hearing Concern",
      description:
        "Your results suggest significant hearing difficulties. Early intervention can make a big difference.",
    },
  };

  const config = levelConfig[analysis.overallLevel];
  const Icon = config.icon;

  // Simple audiogram visualization
  const renderAudiogram = () => {
    const maxThreshold = 60;
    const minThreshold = 0;
    
    return (
      <div className="rounded-xl bg-card p-4 shadow-soft">
        <h3 className="mb-4 text-center text-subheading text-foreground">
          Hearing Threshold Chart
        </h3>
        
        {/* Chart */}
        <div className="relative h-48 border-l-2 border-b-2 border-border ml-8 mr-4">
          {/* Y-axis labels (dB) */}
          <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-body-sm text-muted-foreground">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
          </div>
          
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-full border-t border-dashed border-border/50" />
            ))}
          </div>
          
          {/* Data points */}
          <div className="absolute inset-0 flex items-end justify-around px-2">
            {frequencyLabels.map((label, idx) => {
              const leftResult = analysis.leftThresholds[idx];
              const rightResult = analysis.rightThresholds[idx];
              
              const leftHeight = leftResult 
                ? ((maxThreshold - leftResult.threshold) / maxThreshold) * 100 
                : 0;
              const rightHeight = rightResult 
                ? ((maxThreshold - rightResult.threshold) / maxThreshold) * 100 
                : 0;
              
              return (
                <div key={label} className="flex flex-col items-center gap-1 h-full relative">
                  {/* Left ear marker */}
                  {leftResult && (
                    <div 
                      className="absolute w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm"
                      style={{ bottom: `${leftHeight}%`, transform: 'translateX(-4px)' }}
                      title={`Left: ${leftResult.threshold}dB`}
                    />
                  )}
                  {/* Right ear marker */}
                  {rightResult && (
                    <div 
                      className="absolute w-3 h-3 bg-red-500 border-2 border-white shadow-sm"
                      style={{ 
                        bottom: `${rightHeight}%`, 
                        transform: 'translateX(4px)',
                        clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'
                      }}
                      title={`Right: ${rightResult.threshold}dB`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* X-axis labels */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-around text-body-sm text-muted-foreground">
            {frequencyLabels.map(label => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-8 flex justify-center gap-6 text-body-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Left Ear</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 bg-red-500"
              style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
            />
            <span className="text-muted-foreground">Right Ear</span>
          </div>
        </div>
        
        {/* Axis labels */}
        <div className="mt-4 text-center text-body-sm text-muted-foreground">
          <p>Frequency (Hz) → | Threshold (dB HL) ↑</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen keca-gradient-soft">
      {/* Header */}
      <header className="container flex items-center justify-center py-6">
        <KECALogo size="md" />
      </header>

      <main className="container pb-12">
        <div className="mx-auto max-w-md">
          {/* Result Icon */}
          <div className="mb-6 flex justify-center">
            <div className={`rounded-full ${config.bgColor} p-6 shadow-elevated`}>
              <Icon className={`h-16 w-16 ${config.color}`} />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center text-heading text-foreground">
            {config.title}
          </h1>

          {/* Description */}
          <p className="mb-6 text-center text-body text-muted-foreground">
            {config.description}
          </p>

          {/* Score Card */}
          <div className="mb-6 overflow-hidden rounded-2xl bg-card shadow-elevated">
            {/* Overall Score */}
            <div className={`border-b-4 ${config.borderColor} p-4`}>
              <div className="mb-1 text-center text-body-sm font-medium text-muted-foreground">
                Overall Hearing Score
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-display ${config.color}`}>
                  {Math.round(analysis.overallScore)}%
                </span>
              </div>
            </div>

            {/* Individual Ears with PTA */}
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="p-4 text-center">
                <div className="mb-1 text-body-sm text-muted-foreground">
                  Left Ear
                </div>
                <div className="text-heading text-foreground">
                  {Math.round(analysis.leftScore)}%
                </div>
                <div className="mt-1 text-body-sm text-primary">
                  PTA: {analysis.leftPTA ? `${Math.round(analysis.leftPTA)} dB` : 'N/A'}
                </div>
                <div className="text-body-sm text-muted-foreground">
                  {analysis.leftPTALevel}
                </div>
              </div>
              <div className="p-4 text-center">
                <div className="mb-1 text-body-sm text-muted-foreground">
                  Right Ear
                </div>
                <div className="text-heading text-foreground">
                  {Math.round(analysis.rightScore)}%
                </div>
                <div className="mt-1 text-body-sm text-primary">
                  PTA: {analysis.rightPTA ? `${Math.round(analysis.rightPTA)} dB` : 'N/A'}
                </div>
                <div className="text-body-sm text-muted-foreground">
                  {analysis.rightPTALevel}
                </div>
              </div>
            </div>
          </div>

          {/* Audiogram */}
          <div className="mb-6">
            {renderAudiogram()}
          </div>

          {/* Frequencies Tested */}
          <div className="mb-6 rounded-xl bg-card p-4 shadow-soft">
            <h3 className="mb-3 text-center text-subheading text-foreground">
              Frequencies Tested
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {["500 Hz", "1 kHz", "2 kHz", "4 kHz"].map((freq) => (
                <div key={freq} className="rounded-lg bg-secondary/50 p-2">
                  <div className="text-body-sm font-medium text-foreground">{freq}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-body-sm text-muted-foreground">
              4 key frequencies tested at multiple decibel levels
            </p>
          </div>

          {/* Personal Profile */}
          <div className="mb-6 rounded-xl bg-card p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-subheading text-foreground">Your Profile</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <div className="text-body-sm text-muted-foreground">Age</div>
                <div className="text-heading text-foreground">{age}</div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <div className="text-body-sm text-muted-foreground">Gender</div>
                <div className="text-heading text-foreground capitalize">{gender}</div>
              </div>
            </div>
            <div className="space-y-2 text-body-sm text-muted-foreground">
              <p>• {getAgeInsight()}</p>
              <p>• {getGenderInsight()}</p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="mb-6 rounded-2xl bg-primary-light p-4">
            <h2 className="mb-2 text-subheading text-foreground">
              KECA Recommendation for You
            </h2>
            <p className="text-body text-muted-foreground">
              {getPersonalizedRecommendation(analysis.overallLevel)}
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
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
          <div className="mt-6 text-center">
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
        <p className="mt-1 text-body-sm text-muted-foreground">
          This screening is not a diagnostic test. Please consult an audiologist for clinical evaluation.
        </p>
      </footer>
    </div>
  );
};

export default Results;
