import { CVAnalysis } from "@/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisResultsProps {
  analysis: CVAnalysis | null;
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
        {title}
      </h4>
      {items.length > 0 ? (
        <ul className="space-y-2 text-sm text-slate-200">
          {items.map((item, index) => (
            <li key={`${title}-${item}-${index}`} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">No data available.</p>
      )}
    </div>
  );
}

function TextBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
        {title}
      </h4>
      <p className="text-sm leading-relaxed text-slate-200">
        {content || "No data available."}
      </p>
    </div>
  );
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-100">AI Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            Upload your CV to view AI-generated skills, experience insights,
            education signals, and job role recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-900/60 bg-slate-900/80">
      <CardHeader>
        <CardTitle className="text-slate-100">AI Analysis Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-indigo-800/70 bg-gradient-to-r from-indigo-950/80 to-violet-950/70 p-4">
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-300">
            Professional Summary
          </h4>
          <p className="text-sm leading-relaxed text-slate-200">
            {analysis.professionalSummary || "No professional summary available."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ListBlock title="Skills" items={analysis.skills} />
          <ListBlock title="Suggested Job Roles" items={analysis.suggestedJobRoles} />
          <TextBlock title="Experience" content={analysis.experience} />
          <TextBlock title="Education" content={analysis.education} />
        </div>
      </CardContent>
    </Card>
  );
}
