"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Briefcase, Check, ExternalLink, Loader2, MapPin, Building2, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CVAnalysis } from "@/types/analysis";
import { JobResult, JobSearchResponse } from "@/types/job";

/* ── Score helpers ─────────────────────────────────────────────── */

const scoreColor = (score: number) => {
  if (score >= 75) return { ring: "stroke-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10", label: "Great Match" };
  if (score >= 50) return { ring: "stroke-amber-400", text: "text-amber-400", bg: "bg-amber-500/10", label: "Good Match" };
  return { ring: "stroke-red-400", text: "text-red-400", bg: "bg-red-500/10", label: "Low Match" };
};

function ScoreBadge({ score }: { score: number }) {
  const colors = scoreColor(score);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
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
      <span className={`text-[10px] font-medium ${colors.text}`}>{colors.label}</span>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────── */

interface CVMatchedJobsProps {
  analysis: CVAnalysis;
}

export function CVMatchedJobs({ analysis }: CVMatchedJobsProps) {
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const searchQuery = buildQueryFromAnalysis(analysis);
    if (searchQuery.length < 2) return;

    let cancelled = false;

    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await axios.post<JobSearchResponse>("/api/groq-job-search", {
          query: searchQuery,
          top_k: 6,
        });
        if (!cancelled) {
          setJobs(response.data.results ?? []);
          setSummary(response.data.summary ?? "");
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("Failed to find matching jobs. Please try the manual search below.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchJobs();
    return () => { cancelled = true; };
  }, [analysis]);

  const handleApply = (jobUrl: string, index: number) => {
    const key = `${jobUrl}-${index}`;
    window.open(jobUrl, "_blank", "noopener,noreferrer");
    setAppliedJobs((prev) => new Set(prev).add(key));
  };

  return (
    <Card className="border-cyan-900/60 bg-slate-900/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Sparkles className="h-5 w-5 text-cyan-300" />
          Jobs Matched to Your CV
        </CardTitle>
        <p className="text-xs text-slate-400">
          Auto-matched based on your skills: {analysis.skills.slice(0, 5).join(", ")}
          {analysis.skills.length > 5 ? ` +${analysis.skills.length - 5} more` : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="text-sm text-slate-300">Finding jobs that match your CV...</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {summary && !isLoading ? (
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-2 text-sm text-cyan-200">
            {summary}
          </div>
        ) : null}

        {!isLoading && jobs.length === 0 && !errorMessage ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            No matching jobs found for your profile. Try the AI search below.
          </p>
        ) : null}

        <div className="space-y-3">
          {jobs.map((job, index) => {
            const key = `${job.url}-${index}`;
            const isApplied = appliedJobs.has(key);

            return (
              <div
                key={key}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-cyan-700 hover:bg-slate-900"
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
                        : "border border-cyan-500/40 bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
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
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Build search query from CV analysis ──────────────────────── */

function buildQueryFromAnalysis(analysis: CVAnalysis): string {
  const parts: string[] = [];

  // Use suggested job roles first (most relevant)
  if (analysis.suggestedJobRoles.length > 0) {
    parts.push(analysis.suggestedJobRoles.slice(0, 2).join(" or "));
  }

  // Add top skills for context
  if (analysis.skills.length > 0) {
    parts.push(analysis.skills.slice(0, 3).join(" "));
  }

  parts.push("jobs");

  return parts.join(" ").trim();
}
