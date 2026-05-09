import axios from "axios";
import { CVAnalysis } from "@/types/analysis";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 60000,
});

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }

  return [];
};

export const normalizeAnalysis = (payload: unknown): CVAnalysis => {
  const rootPayload =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const safePayload =
    rootPayload.analysis && typeof rootPayload.analysis === "object"
      ? (rootPayload.analysis as Record<string, unknown>)
      : rootPayload;

  const summaryRaw =
    safePayload.professionalSummary ??
    safePayload.professional_summary ??
    safePayload.summary;

  const experienceRaw = safePayload.experience;
  const educationRaw = safePayload.education;

  return {
    skills: toStringArray(safePayload.skills),
    experience:
      typeof experienceRaw === "string"
        ? experienceRaw
        : toStringArray(experienceRaw).join(", "),
    education:
      typeof educationRaw === "string"
        ? educationRaw
        : toStringArray(educationRaw).join(", "),
    suggestedJobRoles: toStringArray(
      safePayload.suggestedJobRoles ??
        safePayload.suggested_job_roles ??
        safePayload.job_roles,
    ),
    professionalSummary:
      typeof summaryRaw === "string"
        ? summaryRaw
        : "No professional summary returned by AI.",
  };
};
