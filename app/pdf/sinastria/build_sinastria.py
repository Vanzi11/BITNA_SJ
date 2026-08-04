#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bitna Saju — Gerador de PDF de Sinastria (gunghap) · D28
Um só gerador para os DOIS produtos de sinastria; o que muda é o TEMA (cor + textos
de apresentação), escolhido por `tipoRelacao`:
    - amorosa    -> Sinastria Amorosa      · Seal Red    #B22222
    - societaria -> Sinastria Profissional · Matte Bronze #A68B67
O tom do TEXTO (afetivo vs. profissional) já vem pronto do prompt relatorios/prompts/sinastria.md;
aqui só diagramamos. Estrutura de páginas idêntica entre os dois tipos (D28).

Uso: python build_sinastria.py entrada.json saida.pdf
entrada.json = {
  tipoRelacao, pessoa1:{nome,nascimento,pilares,mestreDoDia,elementos,forcaDoMestre,yongsin,...},
  pessoa2:{...}, analiseMotor:{score,harmoniaElemental}, relatorio: str (markdown do LLM)
}
Fontes reutilizadas de ../premium_v5/fonts (Instrument Serif, Crimson Pro, Inter).
Hanja: TTF embutida do SO; se faltar, degrada sem quebrar.
"""
import sys, os, io, re, json, math
from datetime import date
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader, PdfWriter

W, H = A4
HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, '..', 'premium_v5', 'fonts')
LOGO_PATH = os.path.join(HERE, '..', '..', '..', 'empresa', 'marca', 'logo', 'logo_hero_branco.png')

# ---------- paleta base (Livraria de Seul) ----------
IVORY    = HexColor('#f7f3ea')
INK      = HexColor('#2b2540')
BODY_C   = HexColor('#3a3324')
MUTED    = HexColor('#8a7f6a')
HAIRLINE = HexColor('#c9bfa8')
GOLD     = HexColor('#b58b3a')
COR_ELEM = {'Madeira': HexColor('#4a6b46'), 'Fogo': HexColor('#a03a2d'),
            'Terra': HexColor('#b58b3a'), 'Metal': HexColor('#8a7f6a'), 'Água': HexColor('#3b5a7a')}
ELEM_CH = {'Madeira': '木', 'Fogo': '火', 'Terra': '土', 'Metal': '金', 'Água': '水'}
ELEM_ORDER = ['Madeira', 'Fogo', 'Terra', 'Metal', 'Água']

# ---------- TEMA por tipo de relação (D28) ----------
THEME = {
    'amorosa': {
        'accent': HexColor('#B22222'),      # Seal Red
        'accent_soft': HexColor('#e7c6c1'),
        'eyebrow': 'SINASTRIA AMOROSA',
        'titulo': 'Sinastria Amorosa',
        'subtitulo': 'Saju de Casal',
        'pergunta': 'Como funciona a relação de vocês?',
        'selo': '宮合',           # gunghap
        'resumo_titulo': '✦ Vocês dois em 4 linhas',
    },
    'societaria': {
        'accent': HexColor('#A68B67'),      # Matte Bronze
        'accent_soft': HexColor('#e2d6c4'),
        'eyebrow': 'SINASTRIA PROFISSIONAL',
        'titulo': 'Sinastria Profissional',
        'subtitulo': 'Sociedade e Parcerias',
        'pergunta': 'Como funciona a parceria de vocês?',
        'selo': '宮合',
        'resumo_titulo': '✦ Vocês dois em 4 linhas',
    },
}
def tema(dados):
    return THEME.get(dados.get('tipoRelacao'), THEME['amorosa'])

# ---------- fontes ----------
def _reg(name, fname):
    try:
        pdfmetrics.registerFont(TTFont(name, os.path.join(FONT_DIR, fname))); return True
    except Exception:
        return False
HAS_DISPLAY = _reg('Display', 'InstrumentSerif-Regular.ttf') and _reg('Display-It', 'InstrumentSerif-Italic.ttf')
_reg('Sans', 'Inter-Regular.ttf'); _reg('Sans-It', 'Inter-Italic.ttf')
DISPLAY = 'Display' if HAS_DISPLAY else 'Times-Roman'
DISPLAY_IT = 'Display-It' if HAS_DISPLAY else 'Times-Italic'
SANS = 'Sans' if 'Sans' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
# Corpo em Times (built-in): bold/itálico garantidos para o markdown do LLM.
BODY_F, BODY_B, BODY_I = 'Times-Roman', 'Times-Bold', 'Times-Italic'

CJK = None
for _p, _i in [('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc', 1),
               ('C:/Windows/Fonts/malgun.ttf', None),
               ('/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf', None),
               ('/System/Library/Fonts/PingFang.ttc', 0)]:
    if os.path.exists(_p):
        try:
            pdfmetrics.registerFont(TTFont('CJK', _p) if _i is None else TTFont('CJK', _p, subfontIndex=_i))
            CJK = 'CJK'; break
        except Exception:
            pass

CJK_RE = re.compile(r'[ᄀ-ᇿ　-ヿ㄰-㆏一-鿿가-힯]')
HANGUL_HANJA = {'갑':'甲','을':'乙','병':'丙','정':'丁','무':'戊','기':'己','경':'庚','신':'辛','임':'壬','계':'癸',
                '자':'子','축':'丑','인':'寅','묘':'卯','진':'辰','사':'巳','오':'午','미':'未','유':'酉','술':'戌','해':'亥'}
def _h2h(t): return ''.join(HANGUL_HANJA.get(c, c) for c in t)
def limpar_cjk(t): return re.sub(r'\(\s*\)', '', CJK_RE.sub('', t)).replace('  ', ' ').strip()

# ---------- helpers de dados ----------
def hanja_de(mestre):
    m = re.search(r'\((.)\)', mestre or '')
    return m.group(1) if m else ''
def nome_mestre(mestre):
    return (mestre or '').split(' (')[0]
def elem_mestre(mestre):
    return (mestre or '').split('— ')[-1].split(' ')[0] if '—' in (mestre or '') else ''
def dominante(p):
    d = (p.get('elementos') or {}).get('dominantes') or []
    return d[0] if d else '—'
def animal_dia(p):
    return ((p.get('pilares') or {}).get('dia') or {}).get('animal', '—')
def forca(p):
    return (p.get('forcaDoMestre') or {}).get('nivel', '—')

GERA = {'Madeira': 'Fogo', 'Fogo': 'Terra', 'Terra': 'Metal', 'Metal': 'Água', 'Água': 'Madeira'}
CONTROLA = {'Madeira': 'Terra', 'Terra': 'Água', 'Água': 'Fogo', 'Fogo': 'Metal', 'Metal': 'Madeira'}
def relacao_elemental(e1, e2):
    if not e1 or not e2 or e1 == '—' or e2 == '—':
        return 'complementaridade a descobrir'
    if e1 == e2:
        return 'mesmo elemento — reconhecimento e conforto'
    if GERA.get(e1) == e2:
        return f'{e1} gera {e2} — um alimenta o outro'
    if GERA.get(e2) == e1:
        return f'{e2} gera {e1} — um alimenta o outro'
    if CONTROLA.get(e1) == e2:
        return f'{e1} molda {e2} — tensão que dá forma'
    if CONTROLA.get(e2) == e1:
        return f'{e2} molda {e1} — tensão que dá forma'
    return 'dinâmica de troca entre os elementos'

# ---------- desenho base ----------
def fundo(c):
    c.setFillColor(IVORY); c.rect(0, 0, W, H, stroke=0, fill=1)
def rastreado(t): return ' '.join(list(t))
def hairline(c, y, larg, x=None, cor=None):
    x = x if x is not None else W/2 - larg/2
    c.setStrokeColor(cor or HAIRLINE); c.setLineWidth(0.7); c.line(x, y, x + larg, y)
def SW(t, f, s): return pdfmetrics.stringWidth(t, f, s)

def draw_misto(c, x, y, texto, fonte, tam, cor, align='l'):
    texto = _h2h(texto)
    if CJK is None: texto = limpar_cjk(texto)
    runs, cur, is_cjk = [], '', None
    for ch in texto:
        e = bool(CJK_RE.match(ch))
        if is_cjk is None or e == is_cjk: cur += ch; is_cjk = e
        else: runs.append((is_cjk, cur)); cur, is_cjk = ch, e
    if cur: runs.append((is_cjk, cur))
    def wd(e, t): return SW(t, CJK if (e and CJK) else fonte, tam)
    total = sum(wd(e, t) for e, t in runs)
    if align == 'c': x -= total/2
    elif align == 'r': x -= total
    c.setFillColor(cor)
    for e, t in runs:
        f = CJK if (e and CJK) else fonte
        c.setFont(f, tam); c.drawString(x, y, t); x += wd(e, t)
    return total

def quebrar(texto, fonte, tam, max_w):
    linhas, atual = [], ''
    for p in texto.split(' '):
        teste = (atual + ' ' + p).strip()
        if SW(teste, fonte, tam) <= max_w or not atual: atual = teste
        else: linhas.append(atual); atual = p
    if atual: linhas.append(atual)
    return linhas

def selo(c, cx, cy, lado, cor, texto):
    c.setFillColor(cor)
    c.roundRect(cx-lado/2, cy-lado/2, lado, lado, 4, stroke=0, fill=1)
    c.setStrokeColor(IVORY); c.setLineWidth(0.7)
    c.roundRect(cx-lado/2+3, cy-lado/2+3, lado-6, lado-6, 3, stroke=1, fill=0)
    if CJK:
        c.setFillColor(IVORY); c.setFont(CJK, lado*0.30)
        c.drawCentredString(cx, cy+lado*0.06, texto[:2])
        if len(texto) > 2:
            c.drawCentredString(cx, cy-lado*0.30, texto[2:4])

def desenhar_logo(c, cx, cy, larg):
    try:
        ir = ImageReader(LOGO_PATH); iw, ih = ir.getSize(); h = larg*ih/iw
        c.drawImage(ir, cx-larg/2, cy-h/2, larg, h,
                    mask=[245, 255, 245, 255, 245, 255], preserveAspectRatio=True)
    except Exception:
        pass

PAG = {'n': 0}
def numero(c, th, mostrar=True):
    PAG['n'] += 1
    if mostrar and PAG['n'] > 1:
        c.setFillColor(MUTED); c.setFont(SANS, 8)
        c.drawCentredString(W/2, 40, f"— {PAG['n']} —")

# ---------- páginas ----------
def pagina_capa(c, dados, th):
    fundo(c)
    p1, p2 = dados['pessoa1'], dados['pessoa2']
    desenhar_logo(c, W/2, H-140, 250)
    hairline(c, H-232, 66, cor=th['accent'])
    c.setFillColor(th['accent']); c.setFont(SANS, 9)
    c.drawCentredString(W/2, H-256, rastreado(th['eyebrow']))
    c.setFillColor(INK); c.setFont(DISPLAY_IT, 34)
    c.drawCentredString(W/2, H-300, th['titulo'])
    c.setFillColor(MUTED); c.setFont(BODY_I, 13)
    c.drawCentredString(W/2, H-324, th['subtitulo'])
    # nomes das duas pessoas
    c.setFillColor(BODY_C); c.setFont(DISPLAY, 20)
    c.drawCentredString(W/2, 322, p1.get('nome', 'Pessoa 1'))
    c.setFillColor(th['accent']); c.setFont(BODY_I, 15)
    c.drawCentredString(W/2, 296, 'e')
    c.setFillColor(BODY_C); c.setFont(DISPLAY, 20)
    c.drawCentredString(W/2, 268, p2.get('nome', 'Pessoa 2'))
    selo(c, W/2, 196, 40, th['accent'], th['selo'])
    c.setFillColor(MUTED); c.setFont(BODY_I, 11)
    c.drawCentredString(W/2, 150, th['pergunta'])
    c.setFillColor(MUTED); c.setFont(BODY_I, 10)
    c.drawCentredString(W/2, 92, '"Não é sobre prever o futuro de vocês — é sobre entender como vocês funcionam juntos."')
    numero(c, th, mostrar=False); c.showPage()

def card_pessoa(c, x, w, p, th):
    """Cartão-identidade de uma pessoa. Todo o conteúdo cabe DENTRO da moldura."""
    y_top = H - 210; alt = 396
    c.setStrokeColor(HAIRLINE); c.setLineWidth(0.8)
    c.roundRect(x, y_top - alt, w, alt, 6, stroke=1, fill=0)
    cx = x + w/2
    c.setFillColor(BODY_C); c.setFont(DISPLAY, 15)
    for i, ln in enumerate(quebrar(p.get('nome', ''), DISPLAY, 15, w-24)[:2]):
        c.drawCentredString(cx, y_top-26 - i*17, ln)
    hj = hanja_de(p.get('mestreDoDia', ''))
    elem = elem_mestre(p.get('mestreDoDia', ''))
    if CJK and hj:
        c.setFillColor(COR_ELEM.get(elem, INK)); c.setFont(CJK, 100)
        c.drawCentredString(cx, y_top-168, hj)
    c.setFillColor(th['accent']); c.setFont(SANS, 7.5)
    c.drawCentredString(cx, y_top-206, rastreado('MESTRE DO DIA'))
    c.setFillColor(INK); c.setFont(DISPLAY, 15)
    c.drawCentredString(cx, y_top-226, nome_mestre(p.get('mestreDoDia', '')) + ' · ' + elem)
    hairline(c, y_top-244, w-72, x=x+36, cor=HexColor('#e3ddcd'))
    linhas = [('Força', forca(p)), ('Elemento dominante', dominante(p)), ('Animal do dia', animal_dia(p))]
    yy = y_top-268
    for rot, val in linhas:
        c.setFillColor(MUTED); c.setFont(SANS, 7)
        c.drawCentredString(cx, yy, rastreado(rot.upper()))
        c.setFillColor(BODY_C); c.setFont(BODY_F, 11.5)
        c.drawCentredString(cx, yy-14, str(val)); yy -= 36

def pagina_quem(c, dados, th):
    fundo(c)
    c.setFillColor(th['accent']); c.setFont(SANS, 8.5)
    c.drawCentredString(W/2, H-96, rastreado('QUEM É CADA UM'))
    c.setFillColor(INK); c.setFont(DISPLAY_IT, 23)
    c.drawCentredString(W/2, H-128, 'os dois mapas, lado a lado')
    hairline(c, H-146, 60, cor=GOLD)
    gap = 24; w = (W - 2*92 - gap)/2
    card_pessoa(c, 92, w, dados['pessoa1'], th)
    card_pessoa(c, 92+w+gap, w, dados['pessoa2'], th)
    c.setFillColor(MUTED); c.setFont(BODY_I, 10.5)
    c.drawCentredString(W/2, 96, 'Cada mapa é um retrato de temperamento — a leitura a dois nasce do encontro dos dois.')
    numero(c, th); c.showPage()

def _cab(c, th, eyebrow, titulo):
    c.setFillColor(th['accent']); c.setFont(SANS, 8.5)
    c.drawCentredString(W/2, H-96, rastreado(eyebrow))
    c.setFillColor(INK); c.setFont(DISPLAY_IT, 23)
    c.drawCentredString(W/2, H-128, titulo)
    hairline(c, H-146, 60, cor=GOLD)

def yongsin_els(p):
    y = p.get('yongsin') or {}
    return [e for e in [y.get('elementoPrincipal'), y.get('elementoSecundario')] if e]

def supre(pA, pB):
    """pB supre pA quando o elemento-Mestre de pB é justamente o que falta a pA (yongsin)."""
    return elem_mestre(pB.get('mestreDoDia', '')) in yongsin_els(pA)

def seta(c, x1, y1, x2, y2, cor, dash=None, r0=24, r1=28, lw=1.3):
    ang = math.atan2(y2-y1, x2-x1)
    sx, sy = x1+r0*math.cos(ang), y1+r0*math.sin(ang)
    ex, ey = x2-r1*math.cos(ang), y2-r1*math.sin(ang)
    c.setStrokeColor(cor); c.setLineWidth(lw)
    if dash: c.setDash(dash)
    c.line(sx, sy, ex, ey); c.setDash()
    ah = 6.5; c.setFillColor(cor)
    p = c.beginPath(); p.moveTo(ex, ey)
    p.lineTo(ex-ah*math.cos(ang-0.42), ey-ah*math.sin(ang-0.42))
    p.lineTo(ex-ah*math.cos(ang+0.42), ey-ah*math.sin(ang+0.42))
    p.close(); c.drawPath(p, stroke=0, fill=1)

def _no_elemento(c, x, y, e, r, destaque=None):
    c.setFillColor(COR_ELEM.get(e, INK)); c.circle(x, y, r, stroke=0, fill=1)
    if destaque:
        c.setStrokeColor(destaque); c.setLineWidth(2.4); c.circle(x, y, r+4, stroke=1, fill=0)
    if CJK:
        c.setFillColor(IVORY); c.setFont(CJK, r*0.9)
        c.drawCentredString(x, y-r*0.34, ELEM_CH.get(e, ''))

def pagina_ciclo(c, dados, th):
    fundo(c)
    p1, p2 = dados['pessoa1'], dados['pessoa2']
    e1, e2 = elem_mestre(p1.get('mestreDoDia', '')), elem_mestre(p2.get('mestreDoDia', ''))
    _cab(c, th, 'O CICLO DOS ELEMENTOS', 'como as energias de vocês se relacionam')
    cx, cy, R = W/2, H/2+34, 132
    pos = {}
    for i, e in enumerate(ELEM_ORDER):
        a = math.radians(90 - i*72); pos[e] = (cx+R*math.cos(a), cy+R*math.sin(a))
    for i in range(5):  # controle (estrela) — pontilhado, ao fundo
        a, b = ELEM_ORDER[i], ELEM_ORDER[(i+2) % 5]
        seta(c, *pos[a], *pos[b], HexColor('#d8cdb4'), dash=[2, 3], r0=22, r1=26, lw=0.8)
    for i in range(5):  # geração (pentágono) — dourado
        a, b = ELEM_ORDER[i], ELEM_ORDER[(i+1) % 5]
        seta(c, *pos[a], *pos[b], GOLD, r0=22, r1=26, lw=1.4)
    for e in ELEM_ORDER:
        x, y = pos[e]; big = e in (e1, e2)
        _no_elemento(c, x, y, e, 25 if big else 20, destaque=th['accent'] if big else None)
        a = math.atan2(y-cy, x-cx)
        c.setFillColor(BODY_C); c.setFont(SANS, 8)
        c.drawCentredString(x+34*math.cos(a), y+34*math.sin(a)-3, e)
    # legenda
    lx = W/2-150
    c.setStrokeColor(GOLD); c.setLineWidth(1.4); c.line(lx, 150, lx+22, 150)
    c.setFillColor(MUTED); c.setFont(SANS, 8); c.drawString(lx+28, 147, 'geração (um alimenta o outro)')
    c.setStrokeColor(HexColor('#d8cdb4')); c.setLineWidth(0.8); c.setDash([2, 3]); c.line(lx, 134, lx+22, 134); c.setDash()
    c.setFillColor(MUTED); c.setFont(SANS, 8); c.drawString(lx+28, 131, 'controle (um molda o outro)')
    # caption com os elementos de cada um + relação
    c.setFillColor(BODY_C); c.setFont(BODY_I, 12)
    cap = f"{p1.get('nome','').split()[0]} é {e1} · {p2.get('nome','').split()[0]} é {e2} — {relacao_elemental(e1, e2)}."
    for i, ln in enumerate(quebrar(cap, BODY_I, 12, W-200)):
        c.drawCentredString(W/2, 104 - i*17, ln)
    numero(c, th); c.showPage()

def pagina_complementaridade(c, dados, th):
    fundo(c)
    p1, p2 = dados['pessoa1'], dados['pessoa2']
    n1, n2 = p1.get('nome', '').split()[0], p2.get('nome', '').split()[0]
    e1, e2 = elem_mestre(p1.get('mestreDoDia', '')), elem_mestre(p2.get('mestreDoDia', ''))
    _cab(c, th, 'O QUE UM TRAZ AO OUTRO', 'a troca entre os dois mapas')
    yN = H/2+70
    xA, xB = W/2-130, W/2+130
    _no_elemento(c, xA, yN, e1, 38)
    _no_elemento(c, xB, yN, e2, 38)
    c.setFillColor(BODY_C); c.setFont(DISPLAY, 13)
    c.drawCentredString(xA, yN-60, n1); c.drawCentredString(xB, yN-60, n2)
    c.setFillColor(MUTED); c.setFont(SANS, 8)
    c.drawCentredString(xA, yN-74, rastreado(e1.upper())); c.drawCentredString(xB, yN-74, rastreado(e2.upper()))
    # setas de suprimento (quando o Mestre de um é o que falta ao outro)
    b_supre_a = supre(p1, p2)   # p2 traz a p1
    a_supre_b = supre(p2, p1)   # p1 traz a p2
    if a_supre_b:
        seta(c, xA, yN+18, xB, yN+18, th['accent'], r0=40, r1=44, lw=1.6)
    if b_supre_a:
        seta(c, xB, yN-18, xA, yN-18, th['accent'], r0=40, r1=44, lw=1.6)
    if not (a_supre_b or b_supre_a):
        c.setStrokeColor(HAIRLINE); c.setLineWidth(1.0); c.setDash([2, 3])
        c.line(xA+42, yN, xB-42, yN); c.setDash()
    # caption interpretativo
    if a_supre_b and b_supre_a:
        cap = (f"Encaixe raro: {n1} traz o {e1} que falta a {n2}, e {n2} traz o {e2} que falta a {n1}. "
               f"Cada um é o elemento que completa o outro.")
    elif a_supre_b:
        cap = f"{n1} traz o {e1} que falta a {n2} — um complemento que fortalece a dupla."
    elif b_supre_a:
        cap = f"{n2} traz o {e2} que falta a {n1} — um complemento que fortalece a dupla."
    else:
        falta = ', '.join(sorted(set(yongsin_els(p1) + yongsin_els(p2)))) or 'movimento'
        cap = (f"Vocês partem do mesmo elemento e compartilham também a mesma falta ({falta}). "
               f"A energia que falta aos dois vem de fora — buscada juntos, de propósito.")
    c.setFillColor(BODY_C); c.setFont(BODY_I, 12)
    for i, ln in enumerate(quebrar(cap, BODY_I, 12, W-190)):
        c.drawCentredString(W/2, yN-120 - i*18, ln)
    # termômetro no rodapé
    score = int((dados.get('analiseMotor') or {}).get('score') or 0)
    bx, bw, by = W/2-160, 320, 168
    c.setFillColor(th['accent']); c.setFont(SANS, 8)
    c.drawCentredString(W/2, by+44, rastreado('O TERMÔMETRO DA RELAÇÃO'))
    c.setStrokeColor(HAIRLINE); c.setFillColor(HexColor('#efe9db')); c.setLineWidth(0.8)
    c.roundRect(bx, by, bw, 15, 7.5, stroke=1, fill=1)
    c.setFillColor(th['accent']); c.roundRect(bx, by, max(15, bw*score/100), 15, 7.5, stroke=0, fill=1)
    c.setFillColor(INK); c.setFont(DISPLAY, 27); c.drawCentredString(W/2, by-40, f'{score}')
    c.setFillColor(MUTED); c.setFont(SANS, 8); c.drawCentredString(W/2, by-53, rastreado('DE 100'))
    c.setFillColor(BODY_C); c.setFont(BODY_I, 11)
    msg = ('Faixa média não é incompatibilidade — é uma relação que cresce com consciência.'
           if score < 70 else 'Uma base forte, que ainda assim floresce com atenção e diálogo.')
    for i, ln in enumerate(quebrar(msg, BODY_I, 11, 380)):
        c.drawCentredString(W/2, by-80 - i*16, ln)
    numero(c, th); c.showPage()

# ---------- corpo narrativo ----------
def extrair_resumo_nota(md):
    blocos = re.split(r'(?m)^##\s+', md.strip())
    preamb, blocos = blocos[0], blocos[1:]
    corpo, resumo_pares, nota = [], [], ''
    for b in blocos:
        titulo, _, resto = b.partition('\n')
        tl = titulo.lower()
        if 'resumo' in tl or 'bolso' in tl or '4 linhas' in tl or 'quatro linhas' in tl or 'vocês dois' in tl:
            for ln in resto.split('\n'):
                m = re.match(r'\*\*(.+?):\*\*\s*(.+)', ln.strip())
                if m: resumo_pares.append((m.group(1).strip(), m.group(2).strip()))
        elif 'nota final' in tl or tl.strip() == 'nota':
            nota = resto.strip()
        else:
            corpo.append('## ' + b)
    corpo_md = (preamb + '\n\n' if preamb.strip() else '') + '\n\n'.join(corpo)
    return corpo_md, resumo_pares, nota

def md_flowables(md, th):
    est = {
        'h2': ParagraphStyle('h2', fontName=DISPLAY, fontSize=17, leading=21, textColor=th['accent'],
                             spaceBefore=20, spaceAfter=7, keepWithNext=1),
        'h3': ParagraphStyle('h3', fontName=DISPLAY, fontSize=13.5, leading=17, textColor=INK,
                             spaceBefore=13, spaceAfter=4, keepWithNext=1),
        'p': ParagraphStyle('p', fontName=BODY_F, fontSize=12.5, leading=19.5, textColor=BODY_C,
                            alignment=TA_JUSTIFY, spaceAfter=9),
    }
    def inline(t):
        t = t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        t = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', t)
        t = re.sub(r'\*([^*]+)\*', r'<i>\1</i>', t)
        if CJK: t = CJK_RE.sub(lambda m: f'<font name="CJK">{m.group(0)}</font>', t)
        else: t = limpar_cjk(t)
        return t
    flow = []
    for b in re.split(r'\n\s*\n', md.strip()):
        b = b.strip()
        if not b or b.startswith('> '): continue
        if b.startswith('### '): flow.append(Paragraph(inline(b[4:]), est['h3'])); continue
        if b.startswith('## '): flow.append(Paragraph(inline(b[3:]), est['h2'])); continue
        if b.startswith('# '): continue
        flow.append(Paragraph(inline(b), est['p']))
    return flow

def pdf_corpo(md, th, nome_rodape):
    buf = io.BytesIO()
    def fundo_pg(canv, doc):
        canv.saveState(); fundo(canv)
        canv.setFillColor(MUTED); canv.setFont(SANS, 7.5)
        canv.drawCentredString(W/2, 52, rastreado('BITNA SAJU') + ('   ·   ' + nome_rodape if nome_rodape else ''))
        canv.setFillColor(MUTED); canv.setFont(SANS, 8)
        canv.drawCentredString(W/2, 38, f"— {PAG['n'] + doc.page} —")
        canv.restoreState()
    doc = BaseDocTemplate(buf, pagesize=A4, leftMargin=92, rightMargin=92, topMargin=84, bottomMargin=76)
    doc.addPageTemplates([PageTemplate(id='corpo', frames=[Frame(92, 76, W-184, H-160, id='f')], onPage=fundo_pg)])
    doc.build(md_flowables(md, th))
    buf.seek(0)
    return buf

def linha_editorial(c, x, y, larg, label, valor, th):
    c.setFillColor(th['accent']); c.setFont(SANS, 8)
    c.drawString(x, y, rastreado(label.upper()))
    c.setFillColor(INK); c.setFont(BODY_I, 12.5)
    yy = y - 17
    for ln in quebrar(valor, BODY_I, 12.5, larg):
        c.drawString(x, yy, ln); yy -= 17
    c.setStrokeColor(HexColor('#e3ddcd')); c.setLineWidth(0.5); c.line(x, yy-2, x+larg, yy-2)
    return yy - 22

def pagina_resumo(c, dados, th, resumo_pares):
    fundo(c)
    c.setFillColor(th['accent']); c.setFont(SANS, 8.5)
    c.drawCentredString(W/2, H-120, rastreado('EM POUCAS LINHAS'))
    c.setFillColor(INK); c.setFont(DISPLAY_IT, 24)
    c.drawCentredString(W/2, H-152, th['resumo_titulo'])
    hairline(c, H-168, 60, cor=GOLD)
    y = H-214
    for label, valor in resumo_pares[:5]:
        y = linha_editorial(c, 110, y, W-220, label, valor, th)
    numero(c, th); c.showPage()

def pagina_nota(c, dados, th, nota):
    fundo(c)
    desenhar_logo(c, W/2, H-150, 150)
    nota = nota or ('Este relatório é uma ferramenta de autoconhecimento a dois baseada na tradição coreana '
                    'do gunghap. Nenhum mapa determina uma relação: ela é construída pelas escolhas, pelo '
                    'diálogo e pelo cuidado de ambos.')
    if CJK: nota = CJK_RE.sub(lambda m: f'<font name="CJK">{m.group(0)}</font>', nota)
    else: nota = limpar_cjk(nota)
    c.setFillColor(th['accent']); c.setFont(SANS, 8.5)
    c.drawCentredString(W/2, H-250, rastreado('NOTA'))
    est = ParagraphStyle('nota', fontName=BODY_I, fontSize=12.5, leading=20, textColor=INK, alignment=TA_CENTER)
    p = Paragraph(nota, est); wp, hp = p.wrap(W-260, 300); p.drawOn(c, 130, H-286-hp)
    selo(c, W/2, H-286-hp-46, 34, th['accent'], th['selo'])
    numero(c, th); c.showPage()

# ---------- montagem ----------
def gerar(entrada, saida):
    PAG['n'] = 0
    dados = json.load(open(entrada, encoding='utf-8'))
    th = tema(dados)
    nome_rodape = (dados['pessoa1'].get('nome', '').split()[0] + ' & ' +
                   dados['pessoa2'].get('nome', '').split()[0]) if dados.get('pessoa1') else ''
    fixo = io.BytesIO()
    c = rl_canvas.Canvas(fixo, pagesize=A4)
    c.setTitle(f"{th['titulo']} — Bitna Saju")
    pagina_capa(c, dados, th)
    pagina_quem(c, dados, th)
    pagina_ciclo(c, dados, th)
    pagina_complementaridade(c, dados, th)
    c.save(); fixo.seek(0)
    partes = [PdfReader(fixo)]

    relatorio = dados.get('relatorio') or ''
    resumo_pares, nota = [], ''
    if relatorio:
        corpo_md, resumo_pares, nota = extrair_resumo_nota(relatorio)
        parte = PdfReader(pdf_corpo(corpo_md, th, nome_rodape))
        partes.append(parte); PAG['n'] += len(parte.pages)

    cauda = io.BytesIO()
    c2 = rl_canvas.Canvas(cauda, pagesize=A4)
    if resumo_pares:
        pagina_resumo(c2, dados, th, resumo_pares)
    pagina_nota(c2, dados, th, nota)
    c2.save(); cauda.seek(0)
    partes.append(PdfReader(cauda))

    w = PdfWriter()
    for parte in partes:
        for pg in parte.pages: w.add_page(pg)
    with open(saida, 'wb') as f: w.write(f)
    print(f'ok: {saida} ({sum(len(p.pages) for p in partes)} páginas) — tipo {dados.get("tipoRelacao")}')

if __name__ == '__main__':
    gerar(sys.argv[1], sys.argv[2])
