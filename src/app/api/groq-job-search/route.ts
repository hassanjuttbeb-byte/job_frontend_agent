import { NextRequest, NextResponse } from "next/server";

interface RawJob {
  title?: string;
  company?: string;
  location?: string;
  url?: string;
  reason?: string;
  score?: number;
}

const decodeHtml = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const extractJson = (value: string) => {
  const cleaned = value.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Model did not return valid JSON.");
  }
  return cleaned.slice(start, end + 1);
};

const getWebResults = async (query: string) => {
  const response = await fetch(
    `https://duckduckgo.com/html/?q=${encodeURIComponent(`${query} jobs`)}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 JobScoutAI/1.0",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch online job results.");
  }

  const html = await response.text();
  const regex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g;
  const matches: { title: string; url: string }[] = [];
  let match: RegExpExecArray | null = regex.exec(html);

  while (match && matches.length < 8) {
    const url = decodeHtml(match[1]);
    const title = decodeHtml(match[2]).replace(/<[^>]+>/g, "").trim();
    if (url && title) {
      matches.push({ title, url });
    }
    match = regex.exec(html);
  }

  return matches;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = String(body?.query ?? "").trim();
    const topK = Math.min(Math.max(Number(body?.top_k ?? 6), 1), 10);

    if (query.length < 2) {
      return NextResponse.json(
        { detail: "Query must be at least 2 characters long." },
        { status: 400 },
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        {
          detail:
            "GROQ_API_KEY is missing. Add it in .env.local to enable AI online search.",
        },
        { status: 500 },
      );
    }

    const webResults = await getWebResults(query);
    const webContext =
      webResults.length > 0
        ? webResults.map((item, i) => `${i + 1}. ${item.title} - ${item.url}`).join("\n")
        : "No web results found.";

    const prompt = `You are a job search assistant.
User query: "${query}"
Online results:
${webContext}

Return ONLY valid JSON with this exact shape:
{
  "summary": "short summary",
  "results": [
    {
      "title": "job title",
      "company": "company or Unknown",
      "location": "location or Remote",
      "url": "full URL",
      "reason": "why this matches query",
      "score": 85
    }
  ]
}

Rules:
- Return at most ${topK} results
- Use only URLs from the provided online results
- Keep reason concise (max 20 words)
- score is a relevance match percentage from 0 to 100 based on how well the job matches the query
- If no useful result, return empty results array`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }],
      }),
      cache: "no-store",
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return NextResponse.json(
        { detail: `Groq request failed: ${errText}` },
        { status: groqResponse.status },
      );
    }

    const groqData = await groqResponse.json();
    const content = groqData?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("Invalid response from Groq.");
    }

    const parsed = JSON.parse(extractJson(content)) as {
      summary?: string;
      results?: RawJob[];
    };

    const sanitizedResults = (parsed.results ?? [])
      .filter((item) => item?.title && item?.url)
      .slice(0, topK)
      .map((item) => ({
        title: item.title ?? "Untitled job",
        company: item.company ?? "Unknown company",
        location: item.location ?? "Remote / Not specified",
        url: item.url ?? "#",
        reason: item.reason ?? "Potential match based on your query",
        score: typeof item.score === "number" ? Math.min(100, Math.max(0, item.score)) : null,
      }));

    return NextResponse.json({
      query,
      source: "groq+web",
      summary: parsed.summary ?? "AI-ranked online job matches",
      results: sanitizedResults,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
