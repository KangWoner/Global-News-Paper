import React from 'react';
import LanguageSelector from './LanguageSelector';

interface InputFormProps {
  topic: string;
  setTopic: (topic: string) => void;
  countries: string;
  setCountries: (countries: string) => void;
  targetLanguage: string;
  setTargetLanguage: (language: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  topic,
  setTopic,
  countries,
  setCountries,
  targetLanguage,
  setTargetLanguage,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="w-full max-w-2xl p-8 space-y-6 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-white">국제 뉴스 페이퍼</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">
            뉴스 주제
          </label>
          <input
            type="text"
            name="topic"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white disabled:opacity-50 transition duration-200"
            placeholder="예: 신재생 에너지 최근 혁신"
          />
        </div>
        <div>
          <label htmlFor="countries" className="block text-sm font-medium text-slate-300 mb-2">
            나라이름
          </label>
          <textarea
            name="countries"
            id="countries"
            rows={3}
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            disabled={isLoading}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white disabled:opacity-50 transition duration-200"
            placeholder="최대 5개의 국가를 쉼표로 구분하여 입력하세요 (예: 미국, 일본, 독일)"
          />
        </div>
        <LanguageSelector 
            selectedLanguage={targetLanguage} 
            onLanguageChange={setTargetLanguage}
            disabled={isLoading}
        />
      </div>
      <div>
        <button
          onClick={onSubmit}
          disabled={isLoading || !topic.trim() || !countries.trim()}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-lg shadow-orange-500/20 text-lg font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
        >
          {isLoading ? '생성 중...' : '리포트 생성'}
        </button>
      </div>
    </div>
  );
};

// FIX: Added missing default export.
export default InputForm;