
export interface CountryReportData {
  country: string;
  englishReport: string;
  translatedReport: string;
  flagImage: string;
  sources: { uri: string; title: string; }[];
}

export interface FinalReportPayload {
  topic: string;
  bannerImage: string;
  countryReports: CountryReportData[];
}