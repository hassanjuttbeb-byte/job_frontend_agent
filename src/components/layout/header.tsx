import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm text-slate-400">AI Career Assistant</p>
            <h1 className="text-lg font-semibold text-slate-100">JobScout AI</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
