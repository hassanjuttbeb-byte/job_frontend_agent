"use client";

import { FormEvent, useState } from "react";
import axios, { AxiosError } from "axios";
import { Bot, ExternalLink, Loader2, Search, Check, MapPin, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobResult, JobSearchResponse } from "@/types/job";

/* ── Score helpers ─────────────────────────────────────────────── */

const scoreColor = (score: number) => {
  if (score >= 75) return { ring: "stroke-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10" };
  if (score >= 50) return { ring: "stroke-amber-400", text: "text-amber-400", bg: "bg-amber-500/10" };
  return { ring: "stroke-red-400", text: "text-red-400", bg: "bg-red-500/10" };
};

function ScoreBadge({ score }: { score: number }) {
  const colors = scoreColor(score);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${colors.bg}`}>
      <svg className="-rotate-90" width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-800" />
        <circle
          cx="24" cy="24" r={radius} fill="none"
          strokeWidth="3" strokeLinecap="round"
          className={colors.ring}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className={`absolute text-xs font-bold ${colors.text}`}>{score}%</span>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────── */

export function JobQueryPanel() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim().length < 2) {
      setErrorMessage("Please enter at least 2 characters.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setAppliedJobs(new Set());
      const response = await axios.post<JobSearchResponse>("/api/groq-job-search", {
        query: query.trim(),
        top_k: 6,
      });
      setJobs(response.data.results ?? []);
      setSummary(response.data.summary ?? "");
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      setErrorMessage(
        axiosError.response?.data?.detail ||
          "Search failed. Please try another query.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (jobUrl: string, index: number) => {
    const key = `${jobUrl}-${index}`;
    window.open(jobUrl, "_blank", "noopener,noreferrer");
    setAppliedJobs((prev) => new Set(prev).add(key));
  };

  return (
    <Card className="border-violet-900/60 bg-slate-900/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Bot className="h-5 w-5 text-violet-300" />
          Ask JobScout AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Example: remote python backend jobs in pakistan"
            className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-200 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-900"
          />
          <Button type="submit" className="h-11 sm:w-44" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Jobs
              </>
            )}
          </Button>
        </form>
        <p className="text-xs text-slate-400">
          AI mode: Groq + online web results
        </p>

        {errorMessage && (
          <div className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {summary ? (
          <div className="rounded-lg border border-violet-500/30 bg-violet-950/40 px-3 py-2 text-sm text-violet-200">
            {summary}
          </div>
        ) : null}

        <div className="space-y-3">
          {jobs.length === 0 ? (
            <p className="text-sm text-slate-400">
              Ask a query to get AI-matched job recommendations.
            </p>
          ) : (
            jobs.map((job, index) => {
              const key = `${job.url}-${index}`;
              const isApplied = appliedJobs.has(key);

              return (
                <div
                  key={key}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-violet-700 hover:bg-slate-900"
                >
                  <div className="flex items-start gap-4">
                    {/* Score Badge */}
                    {job.score !== null && job.score !== undefined ? (
                      <ScoreBadge score={job.score} />
                    ) : null}

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-100 leading-tight">{job.title}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location || "Location not specified"}
                        </span>
                      </div>
                      {job.reason ? (
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">{job.reason}</p>
                      ) : null}
                    </div>

                    {/* Apply Button */}
                    <button
                      type="button"
                      onClick={() => handleApply(job.url, index)}
                      disabled={isApplied}
                      className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        isApplied
                          ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 cursor-default"
                          : "border border-violet-500/40 bg-violet-600 text-white hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/20 active:scale-95"
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Applied
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Apply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
