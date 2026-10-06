import { useEffect, useRef, useState } from 'react';
import SkillLensMark from './SkillLensMark.jsx';

const asList = (value) => {
  if (Array.isArray(value)) return value.filter((item) => item != null && item !== '');
  if (value == null || value === '') return [];
  return [value];
};

const itemText = (item) => {
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  if (item && typeof item === 'object') return item.skill || item.name || item.title || item.description || JSON.stringify(item);
  return '';
};

function MatchScore({ score }) {
  const [shownScore, setShownScore] = useState(0);
  const scoreValue = score == null || score === '' ? Number.NaN : Number(score);
  const safeScore = Number.isFinite(scoreValue) ? Math.max(0, Math.min(100, scoreValue)) : 0;
  const precision = Number.isFinite(scoreValue) ? Math.min((String(score).split('.')[1] || '').length, 4) : 0;

  useEffect(() => {
    let frame;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frame = requestAnimationFrame(() => setShownScore(safeScore));
      return () => cancelAnimationFrame(frame);
    }
    const started = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - started) / 1250, 1);
      const eased = 1 - (1 - progress) ** 4;
      setShownScore(safeScore * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [safeScore]);

  const counterText = shownScore === 0 ? '0' : shownScore.toFixed(precision);

  return (
    <div className="score-visual" style={{ '--score-angle': `${shownScore * 3.6}deg` }}>
      <div className="score-ring"><div className="score-center"><strong>{counterText}<span>%</span></strong><small>OVERALL MATCH</small></div></div>
    </div>
  );
}

function Reveal({ children, className = '' }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window));

  useEffect(() => {
    if (visible) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [visible]);

  return <div ref={sectionRef} className={`reveal-section ${visible ? 'is-visible' : ''} ${className}`}>{children}</div>;
}

function SkillGroup({ title, subtitle, items, variant }) {
  return (
    <section className={`skill-group skill-${variant}`}>
      <div className="skill-group-heading"><div><h3>{title}</h3><p>{subtitle}</p></div><span className="skill-count">{items.length.toString().padStart(2, '0')}</span></div>
      {items.length ? <div className="skill-chips">{items.map((item, index) => <span className="skill-chip" style={{ '--chip-delay': `${Math.min(index, 8) * 48}ms` }} key={`${itemText(item)}-${index}`}>{itemText(item)}</span>)}</div> : <p className="empty-note">{variant === 'related' ? 'No related matches identified.' : `No ${variant === 'gaps' ? 'additional' : ''} skills in this group were returned.`}</p>}
    </section>
  );
}

function Metric({ label, value, tone }) {
  return <div className={`metric metric-${tone}`}><span className="metric-swatch" /><div><strong>{value}</strong><span>{label}</span></div></div>;
}

function BreakdownRow({ label, amount, total, tone }) {
  const width = total ? Math.min(100, (amount / total) * 100) : 0;
  return <div className="breakdown-row"><div className="breakdown-label"><span>{label}</span><strong>{amount}</strong></div><div className="breakdown-track"><span className={`breakdown-fill fill-${tone}`} style={{ width: `${width}%` }} /></div></div>;
}

function InsightsList({ title, items, kind }) {
  return (
    <section className={`insight-list insight-${kind}`}>
      <div className="section-title-line"><span className="section-index">{kind === 'strengths' ? '01' : kind === 'gaps' ? '02' : '03'}</span><h3>{title}</h3></div>
      {items.length ? <ul>{items.map((item, index) => <li key={`${itemText(item)}-${index}`}><span className="list-mark">{kind === 'steps' ? String(index + 1).padStart(2, '0') : '✳'}</span><span>{itemText(item)}</span></li>)}</ul> : <p className="empty-note">No {title.toLowerCase()} were returned for this analysis.</p>}
    </section>
  );
}

