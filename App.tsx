import React, { useState, useCallback } from 'react';
import InputForm from './components/InputForm';
import LoadingSpinner from './components/LoadingSpinner';
import ReportDisplay from './components/ReportDisplay';
import * as geminiService from './services/geminiService';
import { CountryReportData, FinalReportPayload } from './types';
import { LANGUAGES } from './constants';
import { generateHtmlReport } from './reportGenerator';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [countries, setCountries] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('ko');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [finalReportHtml, setFinalReportHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setFinalReportHtml(null);

    const countryList = (countries || '').split(',').map(c => c.trim()).filter(Boolean);
    
    if (countryList.length === 0) {
      setError("Please enter at least one country.");
      setIsLoading(false);
      return;
    }

    if (countryList.length > 5) {
      setError("Please enter a maximum of 5 countries to ensure performance.");
      setIsLoading(false);
      return;
    }
    
    const targetLanguageName = LANGUAGES.find(l => l.code === targetLanguage)?.name || 'the selected language';

    try {
      setProgressMessage('Generating banner image...');
      const bannerPrompt = await geminiService.generateBannerImagePrompt(topic);
      const bannerImage = await geminiService.generateImage(bannerPrompt);

      setProgressMessage('Generating flag images...');
      const flagImages = await geminiService.generateFlagsForCountries(countryList);
      if (flagImages.length !== countryList.length) {
        throw new Error(`Data mismatch: Expected ${countryList.length} flag images, but received ${flagImages.length}.`);
      }
      
      const countryReports: CountryReportData[] = [];

      for (let i = 0; i < countryList.length; i++) {
        const country = countryList[i];
        setProgressMessage(`Researching news for ${country}...`);
        const { report: englishReport, sources } = await geminiService.conductResearchForCountry(topic, country);

        setProgressMessage(`Translating report for ${country}...`);
        const translatedReport = await geminiService.translateResearch(englishReport, targetLanguageName);
        
        countryReports.push({
            country,
            englishReport,
            translatedReport,
            flagImage: flagImages[i],
            sources,
        });
      }

      setProgressMessage('Assembling final report...');
      const payload: FinalReportPayload = {
        topic,
        bannerImage,
        countryReports,
      };
      
      const reportHtml = generateHtmlReport(payload);
      setFinalReportHtml(reportHtml);

    } catch (err) {
      console.error("An error occurred during report generation:", err);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        // Handle cases where a non-Error object with a message is thrown
        errorMessage = String((err as { message: unknown }).message);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  }, [topic, countries, targetLanguage]);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-black text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 animated-background">
      <div className="w-full flex flex-col items-center">
        {!finalReportHtml && (
            <div className="w-full flex flex-col items-center justify-center">
                <InputForm
                    topic={topic}
                    setTopic={setTopic}
                    countries={countries}
                    setCountries={setCountries}
                    targetLanguage={targetLanguage}
                    setTargetLanguage={setTargetLanguage}
                    onSubmit={handleGenerateReport}
                    isLoading={isLoading}
                />
                {isLoading && <div className="mt-8"><LoadingSpinner message={progressMessage} /></div>}
            </div>
        )}
        
        {error && <div className="mt-8 p-4 bg-red-900/50 text-red-200 border border-red-700 rounded-lg max-w-2xl text-center break-words">{`오류: ${error}`}</div>}

        {finalReportHtml && (
          <div className="w-full flex flex-col items-center">
            <ReportDisplay htmlContent={finalReportHtml} />
            <button
                onClick={() => {
                  setFinalReportHtml(null);
                  setError(null);
                }}
                className="mt-8 px-8 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 transition-colors duration-300"
            >
                다시 시작
            </button>
          </div>
        )}
      </div>
       <footer className="text-center py-6 text-slate-500 text-sm w-full mt-auto border-t border-slate-800">
        <p>Edited by 모두를 위한 Ai_Studio 연구소</p>
      </footer>
    </div>
  );
};

export default App;