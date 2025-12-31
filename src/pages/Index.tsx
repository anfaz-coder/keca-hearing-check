import { useState, useCallback } from "react";
import LandingPage from "@/components/LandingPage";
import GenderSelection from "@/components/GenderSelection";
import YearOfBirth from "@/components/YearOfBirth";
import HeadphoneCheck from "@/components/HeadphoneCheck";
import VolumeCalibration from "@/components/VolumeCalibration";
import HearingTest, { TestResult } from "@/components/HearingTest";
import LeadCapture, { LeadData } from "@/components/LeadCapture";
import Results from "@/components/Results";

export interface UserProfile {
  gender: "female" | "male";
  birthYear: number;
}

type Screen =
  | "landing"
  | "gender-selection"
  | "year-of-birth"
  | "headphone-check"
  | "volume-calibration"
  | "hearing-test"
  | "lead-capture"
  | "results";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [leadData, setLeadData] = useState<LeadData | null>(null);

  const handleStartTest = useCallback(() => {
    setCurrentScreen("gender-selection");
  }, []);

  const handleGenderContinue = useCallback((gender: "female" | "male") => {
    setUserProfile(prev => ({ ...prev, gender, birthYear: prev?.birthYear || 0 }));
    setCurrentScreen("year-of-birth");
  }, []);

  const handleYearOfBirthContinue = useCallback((year: number) => {
    setUserProfile(prev => prev ? { ...prev, birthYear: year } : { gender: "male", birthYear: year });
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
    setUserProfile(null);
    setTestResults([]);
    setLeadData(null);
    setCurrentScreen("landing");
  }, []);

  const handleBack = useCallback(() => {
    switch (currentScreen) {
      case "gender-selection":
        setCurrentScreen("landing");
        break;
      case "year-of-birth":
        setCurrentScreen("gender-selection");
        break;
      case "headphone-check":
        setCurrentScreen("year-of-birth");
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
      {currentScreen === "gender-selection" && (
        <GenderSelection onContinue={handleGenderContinue} onBack={handleBack} />
      )}
      {currentScreen === "year-of-birth" && (
        <YearOfBirth onContinue={handleYearOfBirthContinue} onBack={handleBack} />
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