function ResultsDashboard({ data, onNewAnalysis }) {
  const exactMatches = asList(data.exact_matches);
  const relatedMatches = asList(data.related_matches);
  const missingSkills = asList(data.missing_skills);
  const resumeSkills = asList(data.resume_skills);
  const jdSkills = asList(data.jd_skills);
  const analysis = data.analysis || {};
  const strengths = asList(analysis.strengths);
  const gaps = asList(analysis.skill_gaps);
  const recommendations = asList(analysis.recommendations);
  const expertise = itemText(data.expertise);
  const matchTotal = jdSkills.length || exactMatches.length + relatedMatches.length + missingSkills.length;
  const breakdownTotal = exactMatches.length + relatedMatches.length + missingSkills.length || matchTotal;
  const numericScore = data.match_percentage == null || data.match_percentage === '' ? Number.NaN : Number(data.match_percentage);
  const displayScore = Number.isFinite(numericScore) ? `${numericScore}%` : '—';
  const [reportError, setReportError] = useState('');

  const handleDownload = async () => {
    setReportError('');
    try {
      const { default: createCareerReport } = await import('./createCareerReport.js');
      createCareerReport(data);
    } catch {
      setReportError('The report could not be generated. Please try again.');
    }
  };

  return (
    <main className="results-page page-enter">
      <div className="results-topline"><div><span className="step-label">YOUR CAREER MATCH REPORT</span><p className="results-caption">A clearer view of your fit for this role</p></div><button className="outline-button" type="button" onClick={onNewAnalysis}>＋ New analysis</button></div>

      <section className="score-hero">
        <div className="score-copy"><div className="eyebrow"><span className="eyebrow-dot" /> ANALYSIS COMPLETE</div><h1>Your experience,<br /><em>in context.</em></h1><p>Here’s how your profile aligns with the opportunity you’re pursuing.</p><div className="file-context"><span className="pdf-badge small">PDF</span><span><strong>{data.file_name || 'Resume analysis'}</strong><small>Compared against {jdSkills.length ? `${jdSkills.length} identified job skills` : 'the job description provided'}</small></span></div></div>
        <div className="score-display"><MatchScore score={data.match_percentage} /><p className="score-subtitle">Based on technical skill alignment</p><p className="score-detail">{displayScore} alignment across skills identified in the role</p></div>
        <section className="metric-row" aria-label="Skill match counts">
          <Metric label="Exact matches" value={exactMatches.length} tone="exact" />
          <Metric label="Related matches" value={relatedMatches.length} tone="related" />
          <Metric label="Skills to strengthen" value={missingSkills.length} tone="missing" />
        </section>
      </section>

      <Reveal><section className="expertise-band"><div className="expertise-symbol" aria-hidden="true"><SkillLensMark className="expertise-brand-mark" /></div><div><span className="step-label">YOUR PROFILE</span><h2>A professional snapshot</h2><p>{expertise || 'Expertise information was not returned for this analysis.'}</p></div><span className="expertise-rule" /><div className="expertise-orbit" aria-hidden="true"><i /><i /><i /></div></section></Reveal>

      <Reveal><section className="content-section breakdown-section">
        <div className="section-heading"><div><span className="step-label">THE OVERVIEW</span><h2>Where the alignment comes from</h2></div><span className="section-meta">{matchTotal ? `${matchTotal} job skills identified` : 'Skill data unavailable'}</span></div>
        <div className="breakdown-layout"><div className="breakdown-graphic"><span className="breakdown-graphic-label">SKILL ALIGNMENT</span><div className="breakdown-graphic-total">{displayScore}</div><div className="breakdown-graphic-foot">overall match</div></div><div className="breakdown-bars"><BreakdownRow label="Exact matches" amount={exactMatches.length} total={breakdownTotal} tone="exact" /><BreakdownRow label="Related matches" amount={relatedMatches.length} total={breakdownTotal} tone="related" /><BreakdownRow label="Skills worth strengthening" amount={missingSkills.length} total={breakdownTotal} tone="missing" /><p className="chart-note">Counts reflect the skill comparison returned for this role.</p></div></div>
      </section></Reveal>

      <Reveal><section className="content-section skills-section">
        <div className="section-heading"><div><span className="step-label">SKILL INTELLIGENCE</span><h2>What connects. What’s next.</h2></div><span className="section-meta">{resumeSkills.length ? `${resumeSkills.length} skills found in your resume` : ''}</span></div>
        <div className="skill-groups"><SkillGroup title="Matched skills" subtitle="Direct overlap with the role" items={exactMatches} variant="matched" /><SkillGroup title="Related skills" subtitle="Transferable experience identified" items={relatedMatches} variant="related" /><SkillGroup title="Skills to strengthen" subtitle="An opportunity to grow your fit" items={missingSkills} variant="gaps" /></div>
      </section></Reveal>

      <Reveal><section className="content-section insights-section">
        <div className="section-heading"><div><span className="step-label">THE HUMAN READ</span><h2>AI Career Insights</h2></div><span className="ai-stamp">✳ &nbsp; PERSONALIZED TO THIS ROLE</span></div>
        <div className="summary-panel"><div className="summary-mark">“</div><div><span className="step-label">SUMMARY</span><p>{analysis.summary || 'A summary was not returned for this analysis.'}</p></div></div>
        <div className="insight-grid"><InsightsList title="Your strengths" items={strengths} kind="strengths" /><InsightsList title="Skills worth strengthening" items={gaps.length ? gaps : missingSkills} kind="gaps" /></div>
        <InsightsList title="Recommended next steps" items={recommendations} kind="steps" />
      </section></Reveal>

      <Reveal><section className="career-closing"><div className="closing-spark" aria-hidden="true">✳</div><span className="step-label">YOUR NEXT CHAPTER</span><h2>Keep building.<br /><em>Keep moving forward.</em></h2><p>Good luck on your job search. 🚀</p></section></Reveal>

      <div className="report-actions"><p>A considered snapshot of your fit, strengths, and next steps.</p><button className="primary-button report-button" type="button" onClick={handleDownload}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" /></svg>Download Insights as PDF</button></div>
      {reportError && <p className="form-error" role="alert">{reportError}</p>}
    </main>
  );
}

export default ResultsDashboard;