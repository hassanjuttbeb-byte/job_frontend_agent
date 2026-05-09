export interface JobResult {
  title: string;
  company: string;
  url: string;
  location?: string | null;
  score?: number | null;
  reason?: string | null;
}

export interface JobSearchResponse {
  query: string;
  results: JobResult[];
  summary?: string;
  source?: string;
}
