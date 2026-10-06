import { jsPDF } from 'jspdf';

const PAGE_WIDTH = 210;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BODY_WIDTH = CONTENT_WIDTH - 8;
const FOOTER_Y = 281;
const COLORS = {
  ink: [33, 52, 44],
  muted: [103, 120, 110],
  line: [220, 229, 222],
  green: [63, 119, 95],
  greenDark: [39, 76, 59],
  pale: [239, 246, 240],
  coral: [203, 103, 77],
  white: [255, 255, 255],
};

const asText = (value) => String(value ?? '').trim();
const itemText = (item) => {
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  if (item && typeof item === 'object') return item.skill || item.name || item.title || item.description || JSON.stringify(item);
  return '';
};
const asList = (value) => {
  const values = Array.isArray(value) ? value : value == null || value === '' ? [] : [value];
  return values.map(itemText).filter(Boolean);
};
const formatPercent = (value) => {
  const number = Number(value);
  return value == null || value === '' || !Number.isFinite(number) ? 'Not available' : `${number}%`;
};

function createCareerReport(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const exactMatches = asList(data.exact_matches);
  const relatedMatches = asList(data.related_matches);
  const missingSkills = asList(data.missing_skills);
  const jdSkills = asList(data.jd_skills);
  const analysis = data.analysis || {};
  const strengths = asList(analysis.strengths);
  const skillGaps = asList(analysis.skill_gaps);
  const recommendations = asList(analysis.recommendations);
  const expertise = asText(itemText(data.expertise));
  const candidateName = asText(data.candidate_name || data.candidateName || data.candidate?.name || data.personal_info?.name);
  const generatedDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const drawPageHeader = (continued = false) => {
    doc.setFillColor(...COLORS.greenDark);
    doc.roundedRect(MARGIN, 12, 12, 12, 2, 2, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setDrawColor(...COLORS.white);
    doc.setLineWidth(0.75);
    doc.circle(MARGIN + 4.6, 16.7, 2.5, 'S');
    doc.line(MARGIN + 6.3, 18.5, MARGIN + 9.6, 21.8);
    doc.setLineWidth(0.45);
    doc.line(MARGIN + 2.8, 16.9, MARGIN + 4.6, 15.2);
    doc.line(MARGIN + 4.6, 15.2, MARGIN + 6.4, 17);
    doc.setFillColor(205, 228, 211);
    doc.circle(MARGIN + 2.8, 16.9, 0.65, 'F');
    doc.circle(MARGIN + 4.6, 15.2, 0.65, 'F');
    doc.circle(MARGIN + 6.4, 17, 0.65, 'F');
    doc.setTextColor(...COLORS.ink);
    doc.setFontSize(11);
    doc.text('SkillLens', MARGIN + 16, 17.2);
    doc.setTextColor(...COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('AI RESUME INTELLIGENCE', MARGIN + 16, 22.2);
    doc.text(continued ? 'CAREER MATCH REPORT  /  CONTINUED' : 'CAREER MATCH REPORT', PAGE_WIDTH - MARGIN, 18, { align: 'right' });
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.35);
    doc.line(MARGIN, 29, PAGE_WIDTH - MARGIN, 29);
  };

  const newPage = () => {
    doc.addPage();
    drawPageHeader(true);
    return 38;
  };

  const ensureSpace = (y, height, continuationTitle) => {
    if (y + height <= FOOTER_Y - 5) return y;
    let nextY = newPage();
    if (continuationTitle) nextY = addSectionTitle(continuationTitle, nextY);
    return nextY;
  };

  const addSectionTitle = (title, y) => {
    doc.setTextColor(...COLORS.greenDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title, MARGIN, y);
    doc.setDrawColor(...COLORS.coral);
    doc.setLineWidth(0.8);
    doc.line(MARGIN, y + 2.5, MARGIN + 12, y + 2.5);
    return y + 10;
  };

  const writeParagraph = (text, x, y, width, options = {}) => {
    const content = asText(text);
    if (!content) return y;
    const fontSize = options.fontSize || 10.5;
    const lineHeight = options.lineHeight || 5.4;
    const color = options.color || COLORS.ink;
    const style = options.style || 'normal';
    doc.setFont('helvetica', style);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(content, width);
    let currentY = y;
    for (const line of lines) {
      if (currentY > FOOTER_Y - 5) currentY = newPage() + 2;
      doc.text(line, x, currentY);
      currentY += lineHeight;
    }
    return currentY;
  };

  const drawRows = (title, items, y, emptyText, columns = 1) => {
    y = ensureSpace(y, 17, `${title} (continued)`);
    y = addSectionTitle(title, y);
    if (!items.length) {
      return writeParagraph(emptyText, MARGIN, y, CONTENT_WIDTH, { color: COLORS.muted, style: 'italic' }) + 4;
    }

    const gap = 5;
    const columnWidth = columns === 1 ? CONTENT_WIDTH : (CONTENT_WIDTH - gap) / columns;
    const rowsPerLine = columns;
    const lineHeight = 5.5;
    for (let index = 0; index < items.length; index += rowsPerLine) {
      const rowItems = items.slice(index, index + rowsPerLine);
      const rowLines = rowItems.map((text) => doc.splitTextToSize(text, columnWidth - 14));
      const rowHeight = Math.max(...rowLines.map((lines) => lines.length * lineHeight + 7));
      if (y + rowHeight > FOOTER_Y - 5) {
        y = newPage();
        y = addSectionTitle(`${title} (continued)`, y);
      }
      rowItems.forEach((text, columnIndex) => {
        const x = MARGIN + columnIndex * (columnWidth + gap);
        const lines = rowLines[columnIndex];
        doc.setFillColor(...(title.includes('Strengthen') ? [250, 242, 237] : COLORS.pale));
        doc.setDrawColor(...COLORS.line);
        doc.roundedRect(x, y, columnWidth, rowHeight - 1, 1.5, 1.5, 'FD');
        doc.setFillColor(...(title.includes('Strengthen') ? COLORS.coral : COLORS.green));
        doc.roundedRect(x, y, 1.2, rowHeight - 1, 0.5, 0.5, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(...COLORS.ink);
        doc.text(lines, x + 6, y + 5.8);
      });
      y += rowHeight + 2.2;
    }
    return y + 3;
  };

  const writeInsightList = (title, items, y, options = {}) => {
    y = ensureSpace(y, 20, `${title} (continued)`);
    y = addSectionTitle(title, y);
    if (!items.length) return writeParagraph(options.emptyText || 'No information was returned for this section.', MARGIN, y, BODY_WIDTH, { color: COLORS.muted, style: 'italic' }) + 4;
    const fontSize = 10.5;
    const lineHeight = 5.5;
    const textX = MARGIN + 15;
    const textWidth = BODY_WIDTH - 18;

    for (let index = 0; index < items.length; index += 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(items[index], textWidth);
      let lineOffset = 0;

      while (lineOffset < lines.length) {
        if (y + 11 > FOOTER_Y - 5) {
          y = newPage();
          y = addSectionTitle(`${title} (continued)`, y);
        }
        const availableLines = Math.max(1, Math.floor((FOOTER_Y - 5 - y - 5) / lineHeight));
        const cardLines = lines.slice(lineOffset, lineOffset + availableLines);
        const rowHeight = Math.max(11, cardLines.length * lineHeight + 5);
        doc.setFillColor(...(options.numbered ? COLORS.pale : COLORS.white));
        doc.setDrawColor(...COLORS.line);
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, rowHeight, 1.5, 1.5, options.numbered ? 'FD' : 'D');
        if (options.numbered) {
          doc.setFillColor(...COLORS.green);
          doc.circle(MARGIN + 7, y + rowHeight / 2, 4, 'F');
          doc.setTextColor(...COLORS.white);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(String(index + 1).padStart(2, '0'), MARGIN + 7, y + rowHeight / 2 + 1, { align: 'center' });
        } else {
          doc.setTextColor(...COLORS.coral);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text('•', MARGIN + 6, y + rowHeight / 2 + 1.4);
        }
        doc.setTextColor(...COLORS.ink);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSize);
        doc.text(cardLines, textX, y + 6.2);
        y += rowHeight + 2.2;
        lineOffset += cardLines.length;
        if (lineOffset < lines.length) {
          y = newPage();
          y = addSectionTitle(`${title} (continued)`, y);
        }
      }
    }
    return y + 3;
  };

  drawPageHeader();

  let y = 43;
  doc.setTextColor(...COLORS.coral);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('EXECUTIVE SUMMARY', MARGIN, y);
  y += 10;
  doc.setTextColor(...COLORS.ink);
  doc.setFont('times', 'bold');
  doc.setFontSize(25);
  doc.text('Career Match Analysis', MARGIN, y);
  y += 8;
  doc.setTextColor(...COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Resume:', MARGIN, y);
  doc.setTextColor(...COLORS.ink);
  doc.setFont('helvetica', 'bold');
  const resumeLines = doc.splitTextToSize(asText(data.file_name) || 'Resume', CONTENT_WIDTH - 17);
  doc.text(resumeLines, MARGIN + 16, y);
  y += Math.max(resumeLines.length, 1) * 4.5 + 7;
  if (candidateName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.muted);
    doc.text('Candidate:', MARGIN, y);
    doc.setTextColor(...COLORS.ink);
    doc.setFont('helvetica', 'bold');
    const candidateLines = doc.splitTextToSize(candidateName, CONTENT_WIDTH - 19);
    doc.text(candidateLines, MARGIN + 19, y);
    y += Math.max(candidateLines.length, 1) * 4.5 + 2;
  }

  doc.setFillColor(...COLORS.pale);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 37, 2, 2, 'F');
  doc.setFillColor(...COLORS.green);
  doc.rect(MARGIN, y, 2, 37, 'F');
  doc.setTextColor(...COLORS.greenDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OVERALL MATCH', MARGIN + 9, y + 10);
  doc.setTextColor(...COLORS.ink);
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.text(formatPercent(data.match_percentage), MARGIN + 9, y + 25);
  doc.setTextColor(...COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Based on technical skill alignment', PAGE_WIDTH - MARGIN - 8, y + 21, { align: 'right' });
  y += 45;

  const metrics = [
    ['Exact Matches', exactMatches.length, COLORS.green],
    ['Related Matches', relatedMatches.length, [188, 144, 80]],
    ['Skills to Strengthen', missingSkills.length, COLORS.coral],
  ];
  const metricGap = 4;
  const metricWidth = (CONTENT_WIDTH - metricGap * 2) / 3;
  metrics.forEach(([label, value, color], index) => {
    const x = MARGIN + index * (metricWidth + metricGap);
    doc.setDrawColor(...COLORS.line);
    doc.setFillColor(...COLORS.white);
    doc.roundedRect(x, y, metricWidth, 25, 1.5, 1.5, 'FD');
    doc.setFillColor(...color);
    doc.rect(x, y, 1.5, 25, 'F');
    doc.setTextColor(...COLORS.ink);
    doc.setFont('times', 'bold');
    doc.setFontSize(19);
    doc.text(String(value), x + 7, y + 12);
    doc.setTextColor(...COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.7);
    doc.text(label, x + 7, y + 19.5);
  });
  y += 35;

  y = addSectionTitle('Professional Snapshot', y);
  y = writeParagraph(expertise || 'Expertise information was not returned for this analysis.', MARGIN, y, BODY_WIDTH, { fontSize: 11, lineHeight: 5.8 }) + 5;

  y = ensureSpace(y, 38, 'Where the Alignment Comes From');
  y = addSectionTitle('Where the Alignment Comes From', y);
  const denominator = jdSkills.length || exactMatches.length + relatedMatches.length + missingSkills.length;
  const breakdown = [
    ['Exact matches', exactMatches.length, COLORS.green],
    ['Related matches', relatedMatches.length, [188, 144, 80]],
    ['Skills to strengthen', missingSkills.length, COLORS.coral],
  ];
  breakdown.forEach(([label, count, color]) => {
    y = ensureSpace(y, 12, 'Where the Alignment Comes From (continued)');
    doc.setTextColor(...COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(label, MARGIN, y);
    doc.setTextColor(...COLORS.ink);
    doc.setFont('helvetica', 'bold');
    doc.text(String(count), PAGE_WIDTH - MARGIN, y, { align: 'right' });
    doc.setFillColor(...COLORS.line);
    doc.roundedRect(MARGIN, y + 2.5, CONTENT_WIDTH, 2.2, 1, 1, 'F');
    const ratio = denominator ? Math.min(count / denominator, 1) : 0;
    if (ratio > 0) {
      doc.setFillColor(...color);
      doc.roundedRect(MARGIN, y + 2.5, CONTENT_WIDTH * ratio, 2.2, 1, 1, 'F');
    }
    y += 12;
  });

  y = newPage();
  doc.setTextColor(...COLORS.coral);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SKILL INTELLIGENCE', MARGIN, y);
  y += 10;
  doc.setTextColor(...COLORS.ink);
  doc.setFont('times', 'bold');
  doc.setFontSize(25);
  doc.text('Skill Alignment', MARGIN, y);
  y += 13;
  y = drawRows('Exact Matches', exactMatches, y, 'No exact matches identified.');
  y = drawRows('Related Matches', relatedMatches, y, 'No related matches identified.');
  y = drawRows('Skills to Strengthen', missingSkills, y, 'No additional skills identified.', 2);

  y = newPage();
  doc.setTextColor(...COLORS.coral);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PERSONALIZED ROLE ANALYSIS', MARGIN, y);
  y += 10;
  doc.setTextColor(...COLORS.ink);
  doc.setFont('times', 'bold');
  doc.setFontSize(25);
  doc.text('AI Career Insights', MARGIN, y);
  y += 14;
  y = addSectionTitle('Summary', y);
  y = writeParagraph(analysis.summary || 'A summary was not returned for this analysis.', MARGIN, y, BODY_WIDTH, { fontSize: 10.5, lineHeight: 5.8 }) + 6;
  y = writeInsightList('Strengths', strengths, y, { emptyText: 'No strengths were returned for this analysis.' });
  y = writeInsightList('Skills Worth Strengthening', skillGaps.length ? skillGaps : missingSkills, y, { emptyText: 'No skill gaps were returned for this analysis.' });
  writeInsightList('Recommended Next Steps', recommendations, y, { numbered: true, emptyText: 'No recommendations were returned for this analysis.' });

  const totalPages = doc.internal.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.35);
    doc.line(MARGIN, FOOTER_Y - 4, PAGE_WIDTH - MARGIN, FOOTER_Y - 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(`Generated ${generatedDate}  ·  SkillLens`, MARGIN, FOOTER_Y + 2);
    doc.text(`Page ${page} of ${totalPages}`, PAGE_WIDTH - MARGIN, FOOTER_Y + 2, { align: 'right' });
  }

  const safeName = (asText(data.file_name) || 'Resume').replace(/\.pdf$/i, '').replace(/[^a-z0-9_-]+/gi, '_');
  const reportUrl = URL.createObjectURL(doc.output('blob'));
  const downloadLink = document.createElement('a');
  downloadLink.href = reportUrl;
  downloadLink.download = `SkillLens_Career_Report_${safeName}.pdf`;
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(reportUrl), 1000);
}

export default createCareerReport;