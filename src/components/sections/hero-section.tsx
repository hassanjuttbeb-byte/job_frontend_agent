export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-xl shadow-black/20 sm:p-10">
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-16 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
      <p className="relative mb-3 inline-flex rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-200">
        Resume Intelligence
      </p>
      <h2 className="relative max-w-2xl text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
        Upload your CV and get actionable AI career insights instantly.
      </h2>
      <p className="relative mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
        JobScout AI reads your resume and generates a professional summary, skill
        highlights, role recommendations, and structured insights to accelerate your
        next job application.
      </p>
    </section>
  );
}
