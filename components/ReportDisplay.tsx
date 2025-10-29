import React, { useState, useEffect } from 'react';

interface ReportDisplayProps {
  htmlContent: string;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ htmlContent }) => {
  const [shareMessage, setShareMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (shareMessage) {
      const timer = setTimeout(() => {
        setShareMessage('');
        setIsError(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [shareMessage]);

  const handleDownload = () => {
    try {
      // Create a Blob from the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      // Create a temporary URL for the Blob
      const url = URL.createObjectURL(blob);
      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'global-news-report.html'; // Set the desired filename
      document.body.appendChild(a);
      a.click(); // Programmatically click the anchor to start the download
      document.body.removeChild(a); // Clean up by removing the anchor
      URL.revokeObjectURL(url); // Release the object URL
    } catch (error) {
        console.error("Failed to download HTML file:", error);
        alert("Sorry, there was an issue downloading the report file.");
    }
  };

  const handleShare = async () => {
    try {
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
      
      // Many browsers have a URL length limit of around 2MB.
      if (dataUrl.length > 2 * 1024 * 1024) {
        setIsError(true);
        setShareMessage('공유 가능한 링크로 만들기에는 보고서가 너무 큽니다.');
        return;
      }

      if (!navigator.clipboard) {
        setIsError(true);
        setShareMessage('브라우저에서 클립보드 접근을 지원하지 않습니다.');
        return;
      }

      await navigator.clipboard.writeText(dataUrl);
      setIsError(false);
      setShareMessage('링크가 클립보드에 복사되었습니다!');
    } catch (error) {
      console.error("Failed to copy share link:", error);
      setIsError(true);
      setShareMessage('클립보드에 링크를 복사할 수 없습니다.');
    }
  };

  const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
  );

  const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );

  const SuccessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

  const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl mt-8">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-y-4">
        <h3 className="text-2xl font-bold text-white">생성된 리포트</h3>
        <div className="flex items-center gap-4 flex-wrap">
          {shareMessage && (
            <div className={`flex items-center text-sm ${isError ? 'text-red-400' : 'text-green-400'} transition-opacity duration-300`} aria-live="polite">
                {isError ? <ErrorIcon /> : <SuccessIcon />}
                <span>{shareMessage}</span>
            </div>
          )}
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 transition-all duration-300 transform active:scale-95"
            aria-label="Share report by copying a link"
          >
            <ShareIcon />
            리포트 공유
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 transition-all duration-300 transform active:scale-95"
          >
            <DownloadIcon />
            HTML로 다운로드
          </button>
        </div>
      </div>
      <div className="border-4 border-slate-700 rounded-lg overflow-hidden">
        <iframe
          srcDoc={htmlContent}
          title="News Report"
          className="w-full h-[80vh]"
        />
      </div>
    </div>
  );
};

export default ReportDisplay;
