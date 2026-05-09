"use client";

import { useState } from "react";

import { AnalysisResults } from "@/components/analysis-results";
import { CVMatchedJobs } from "@/components/cv-matched-jobs";
import { CVUpload } from "@/components/cv-upload";
import { JobQueryPanel } from "@/components/job-query-panel";
import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/sections/hero-section";
import { CVAnalysis } from "@/types/analysis";

export function DashboardPage() {
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/60">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <HeroSection />
        <section className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <CVUpload onAnalysisReceived={setAnalysis} />
          <AnalysisResults analysis={analysis} />
        </section>
        {analysis && <CVMatchedJobs analysis={analysis} />}
        <JobQueryPanel />
      </main>
    </div>
  );
}

