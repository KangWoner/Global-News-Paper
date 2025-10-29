import { FinalReportPayload, CountryReportData } from './types';

// Simple markdown to HTML conversion with basic sanitization.
const markdownToHtml = (text: string): string => {
  if (typeof text !== 'string' || !text) return '';
  return text
    .trim()
    .split('\n\n')
    .map(paragraph => {
      // Basic sanitization to prevent HTML injection from report text
      const sanitizedParagraph = paragraph
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      return `<p>${sanitizedParagraph.split('\n').join('<br>')}</p>`;
    })
    .join('');
};

export const generateHtmlReport = (payload: FinalReportPayload): string => {
  const { topic, bannerImage, countryReports } = payload;

  const countrySections = countryReports.map((report: CountryReportData) => {
    const sourcesList = (report.sources && report.sources.length > 0)
    ? `
      <div class="sources-section">
        <h4>Sources</h4>
        <ul>
          ${report.sources.map(source => `<li><a href="${source.uri}" target="_blank" rel="noopener noreferrer">${source.title}</a></li>`).join('')}
        </ul>
      </div>
    `
    : '';

    return `
    <section class="country-report">
      <div class="country-header">
        <img src="data:image/jpeg;base64,${report.flagImage}" alt="${report.country} flag" class="flag-img">
        <h2>${report.country}</h2>
      </div>
      <div class="reports-container">
        <div class="report-column">
          <h3>Original Report (English)</h3>
          <div class="report-content">${markdownToHtml(report.englishReport)}</div>
        </div>
        <div class="report-column">
          <h3>Translated Report</h3>
          <div class="report-content">${markdownToHtml(report.translatedReport)}</div>
        </div>
      </div>
      ${sourcesList}
    </section>
  `}).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${topic} - 국제 뉴스 페이퍼</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        
        body {
          font-family: 'Inter', 'Noto Sans KR', sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(to bottom, #f4f7f9, #e9edf2);
          color: #1a202c;
          line-height: 1.6;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .banner {
          width: 100%;
          height: 350px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .main-title {
          text-align: center;
          font-size: 3rem;
          font-weight: 800;
          color: #1a202c;
          margin: 20px 0 40px 0;
          letter-spacing: -1px;
        }
        .country-report {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          overflow: hidden;
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .country-report:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        .country-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .country-header h2 {
          font-size: 2.2rem;
          margin: 0 0 0 20px;
          color: #2d3748;
        }
        .flag-img {
          width: 80px;
          height: auto;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          flex-shrink: 0;
        }
        .reports-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        .report-column h3 {
          font-size: 1.5rem;
          color: #4a5568;
          margin-top: 0;
          margin-bottom: 15px;
        }
        .report-content {
          font-size: 1rem;
          color: #4a5568;
          word-wrap: break-word;
        }
        .report-content p {
            margin: 0 0 1em 0;
        }
        .report-content p:last-child {
            margin-bottom: 0;
        }
        .sources-section {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        .sources-section h4 {
          font-size: 1.2rem;
          color: #4a5568;
          margin-top: 0;
          margin-bottom: 10px;
        }
        .sources-section ul {
          list-style-type: disc;
          padding-left: 20px;
          margin: 0;
        }
        .sources-section li {
          margin-bottom: 8px;
        }
        .sources-section a {
          color: #dd6b20;
          text-decoration: none;
          word-break: break-all;
        }
        .sources-section a:hover {
          text-decoration: underline;
        }

        @media (max-width: 860px) {
          .reports-container {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .main-title {
            font-size: 2rem;
          }
          .country-header h2 {
            font-size: 1.8rem;
          }
          .flag-img {
            width: 60px;
          }
          .country-report {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1 class="main-title">${topic}</h1>
          <img src="data:image/jpeg;base64,${bannerImage}" alt="${topic} Banner" class="banner">
        </header>
        <main>
          ${countrySections}
        </main>
      </div>
    </body>
    </html>
  `;
};