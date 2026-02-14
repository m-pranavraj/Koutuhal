import { useState } from "react";

export default function Home() {
  const [step, setStep] = useState(0); // 0 = upload, 1 = results
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  // Roles
  const [roles, setRoles] = useState([]);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleJD, setNewRoleJD] = useState("");
  
  // Job search
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedRoleForJobs, setSelectedRoleForJobs] = useState("");

  function resetFlow() {
    setStatus("");
    setLoading(false);
    setAnalysis(null);
    setAnalyzing(false);
    setRoles([]);
    setShowAddRole(false);
    setNewRoleName("");
    setNewRoleJD("");
    setStep(0);
  }

  function addRole() {
    const name = newRoleName.trim();
    if (!name) return;
    setRoles((r) => [...r, { role: name, job_description: newRoleJD.trim() || undefined }]);
    setNewRoleName("");
    setNewRoleJD("");
    setShowAddRole(false);
  }

  function removeRole(index) {
    setRoles((r) => r.filter((_, i) => i !== index));
  }

  async function handleFindJobs(role) {
    setSelectedRoleForJobs(role);
    setJobsLoading(true);
    setJobs([]);
    
    try {
      const res = await fetch(
        `/api/jobs?role=${encodeURIComponent(role)}&location=Global&count=5`
      );
      const data = await res.json().catch(() => []);
      if (res.ok && Array.isArray(data)) {
        setJobs(data.length > 0 ? data : []);
        if (data.length === 0) {
          setStatus("No jobs found for this role. Try another.");
        }
      } else {
        setStatus("Could not load jobs. Try again.");
      }
    } catch (err) {
      setStatus("Failed to fetch jobs: " + err.message);
    }
    setJobsLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (roles.length === 0) {
      setStatus("Add at least one target role.");
      return;
    }
    setLoading(true);
    setStatus("");
    setAnalysis(null);
    const form = e.target;
    const formData = new FormData(form);
    formData.set("role", roles.map((r) => r.role).join(", "));
    formData.set("job_description", roles[0]?.job_description || "");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("Resume uploaded. Running deep analysis…");
        form.reset();

        setAnalyzing(true);
        try {
          const analyzeRes = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: data.user_id,
              resume_id: data.resume_id,
              resume_text: data.resume_text,
              roles: roles,
            }),
          });
          const analyzeData = await analyzeRes.json().catch(() => ({}));
          if (analyzeRes.ok) {
            setAnalysis(analyzeData);
            if (analyzeData.is_resume === false) {
              setStatus("This document does not appear to be a resume.");
            } else {
              setStatus("Analysis complete!");
              setStep(1);
            }
          } else {
            setStatus("Upload OK. Analysis failed: " + (analyzeData.details || analyzeData.error || analyzeRes.statusText) + (analyzeData.raw ? ` — Raw: ${analyzeData.raw}` : ""));
          }
        } catch (err) {
          setStatus("Upload OK. Analysis failed: " + err.message);
        }
        setAnalyzing(false);
      } else {
        const msg = [data.error, data.details, res.statusText].filter(Boolean).join(" — ");
        setStatus("Error: " + msg);
      }
    } catch (err) {
      setStatus("Error: " + err.message);
    }
    setLoading(false);
  }

  // ── Helpers for score colors ──
  function scoreColor(score) {
    if (score >= 75) return "#22c55e";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  }
  function verdictColor(verdict) {
    if (!verdict) return "#8A8F86";
    const v = verdict.toLowerCase();
    if (v.includes("strong")) return "#22c55e";
    if (v.includes("good")) return "#ADFF44";
    if (v.includes("partial")) return "#f59e0b";
    return "#ef4444";
  }

  return (
    <main className="page">
      <div className="page-inner">

        {/* ═══════════════════════════════════════════════
            STEP 0 — UPLOAD + CAREER PREFS
        ═══════════════════════════════════════════════ */}
        <section className={`stage ${step === 0 ? "active" : ""}`}>
          <div className="section">
            <div className="premium-shell" id="upload">

              {/* LEFT — copy */}
              <div className="premium-left">
                <p className="eyebrow">Resume Intelligence</p>
                <h2 className="headline">Deep-scan your resume</h2>
                <p className="lead">
                  ATS scoring, role-fit analysis, and AI career recommendations — all in one upload.
                </p>

                <div className="value-stack">
                  <div className="value-card hover-card stagger-item" style={{ "--delay": "80ms" }}>
                    <h4>ATS Score</h4>
                    <span className="value-detail">6-dimension ATS audit with actionable tips.</span>
                  </div>
                  <div className="value-card hover-card stagger-item" style={{ "--delay": "140ms" }}>
                    <h4>Role Match</h4>
                    <span className="value-detail">% match for every target role you add.</span>
                  </div>
                  <div className="value-card hover-card stagger-item" style={{ "--delay": "200ms" }}>
                    <h4>AI Recommendations</h4>
                    <span className="value-detail">Discover roles you didn't know you're great for.</span>
                  </div>
                </div>

                {analysis && (
                  <div className="section-actions" style={{ marginTop: 12 }}>
                    <button className="btn btn-primary" type="button" onClick={() => setStep(1)}>
                      View Results →
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT — form */}
              <div className="premium-right">
                <form onSubmit={handleSubmit} className="form-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Candidate profile</h3>
                      <p className="micro">Fill in your details for precise analysis.</p>
                    </div>
                  </div>

                  {/* ── Your Details ── */}
                  <div className="panel-section">
                    <h4>Your details</h4>
                    <div className="field-grid">
                      <div className="field">
                        <label>Name *</label>
                        <input name="name" type="text" required placeholder="Full name" />
                      </div>
                      <div className="field">
                        <label>Email *</label>
                        <input name="email" type="email" required placeholder="you@example.com" />
                      </div>
                    </div>
                    <div className="field">
                      <label>Phone</label>
                      <input name="phone" type="text" placeholder="Optional" />
                    </div>
                  </div>

                  {/* ── Target Roles ── */}
                  <div className="panel-section">
                    <div className="panel-row">
                      <div>
                        <h4>Target roles *</h4>
                        <p className="micro">Add the roles you want to apply for.</p>
                      </div>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddRole(true)}>
                        + Add
                      </button>
                    </div>

                    {roles.length > 0 && (
                      <div className="role-list">
                        {roles.map((r, i) => (
                          <span key={i} className="role-chip">
                            {r.role}
                            {r.job_description && <span className="chip-badge">JD</span>}
                            <button type="button" onClick={() => removeRole(i)}>×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    {showAddRole && (
                      <div className="card-sub">
                        <div className="field">
                          <label>Role name *</label>
                          <input
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            placeholder="e.g. Frontend Developer"
                            autoFocus
                          />
                        </div>
                        <div className="field">
                          <label>Job description (optional)</label>
                          <textarea
                            value={newRoleJD}
                            onChange={(e) => setNewRoleJD(e.target.value)}
                            placeholder="Paste JD if you have one"
                            rows={3}
                          />
                        </div>
                        <div className="row">
                          <button type="button" className="btn btn-primary btn-sm" onClick={addRole}>
                            Save role
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => { setShowAddRole(false); setNewRoleName(""); setNewRoleJD(""); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Resume Upload ── */}
                  <div className="panel-section">
                    <h4>Resume</h4>
                    <div className="field">
                      <label>Upload PDF *</label>
                      <input name="resume" type="file" accept=".pdf" required />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading || analyzing || roles.length === 0}
                    >
                      {loading ? "Uploading…" : analyzing ? "Analyzing…" : "Upload & Analyze"}
                    </button>
                  </div>
                </form>

                {status && (
                  <div className={`notice ${status.startsWith("Error") || status.includes("not appear") ? "error" : "success"}`}>
                    {status}
                  </div>
                )}

                {/* NOT A RESUME warning */}
                {analysis && analysis.is_resume === false && (
                  <div className="notice error">
                    <strong>Not a resume detected.</strong>{" "}
                    {analysis.not_resume_reason || "The uploaded document does not appear to be a resume or CV. Please upload your actual resume."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            STEP 1 — ANALYSIS RESULTS + JOBS
        ═══════════════════════════════════════════════ */}
        <section className={`stage ${step === 1 ? "active" : ""}`}>
          <div className="section">
            <div className="section-header">
              <div>
                <p className="eyebrow">Analysis Results</p>
                <h2>Your Resume Intelligence Report</h2>
              </div>
              <div className="section-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-ghost" type="button" onClick={resetFlow}>Start over</button>
              </div>
            </div>

            {!analysis && (
              <div className="card empty">
                <h3>No analysis yet</h3>
                <p>Upload your resume first.</p>
                <button className="btn btn-primary" type="button" onClick={() => setStep(0)}>Go to upload</button>
              </div>
            )}

            {analysis && analysis.is_resume === false && (
              <div className="card" style={{ borderColor: "rgba(239,68,68,0.5)" }}>
                <h3 style={{ color: "#ef4444" }}>⚠ Not a Resume</h3>
                <p>{analysis.not_resume_reason || "The uploaded file doesn't appear to be a resume. Please go back and upload your actual resume/CV."}</p>
                <button className="btn btn-primary" type="button" onClick={() => setStep(0)}>Upload again</button>
              </div>
            )}

            {analysis && analysis.is_resume !== false && (
              <>
                {/* ── Executive Summary ── */}
                {analysis.summary && (
                  <div className="card summary-card">
                    <p className="summary-text">{analysis.summary}</p>
                  </div>
                )}

                {/* ── ATS Score + Role Matches Row ── */}
                <div className="results-grid">

                  {/* ATS Score Panel */}
                  {analysis.ats_score && (
                    <div className="card ats-card">
                      <h3>ATS Score</h3>
                      <div className="ats-overall">
                        <div className="score-ring" style={{ "--score-color": scoreColor(analysis.ats_score.overall) }}>
                          <span className="score-big">{analysis.ats_score.overall}</span>
                          <span className="score-label">/ 100</span>
                        </div>
                      </div>
                      <div className="ats-bars">
                        {[
                          { key: "formatting", label: "Formatting" },
                          { key: "keyword_optimization", label: "Keywords" },
                          { key: "structure", label: "Structure" },
                          { key: "quantification", label: "Quantification" },
                          { key: "readability", label: "Readability" },
                          { key: "completeness", label: "Completeness" },
                        ].map(({ key, label }) => {
                          const val = analysis.ats_score[key] ?? 0;
                          return (
                            <div key={key} className="ats-bar-row">
                              <span className="ats-bar-label">{label}</span>
                              <div className="ats-bar-track">
                                <div
                                  className="ats-bar-fill"
                                  style={{ width: `${val}%`, background: scoreColor(val) }}
                                />
                              </div>
                              <span className="ats-bar-val" style={{ color: scoreColor(val) }}>{val}</span>
                            </div>
                          );
                        })}
                      </div>
                      {analysis.ats_score.tips?.length > 0 && (
                        <div className="ats-tips">
                          <h4>ATS Tips</h4>
                          <ul>
                            {analysis.ats_score.tips.map((t, i) => <li key={i}>{t}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Role Match Panel */}
                  <div className="card roles-card">
                    <h3>Role Match Analysis</h3>

                    {/* Best For */}
                    {analysis.best_for && (
                      <div className="best-for-block">
                        <span className="best-for-label">Best For</span>
                        <div className="best-for-role">
                          <span className="best-for-name">{analysis.best_for.role}</span>
                          <span className="best-for-pct" style={{ color: scoreColor(analysis.best_for.match_percentage) }}>
                            {analysis.best_for.match_percentage}%
                          </span>
                        </div>
                        {analysis.best_for.reasoning && (
                          <p className="best-for-reason">{analysis.best_for.reasoning}</p>
                        )}
                      </div>
                    )}

                    {/* Per-role scores */}
                    {analysis.role_matches?.length > 0 && (
                      <div className="role-match-list">
                        {analysis.role_matches.map((rm, i) => (
                          <div key={i} className="role-match-item">
                            <div className="role-match-header">
                              <span className="role-match-name">{rm.role}</span>
                              <div className="role-match-score">
                                <span className="role-pct" style={{ color: scoreColor(rm.match_percentage) }}>
                                  {rm.match_percentage}%
                                </span>
                                <span className="role-verdict" style={{ color: verdictColor(rm.verdict) }}>
                                  {rm.verdict}
                                </span>
                              </div>
                            </div>
                            <div className="role-match-bar">
                              <div
                                className="role-match-bar-fill"
                                style={{ width: `${rm.match_percentage}%`, background: scoreColor(rm.match_percentage) }}
                              />
                            </div>
                            {rm.why_good && (
                              <p className="role-reason good">✓ {rm.why_good}</p>
                            )}
                            {rm.why_not_good && (
                              <p className="role-reason bad">✗ {rm.why_not_good}</p>
                            )}
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleFindJobs(rm.role)}
                              disabled={jobsLoading}
                              style={{ marginTop: "12px" }}
                            >
                              {jobsLoading && selectedRoleForJobs === rm.role ? "Finding jobs…" : "Find Jobs →"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}


                  </div>
                </div>

                {/* ── Strengths + Gaps Row ── */}
                <div className="results-grid two-col">
                  {analysis.strengths?.length > 0 && (
                    <div className="card">
                      <h3>Strengths</h3>
                      <ul className="insight-list green">
                        {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {analysis.gaps?.length > 0 && (
                    <div className="card">
                      <h3>Gaps to Address</h3>
                      <ul className="insight-list red">
                        {analysis.gaps.map((g, i) => <li key={i}>{g}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {/* ── AI Recommendations ── */}
                {analysis.recommendations?.length > 0 && (
                  <div className="card">
                    <h3>AI Recommendations — Other Roles for You</h3>
                    <p className="muted" style={{ marginBottom: 8 }}>
                      Based on your resume, these roles could be a great fit:
                    </p>
                    <div className="rec-grid">
                      {analysis.recommendations.map((rec, i) => (
                        <div key={i} className="rec-card">
                          <div className="rec-header">
                            <span className="rec-role">{rec.role}</span>
                            <span className="rec-score" style={{ color: scoreColor(rec.score) }}>{rec.score}%</span>
                          </div>
                          <p className="rec-reason">{rec.reason}</p>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleFindJobs(rec.role)}
                            disabled={jobsLoading}
                          >
                            {jobsLoading && selectedRoleForJobs === rec.role ? "Finding…" : "Explore →"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Job Listings ── */}
                {selectedRoleForJobs && (
                  <div className="card jobs-section">
                    <h3>Job Listings — {selectedRoleForJobs}</h3>
                    {jobsLoading && <p className="muted">Fetching jobs…</p>}
                    {!jobsLoading && jobs.length === 0 && <p className="muted">No jobs found. Try another role.</p>}
                    {!jobsLoading && jobs.length > 0 && (
                      <div className="jobs-grid">
                        {jobs.map((job, i) => (
                          <div key={i} className="job-card">
                            <h4>{job.title}</h4>
                            <p className="job-company">{job.company}</p>
                            <p className="job-location">{job.location}</p>
                            {job.snippet && <p className="job-snippet">{job.snippet}</p>}
                            {job.apply_url ? (
                              <a
                                href={job.apply_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-sm"
                              >
                                Apply Now →
                              </a>
                            ) : (
                              <span className="btn btn-ghost btn-sm" style={{ opacity: 0.5 }}>
                                No link available
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
