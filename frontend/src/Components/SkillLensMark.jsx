function SkillLensMark({ className = 'brand-mark' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" role="img" aria-label="SkillLens mark">
      <circle cx="17" cy="17" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="m24.2 24.2 9 9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      <path d="m10.5 18 5.1-5.1 6.9 6.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <circle cx="10.5" cy="18" r="2" fill="#cde4d3" />
      <circle cx="15.6" cy="12.9" r="2" fill="#cde4d3" />
      <circle cx="22.5" cy="19.1" r="2" fill="#cde4d3" />
    </svg>
  );
}

export default SkillLensMark;