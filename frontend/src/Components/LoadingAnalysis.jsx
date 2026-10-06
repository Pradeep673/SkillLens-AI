import { useEffect, useState } from 'react';
import SkillLensMark from './SkillLensMark.jsx';

const stages = [
  'Reading your resume...',
  'Extracting technical skills...',
  'Understanding the job description...',
  'Comparing your experience...',
  'Finding your strongest matches...',
  'Identifying skills worth strengthening...',
  'Preparing your career insights...',
];

const quotes = [
  'Every application is a step closer to the right opportunity.',
  'Your next opportunity might start with one small improvement.',
  'Great careers are built one skill at a time.',
  'Your resume tells your story. Let’s make sure it tells the right one.',
  'Progress beats perfection.',
  'Keep applying. Keep learning. Keep moving.',
  'Your next interview could be closer than you think.',
];

function LoadingAnalysis({ fileName }) {
  const [stage, setStage] = useState(0);
  const [quote, setQuote] = useState(0);

  useEffect(() => {
    const stageTimer = window.setInterval(() => setStage((current) => Math.min(current + 1, stages.length - 1)), 2400);
    const quoteTimer = window.setInterval(() => setQuote((current) => (current + 1) % quotes.length), 6200);
    return () => { window.clearInterval(stageTimer); window.clearInterval(quoteTimer); };
  }, []);

  return (
    <main className="loading-page page-enter" aria-live="polite">
      <div className="loading-kicker"><span className="eyebrow-dot" /> SKILLLENS ANALYSIS IN PROGRESS</div>
      <div className="loading-orb-wrap" aria-hidden="true">
        <div className="loading-orbit loading-orbit-a" /><div className="loading-orbit loading-orbit-b" />
        <div className="loading-orb"><SkillLensMark className="loading-brand-mark" /></div>
      </div>
      <h1>Finding the signal<br /><em>in your story.</em></h1>
      <p className="loading-file">{fileName || 'Resume'} <span>·</span> Comparing against your target role</p>
      <div className="stage-track">
        <div className="stage-progress"><span style={{ width: `${((stage + 1) / stages.length) * 100}%` }} /></div>
        <p className="stage-current" key={stage}><span className="stage-spinner" />{stages[stage]}</p>
      </div>
      <blockquote key={quote} className="loading-quote">“{quotes[quote]}”</blockquote>
      <p className="loading-footnote">A thoughtful analysis takes a moment. Keep this tab open.</p>
    </main>
  );
}

export default LoadingAnalysis;