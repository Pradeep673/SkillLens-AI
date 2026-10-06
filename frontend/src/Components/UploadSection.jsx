import { useState } from 'react';

const formatBytes = (bytes) => bytes < 1024 * 1024
  ? `${(bytes / 1024).toFixed(0)} KB`
  : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

function UploadSection({ file, jobDescription, setJobDescription, fileInputRef, onFile, onRemoveFile, onSubmit, error }) {
  const [dragging, setDragging] = useState(false);

  return (
    <main className="upload-page page-enter">
      <section className="intro-block">
        <div className="eyebrow"><span className="eyebrow-dot" /> CAREER CLARITY, POWERED BY AI</div>
        <h1>Know how your resume<br className="desktop-break" /> <em>matches the job.</em></h1>
        <p className="intro-copy">A clearer picture of where you stand, what makes you a strong fit, and what to build next.</p>
        <div className="capability-list" aria-label="Analysis includes">
          <span>Technical skills</span><i /><span>Strengths</span><i /><span>Skill gaps</span><i /><span>Match insights</span>
        </div>
      </section>

      <form className="analysis-form" onSubmit={onSubmit}>
        <div className="form-heading">
          <div><span className="step-label">01 / YOUR MATERIALS</span><h2>Start with the essentials</h2></div>
          <span className="privacy-note"><span className="lock-icon">◇</span> PDF upload</span>
        </div>
        <div className="input-grid">
          <section className="field-column">
            <label className="field-label" htmlFor="resume-file">Your resume <span>PDF only</span></label>
            <div
              className={`dropzone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => { event.preventDefault(); setDragging(false); onFile(event.dataTransfer.files[0]); }}
            >
              <input
                id="resume-file"
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => { onFile(event.target.files[0]); event.target.value = ''; }}
              />
              {file ? (
                <div className="selected-file">
                  <span className="pdf-badge">PDF</span>
                  <span className="selected-file-copy"><strong title={file.name}>{file.name}</strong><small>{formatBytes(file.size)} · Ready to analyze</small></span>
                  <button type="button" className="icon-button remove-file" onClick={onRemoveFile} aria-label="Remove selected resume" title="Remove file">×</button>
                </div>
              ) : (
                <label className="dropzone-prompt" htmlFor="resume-file">
                  <span className="upload-glyph" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15.5v3A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-3" /></svg></span>
                  <strong>Drop your resume here</strong>
                  <span>or <u>browse files</u></span>
                  <small>PDF documents up to 20 MB</small>
                </label>
              )}
            </div>

            <label className="field-label jd-label" htmlFor="job-description">The job description <span>Required</span></label>
            <div className="textarea-wrap">
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                maxLength={10000}
                placeholder="Paste the role description here. Include responsibilities, qualifications, and the skills they’re looking for..."
                rows={8}
              />
              <span className="character-count">{jobDescription.length.toLocaleString()} / 10,000</span>
            </div>
          </section>

          <aside className="form-aside">
            <div className="aside-index">02</div>
            <div className="aside-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><span>✳</span></div>
            <h3>Make your next move with more clarity.</h3>
            <p>See how your experience connects to this role, from the skills you already bring to the ones worth strengthening.</p>
            <div className="aside-divider" />
            <div className="aside-foot"><span className="status-dot" /> Materials are sent to the analysis service</div>
          </aside>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <span className="form-hint">Your resume and job description are submitted for analysis.</span>
          <button className="primary-button" type="submit" disabled={!file || !jobDescription.trim()}>
            Analyze my resume <span aria-hidden="true">↗</span>
          </button>
        </div>
      </form>
      <div className="upload-bottom-note"><span>BUILT FOR THE NEXT CHAPTER</span><span>Less guessing. More direction.</span></div>
    </main>
  );
}

export default UploadSection;