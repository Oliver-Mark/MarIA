"""Gera PDF da fonte Markdown da arquitetura, sem dependências do backend."""
import re
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'output/pdf/arquitetura-maria-fase02.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyPT', fontName='Helvetica', fontSize=10, leading=14, spaceAfter=8, textColor=colors.HexColor('#243c50')))
styles.add(ParagraphStyle(name='TitlePT', fontName='Helvetica-Bold',fontSize=20,leading=25,spaceAfter=14,textColor=colors.HexColor('#146eac')))
styles.add(ParagraphStyle(name='H2PT', fontName='Helvetica-Bold',fontSize=14,leading=18,spaceBefore=6,spaceAfter=10,textColor=colors.HexColor('#146eac')))
styles.add(ParagraphStyle(name='H3PT', fontName='Helvetica-Bold',fontSize=11,leading=15,spaceBefore=8,spaceAfter=8))

def diagram():
    d = Drawing(470, 190)
    boxes = [(5,130,130,40,'Sistema Clínica A'),(170,130,130,40,'Sistema Clínica B'),(335,130,130,40,'Portal do paciente'),
             (110,70,250,40,'API MarIA / permissões / autorizações'),(45,5,180,40,'Registros no PostgreSQL'),(265,5,160,40,'Auditoria de acesso')]
    for x,y,w,h,label in boxes:
        d.add(Rect(x,y,w,h,rx=5,fillColor=colors.HexColor('#eef4fa'),strokeColor=colors.HexColor('#146eac')))
        d.add(String(x+w/2,y+h/2-3,label,textAnchor='middle',fontSize=9,fontName='Helvetica'))
    for x1,y1,x2,y2 in [(70,130,160,110),(235,130,235,110),(400,130,320,110),(175,70,135,45),(290,70,345,45)]:
        d.add(Line(x1,y1,x2,y2,strokeColor=colors.HexColor('#146eac')))
        d.add(Polygon([x2,y2,x2-4,y2+7,x2+4,y2+7],fillColor=colors.HexColor('#146eac')))
    return d

story=[]
source = (ROOT/'docs/arquitetura-maria.md').read_text(encoding='utf-8')
source = re.sub(r'(?m)^(#{1,3} .+|---|\[DIAGRAMA\])$', r'\n\n\1\n\n', source)
for block in re.split(r'\n\s*\n', source):
    block=block.strip()
    if not block: continue
    if block=='---': story.append(PageBreak()); continue
    if block=='[DIAGRAMA]': story.append(diagram()); continue
    if block.startswith('# '): style='TitlePT'; block=block[2:]
    elif block.startswith('## '): style='H2PT'; block=block[3:]
    elif block.startswith('### '): style='H3PT'; block=block[4:]
    else: style='BodyPT'
    for line in block.splitlines():
        line=escape(line)
        if line.startswith('- '): line='&#8226; '+line[2:]
        story.append(Paragraph(line,styles[style]))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#146eac'));canvas.line(42, A4[1]-32,A4[0]-42,A4[1]-32)
    canvas.setFont('Helvetica',8);canvas.setFillColor(colors.HexColor('#506b81'))
    canvas.drawString(42,24,'MarIA | Arquitetura do HUB | v1.1 | 11/10/2026')
    canvas.drawRightString(A4[0]-42,24,str(doc.page));canvas.restoreState()

SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=45,bottomMargin=42,
                  title='MarIA - Arquitetura do HUB de integração',author='Equipe MarIA').build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT)
