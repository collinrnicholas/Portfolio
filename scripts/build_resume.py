#!/usr/bin/env python3
"""Build the two-page public resume with ReportLab; no network or AI calls.

Run with an existing Python runtime containing reportlab and pypdf:
  python3 scripts/build_resume.py

Professional facts and dates: LinkedIn Profile.pdf exported 2026-10-17, pages 1-5.
Project descriptions: verified public PM Toolkit, BidPacket and Arclo Pro pages;
Loupe README and local implementation, explicitly labeled in development.
The source export is not copied into this public repository. No private contact
details, provider credentials, unsupported Persado metrics or old placeholders.
"""
from pathlib import Path
import argparse
import os
import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    KeepTogether, HRFlowable,
)
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, default=ROOT / 'Collin_Nicholas_Resume.pdf')
args = parser.parse_args()

# Match the live portfolio palette without introducing a second brand palette.
site = (ROOT / 'index.html').read_text()
def token(name, fallback):
    match = re.search(r'--' + re.escape(name) + r':\s*(#[0-9A-Fa-f]{6})', site)
    return colors.HexColor(match.group(1) if match else fallback)

INK = token('ink', '#111118')
NAVY = token('accent', '#1A3C6E')
MUTED = token('muted', '#6B6B78')
RULE = colors.HexColor('#D7DEE8')

font_dir = Path(os.environ.get('RESUME_FONT_DIR', '/System/Library/Fonts/Supplemental'))
regular, bold, italic = (font_dir / name for name in ('Arial.ttf', 'Arial Bold.ttf', 'Arial Italic.ttf'))
if all(font.exists() for font in (regular, bold, italic)):
    for name, filename in [('Resume', regular), ('Resume-Bold', bold), ('Resume-Italic', italic)]:
        pdfmetrics.registerFont(TTFont(name, str(filename)))
    pdfmetrics.registerFontFamily('Resume', normal='Resume', bold='Resume-Bold', italic='Resume-Italic', boldItalic='Resume-Bold')
    FONT, BOLD = 'Resume', 'Resume-Bold'
else:
    FONT, BOLD = 'Helvetica', 'Helvetica-Bold'

WIDTH, HEIGHT = letter
MARGIN = 43
CONTENT = WIDTH - MARGIN * 2
styles = {
    'name': ParagraphStyle('name', fontName=BOLD, fontSize=25, leading=29, textColor=INK, spaceAfter=5),
    'headline': ParagraphStyle('headline', fontName=BOLD, fontSize=13.5, leading=18, textColor=NAVY, spaceAfter=6),
    'contact': ParagraphStyle('contact', fontName=FONT, fontSize=9.3, leading=13.2, textColor=MUTED, spaceAfter=4),
    'summary': ParagraphStyle('summary', fontName=FONT, fontSize=10.5, leading=14.4, textColor=INK, spaceAfter=8),
    'skills': ParagraphStyle('skills', fontName=FONT, fontSize=9.7, leading=13.4, textColor=INK, spaceAfter=2),
    'section': ParagraphStyle('section', fontName=BOLD, fontSize=10.2, leading=14, textColor=NAVY, spaceBefore=13, spaceAfter=6),
    'company': ParagraphStyle('company', fontName=BOLD, fontSize=11.6, leading=15, textColor=INK, spaceAfter=1),
    'role': ParagraphStyle('role', fontName=BOLD, fontSize=10.5, leading=14, textColor=INK),
    'date': ParagraphStyle('date', fontName=FONT, fontSize=9.6, leading=14, textColor=MUTED, alignment=2),
    'bullet': ParagraphStyle('bullet', fontName=FONT, fontSize=10.35, leading=14, textColor=INK,
                             leftIndent=10, firstLineIndent=0, bulletIndent=0, spaceAfter=5),
    'compact': ParagraphStyle('compact', fontName=FONT, fontSize=9.8, leading=13.1, textColor=INK,
                             leftIndent=10, bulletIndent=0, spaceAfter=4),
    'small': ParagraphStyle('small', fontName=FONT, fontSize=9.3, leading=12.5, textColor=INK, spaceAfter=4),
}

story = []
def p(text, kind='summary'):
    return Paragraph(text, styles[kind])

def section(title):
    story.append(p(title.upper(), 'section'))
    story.append(HRFlowable(width='100%', thickness=0.65, color=RULE, spaceAfter=7))

