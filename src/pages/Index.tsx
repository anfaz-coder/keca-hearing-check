import { useState, useCallback } from "react";
import LandingPage from "@/components/LandingPage";
import HeadphoneCheck from "@/components/HeadphoneCheck";
import VolumeCalibration from "@/components/VolumeCalibration";
import HearingTest, { TestResult } from "@/components/HearingTest";
import LeadCapture, { LeadData } from "@/components/LeadCapture";
import Results from "@/components/Results";

type Screen =
  | "landing"
  | "headphone-check"
  | "volume-calibration"
  | "hearing-test"
  | "lead-capture"
  | "results";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [leadData, setLeadData] = useState<LeadData | null>(null);

  const handleStartTest = useCallback(() => {
    setCurrentScreen("headphone-check");
  }, []);

  const handleHeadphoneCheckContinue = useCallback(() => {
    setCurrentScreen("volume-calibration");
  }, []);

  const handleVolumeCalibrationContinue = useCallback(() => {
    setCurrentScreen("hearing-test");
  }, []);

  const handleTestComplete = useCallback((results: TestResult[]) => {
    setTestResults(results);
    setCurrentScreen("lead-capture");
  }, []);

  const handleLeadSubmit = useCallback((data: LeadData) => {
    setLeadData(data);
    setCurrentScreen("results");
  }, []);

  const handleRestart = useCallback(() => {
    setTestResults([]);
    setLeadData(null);
    setCurrentScreen("landing");
  }, []);

  const handleBack = useCallback(() => {
    switch (currentScreen) {
      case "headphone-check":
        setCurrentScreen("landing");
        break;
      case "volume-calibration":
        setCurrentScreen("headphone-check");
        break;
      case "hearing-test":
        setCurrentScreen("volume-calibration");
        break;
      default:
        break;
    }
  }, [currentScreen]);

  return (
    <>
      {currentScreen === "landing" && (
        <LandingPage onStartTest={handleStartTest} />
      )}
      {currentScreen === "headphone-check" && (
        <HeadphoneCheck onContinue={handleHeadphoneCheckContinue} onBack={handleBack} />
      )}
      {currentScreen === "volume-calibration" && (
        <VolumeCalibration onContinue={handleVolumeCalibrationContinue} onBack={handleBack} />
      )}
      {currentScreen === "hearing-test" && (
        <HearingTest onComplete={handleTestComplete} onBack={handleBack} />
      )}
      {currentScreen === "lead-capture" && (
        <LeadCapture onSubmit={handleLeadSubmit} />
      )}
      {currentScreen === "results" && leadData && (
        <Results results={testResults} leadData={leadData} onRestart={handleRestart} />
      )}
    </>
  );
};

export default Index;
