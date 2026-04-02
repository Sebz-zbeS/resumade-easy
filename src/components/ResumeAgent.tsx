"use client";

import { useState, useRef } from "react";

type Step = "input" | "loading" | "result";
type Mode = "paste" | "upload";

interface PdfData {
  base64: string;
  mediaType: string;
  name: string;
}

export default function ResumeAgent() {
  const [step, setStep] = useState<Step>("input");
  const [mode, setMode] = useState<Mode>("paste");
  const [resumeText, setResumeText] = useState("");
  const [pdfData, setPdfData] = useState<PdfData | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setPdfData({ base64, mediaType: file.type || "application/pdf", name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const canSubmit =
    jobDescription.trim().length > 0 &&
    (mode === "paste" ? resumeText.trim().length > 0 : pdfData !== null);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStep("loading");
    setError("");

    try {
      const body =
        mode === "paste"
          ? { mode: "paste", resumeText, jobDescription }
          : {
              mode: "upload",
              pdfBase64: pdfData!.base64,
              pdfMediaType: pdfData!.mediaType,
              jobDescription,
            };

      const res = await fetch("/api/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Request failed.");

      setResult(data.result);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("input");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-customized.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const startOver = () => {
    setStep("input");
    setResult("");
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          padding: "2rem 2rem 1.5rem",
          borderBottom: "1px solid rgba(200,170,100,0.15)",
          maxWidth: "860px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <h1
          className="font-playfair"
          style={{ fontSize: "2rem", fontWeight: 600, color: "var(--gold)", letterSpacing: "-0.02em" }}
        >
          resumade <em style={{ fontWeight: 400 }}>easy</em>
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 300 }}>
          AI-powered resume customization &mdash; tailored to every job
        </p>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: "2rem", maxWidth: "860px", margin: "0 auto", width: "100%" }}>
        {step === "loading" && (
          <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
            <div className="spinner" style={{ margin: "0 auto 1.5rem" }} />
            <h2 className="font-playfair" style={{ fontSize: "1.5rem", color: "var(--gold)", marginBottom: "8px" }}>
              Customizing your resume...
            </h2>
            <p style={{ color: "var(--text-faint)", fontSize: "14px", fontWeight: 300 }}>
              Tailoring every section to the job description
            </p>
          </div>
        )}

        {step === "result" && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 className="font-playfair" style={{ fontSize: "1.15rem", color: "var(--gold)" }}>
                Your customized resume
              </h2>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {copied && (
                  <span style={{ fontSize: "12px", color: "var(--gold)" }}>Copied!</span>
                )}
                <button className="btn-outline" onClick={handleCopy}>Copy</button>
                <button className="btn-outline" onClick={handleDownload}>Download</button>
                <button className="btn-outline" onClick={startOver}>Start over</button>
              </div>
            </div>
            <div className="result-doc">{result}</div>
          </div>
        )}

        {step === "input" && (
          <>
            {error && (
              <div
                style={{
                  background: "rgba(227,75,75,0.08)",
                  border: "1px solid rgba(227,75,75,0.2)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  color: "#e34b4b",
                  fontSize: "13px",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}

            {/* Resume Input Card */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "rgba(200,170,100,0.1)", border: "1px solid rgba(200,170,100,0.25)",
                    color: "var(--gold)", fontSize: "11px", fontWeight: 500,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >1</div>
                <span style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Your Resume
                </span>
              </div>

              {/* Tabs */}
              <div
                style={{
                  display: "flex", background: "var(--bg-inset)",
                  border: "1px solid var(--border-gold)", borderRadius: "8px",
                  padding: "3px", width: "fit-content", marginBottom: "1rem",
                }}
              >
                <button className={`tab-btn ${mode === "paste" ? "active" : ""}`} onClick={() => setMode("paste")}>
                  Paste text
                </button>
                <button className={`tab-btn ${mode === "upload" ? "active" : ""}`} onClick={() => setMode("upload")}>
                  Upload PDF
                </button>
              </div>

              {mode === "paste" ? (
                <textarea
                  className="resume-textarea"
                  rows={10}
                  placeholder="Paste your resume here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              ) : (
                <>
                  {pdfData ? (
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        background: "var(--bg-inset)", border: "1px solid rgba(200,170,100,0.2)",
                        borderRadius: "8px", padding: "10px 14px",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span className="font-mono-dm" style={{ fontSize: "13px", color: "var(--gold)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {pdfData.name}
                      </span>
                      <button
                        onClick={() => { setPdfData(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: 0 }}
                      >×</button>
                    </div>
                  ) : (
                    <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ margin: "0 auto 12px", display: "block", opacity: 0.6 }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                        <span style={{ color: "var(--gold)", fontWeight: 500 }}>Click to upload</span> your resume PDF
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "4px" }}>PDF files only</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFile}
                  />
                </>
              )}
            </div>

            {/* Job Description Card */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "rgba(200,170,100,0.1)", border: "1px solid rgba(200,170,100,0.25)",
                    color: "var(--gold)", fontSize: "11px", fontWeight: 500,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >2</div>
                <span style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Job Description
                </span>
              </div>
              <textarea
                className="resume-textarea"
                rows={8}
                placeholder="Paste the full job description here — the more detail, the better the customization..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <button className="btn-primary" disabled={!canSubmit} onClick={handleSubmit}>
              Customize my resume →
            </button>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ padding: "1.5rem 2rem", borderTop: "1px solid rgba(200,170,100,0.08)", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "var(--text-faint)" }}>
          Powered by Claude · Built with Next.js
        </p>
      </footer>
    </div>
  );
}