def role(title, dates, company=None, compact=False):
    items = []
    if company:
        items.append(p(escape(company), 'company'))
    # Platypus frames inset their content by six points on each side.
    row = Table([[p(escape(title), 'role'), p(escape(dates), 'date')]],
                colWidths=[CONTENT - 12 - 140, 140], hAlign='LEFT')
    row.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    items.extend([row, Spacer(1, 5 if not compact else 3)])
    story.append(KeepTogether(items))

def bullet(text, compact=False):
    style = styles['compact'] if compact else styles['bullet']
    story.append(Paragraph(escape(text), style, bulletText='-'))

def gap(height=7):
    story.append(Spacer(1, height))

story.extend([
    p('COLLIN NICHOLAS', 'name'),
    p('Director of Product at Persado', 'headline'),
    p('Annandale, VA &nbsp; | &nbsp; <link href="mailto:Collin.R.Nicholas@gmail.com" color="#1A3C6E">Collin.R.Nicholas@gmail.com</link>', 'contact'),
    p('<link href="https://collinnicholas.com" color="#1A3C6E">collinnicholas.com</link> &nbsp; | &nbsp; <link href="https://linkedin.com/in/collinnicholas" color="#1A3C6E">linkedin.com/in/collinnicholas</link>', 'contact'),
    Spacer(1, 9),
    p('Product leader building AI products and the systems that demonstrate their commercial value. '
      'Leads growth and retention product at Persado, connecting agentic acquisition workflows, '
      'experiment-driven customer ROI and product design. Background spans enterprise SaaS, '
      'platform integrations, responsible AI and hands-on product development.'),
    p('<b>Focus:</b> AI product strategy | Growth and retention | Agentic workflows | Customer value realization', 'skills'),
    p('Roadmaps and monetization | Product design | Enterprise platforms | Responsible AI | AI-assisted engineering', 'skills'),
])

section('Experience')
role('Director of Product', 'Aug 2026 - Present', 'Persado')
bullet('Own the growth and retention product portfolio for enterprise financial services; lead the product design function.')
bullet('Lead Market Scan, an AI asset-intelligence product that audits live and planned marketing content for conversion performance and regulatory compliance, then prioritizes optimization opportunities.')
bullet('Designed and built an agentic prospecting engine on Market Scan to identify ICP accounts, benchmark marketing assets and generate evidence-backed outreach; rolling out across the U.S. banking market.')
bullet('Own the ROI & Value Dashboard, turning real experiment outcomes into dollar-denominated customer value delivered monthly and used in Customer Success QBRs and renewal motions.')
gap()

role('Senior Product Manager', 'Jul 2025 - Aug 2026', 'Employ Inc.')
bullet('Shipped a five-feature AI screening suite that generated $30K ARR and reached 14 enterprise customers within three months of launch.')
bullet('Launched the company\'s first AI trust and integrity initiative with a vibe-coded MVP, generating 300+ registrations and 20-40 inbound demo requests at launch.')
bullet('Independently authored, tested and merged 16 production pull requests into the Lever ATS and Pillar AI Interview Intelligence codebases.')
bullet('Revamped AI matching with human-in-the-loop prompting, custom matching logic and a transparency layer; deployed as a revenue-generating job add-on across 23,000 SMB customers.')
bullet('Built and launched the in-app AI Marketplace with GTM and Revenue teams, supporting internal enablement and customer awareness.')
bullet('Led IBM WatsonX.Gov responsible AI governance, including bias detection, accuracy oversight and enterprise AI security inquiries.')
bullet('Saved a $330K multi-year enterprise renewal over six-plus months following a complex post-acquisition integration failure.')

story.append(PageBreak())
section('Experience continued')
role('Product Manager', 'Mar 2021 - Jul 2025', 'Jobvite')
bullet('Owned Candidate Texting across 2,300+ organizations and 18,000 users; drove 36% YoY growth in customer activity and 10% YoY SMS volume growth.')
bullet('Led a nine-month NextGen UI transformation across 1,500 enterprise customers, including a three-wave rollout, cross-functional leadership alignment and an Early Adopter program.')
bullet('Architected the first cross-product shared service across three ATS platforms with VONQ and LinkedIn, generating $1.76M ARR in its first year.')
bullet('Led AI solution direction, Talent Fit rollout and vendor evaluation across Jobvite, Lever and JazzHR; partnered on AI voice/chat screening with structured dossier handoff into the ATS.')
gap(5)

