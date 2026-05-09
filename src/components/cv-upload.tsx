"use client";

import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { FileUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api, normalizeAnalysis } from "@/lib/api";
import { CVAnalysis } from "@/types/analysis";

interface CVUploadProps {
  onAnalysisReceived: (analysis: CVAnalysis) => void;
}

export function CVUpload({ onAnalysisReceived }: CVUploadProps) {
  const uploadPath = process.env.NEXT_PUBLIC_CV_UPLOAD_PATH || "/api/upload-cv";
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFileValid = useMemo(() => {
    if (!selectedFile) return false;
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    return allowedTypes.includes(selectedFile.type);
  }, [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setErrorMessage(null);
    setUploadProgress(0);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a PDF or DOCX file first.");
      return;
    }

    if (!isFileValid) {
      setErrorMessage("Only PDF and DOCX files are supported.");
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage(null);
      setUploadProgress(10);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post(uploadPath, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (!event.total) return;
          const progressValue = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progressValue);
        },
      });

      const normalized = normalizeAnalysis(response.data);
      onAnalysisReceived(normalized);
      setUploadProgress(100);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const apiMessage =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        "Upload failed. Please try again.";
      setErrorMessage(apiMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-cyan-900/60 bg-slate-900/80">
      <CardHeader>
        <CardTitle className="text-slate-100">Upload CV</CardTitle>
        <CardDescription>
          Select your resume file and send it to the AI analyzer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label
          htmlFor="cvFile"
          className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-cyan-800 bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-8 text-sm text-slate-300 hover:from-slate-800 hover:to-slate-700"
        >
          <FileUp className="h-5 w-5 text-cyan-300" />
          <span>
            {selectedFile ? selectedFile.name : "Choose a PDF or DOCX file"}
          </span>
        </label>
        <input
          id="cvFile"
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Uploading to JobScout AI...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {errorMessage}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Upload and Analyze"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
