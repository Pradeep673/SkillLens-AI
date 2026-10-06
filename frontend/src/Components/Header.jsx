import SkillLensMark from './SkillLensMark.jsx';

function Header({ onReset, onHome, theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={onHome} aria-label="SkillLens home">
        <span className="brand-icon"><SkillLensMark /></span>
        <span className="brand-copy">
          <span className="brand-name">SkillLens</span>
          <span className="brand-caption">AI RESUME INTELLIGENCE</span>
        </span>
      </button>
      <div className="topbar-right">
        <span className="topbar-tagline">Turn your resume into your next opportunity.</span>
        {onReset && <button className="text-button" type="button" onClick={onReset}>＋ New analysis</button>}
        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.3 15.2A8.4 8.4 0 0 1 8.8 3.7 8.7 8.7 0 1 0 20.3 15.2Z" /></svg>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;