role('Progressive product and technical roles', 'Mar 2015 - Mar 2021', 'MicroStrategy')
role('Product Owner, HyperIntelligence Mobile', 'May 2020 - Mar 2021', compact=True)
bullet('Owned the iOS/iPad product roadmap and backlog; partnered with product, sales and IT to incorporate market-driven features.', compact=True)
role('Principal Consultant', 'Jan 2020 - May 2020', compact=True)
bullet('Led enterprise advisory and production implementation work, resolving complex platform issues and identifying follow-on opportunities.', compact=True)
role('Principal Technical Program Manager', 'Jan 2018 - Jan 2020', compact=True)
bullet('Generated $31M in pipeline in 18 months; scaled the program to 400+ customers and grew and managed a team of six.', compact=True)
bullet('Developed global methodology and training delivered to 500+ consultants, and strategic roadmaps for C-level audiences.', compact=True)
story.extend([
    p('<b>Manager, Technical Support</b> &nbsp; | &nbsp; Feb 2017 - Dec 2017', 'small'),
    p('<b>Advanced Product Support</b> &nbsp; | &nbsp; Jul 2016 - Feb 2017', 'small'),
    p('<b>Technical Support Engineer</b> &nbsp; | &nbsp; Mar 2015 - Jul 2016', 'small'),
])
gap(5)
role('Product Support Engineer', 'Jul 2012 - Mar 2015', 'FICO', compact=True)
bullet('Supported customers through server migrations, recovery, quality assurance and technical documentation.', compact=True)

section('Selected independent projects')
story.extend([
    p('<b><link href="https://thepmtoolkit.app" color="#1A3C6E">The PM Toolkit</link></b> - Product discovery, cited research and connected planning artifacts.', 'small'),
    p('<b><link href="https://bidpacket.co" color="#1A3C6E">BidPacket</link></b> - Construction bid prep: summaries, materials checklists and proposal drafts.', 'small'),
    p('<b><link href="https://arclo.pro" color="#1A3C6E">Arclo Pro</link></b> - Websites and ongoing SEO for local businesses, with search-performance reporting.', 'small'),
    p('<b>Loupe</b> <i>(in development)</i> - Browser session capture, UX review and implementation briefs for AI coding agents.', 'small'),
])

section('Education')
story.extend([
    p('<b>Central Connecticut State University</b> &nbsp; | &nbsp; Aug 2007 - Dec 2010', 'small'),
    p('Bachelor of Science - Mechanical Engineering / Mechanical Technology', 'small'),
])

def page_chrome(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFont(BOLD, 9)
        canvas.setFillColor(NAVY)
        canvas.drawString(MARGIN + 6, HEIGHT - 30, 'COLLIN NICHOLAS')
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.6)
    canvas.line(MARGIN + 6, 32, WIDTH - MARGIN - 6, 32)
    canvas.setFont(FONT, 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN + 6, 20, 'Collin Nicholas | Director of Product')
    canvas.drawRightString(WIDTH - MARGIN - 6, 20, f'{doc.page} / 2')
    canvas.restoreState()

args.output.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(args.output), pagesize=letter, rightMargin=MARGIN, leftMargin=MARGIN,
                        topMargin=40, bottomMargin=43, title='Collin Nicholas - Director of Product',
                        author='Collin Nicholas', subject='Product leadership, AI, growth and retention',
                        pageCompression=1)
doc.build(story, onFirstPage=page_chrome, onLaterPages=page_chrome)
reader = PdfReader(args.output)
if len(reader.pages) != 2:
    raise RuntimeError(f'Expected exactly 2 pages, got {len(reader.pages)}. Review layout before publication.')
text = '\n'.join(page.extract_text() or '' for page in reader.pages)
for required in ('Persado', 'Aug 2026 - Present', '$30K', '$1.76M', 'Loupe', 'in development', 'FICO'):
    if required not in text:
        raise RuntimeError(f'Missing expected resume content: {required}')
for forbidden in ('[ADD ', '571.', 'July 2025 - Present', 'March 2021 - Present'):
    if forbidden in text:
        raise RuntimeError(f'Stale or private resume content: {forbidden}')
print(f'Wrote {args.output} | {len(reader.pages)} pages | {args.output.stat().st_size:,} bytes')
