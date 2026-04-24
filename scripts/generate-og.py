"""
Gera public/og-image.png (1200x630) para Open Graph.
Layout: fundo dark + faixa amarela à esquerda com logo, headline grande à direita,
CTA pill com telefone na base. Cores da marca.
Rode: python scripts/generate-og.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og-image.png"
LOGO = ROOT / "public" / "image" / "logo-chaveiro.png"

W, H = 1200, 630
DARK = (26, 26, 26)
YELLOW = (255, 215, 0)
RED = (220, 38, 38)
WHITE = (255, 255, 255)
MUTED = (170, 170, 170)


def find_font(candidates, size):
    win_fonts = Path("C:/Windows/Fonts")
    for name in candidates:
        p = win_fonts / name
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def draw_pill(draw, xy, fill, radius=None):
    x1, y1, x2, y2 = xy
    if radius is None:
        radius = (y2 - y1) // 2
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def main():
    img = Image.new("RGB", (W, H), DARK)
    draw = ImageDraw.Draw(img, "RGBA")

    # Faixa amarela à esquerda
    BAND_W = 380
    draw.rectangle((0, 0, BAND_W, H), fill=YELLOW)

    # Logo no centro da faixa amarela
    if LOGO.exists():
        logo = Image.open(LOGO).convert("RGBA")
        logo_size = 260
        logo.thumbnail((logo_size, logo_size), Image.LANCZOS)
        lx = (BAND_W - logo.width) // 2
        ly = (H - logo.height) // 2 - 40
        img.paste(logo, (lx, ly), logo)

        # Tagline embaixo do logo
        tag_font = find_font(["seguibd.ttf", "arialbd.ttf"], 18)
        tag = "AUTOMÓVEIS • EMPRESA • RESIDÊNCIA"
        tw = draw.textlength(tag, font=tag_font)
        draw.text(((BAND_W - tw) // 2, ly + logo.height + 24), tag, fill=DARK, font=tag_font)

    # Conteúdo direito
    RIGHT_X = BAND_W + 60

    # Pill "24H" no topo
    pill_font = find_font(["seguibd.ttf", "arialbd.ttf"], 22)
    pill_text = "24h • EMERGÊNCIA"
    pill_pad = 22
    pill_tw = draw.textlength(pill_text, font=pill_font)
    pill_box = (RIGHT_X, 70, RIGHT_X + pill_tw + pill_pad * 2, 70 + 50)
    draw_pill(draw, pill_box, fill=RED)
    draw.text((pill_box[0] + pill_pad, pill_box[1] + 12), pill_text, fill=WHITE, font=pill_font)

    # Headline principal (2 linhas)
    title_font = find_font(["seguibd.ttf", "arialbd.ttf"], 72)
    draw.text((RIGHT_X, 160), "Chaveiro 24h", fill=WHITE, font=title_font)
    draw.text((RIGHT_X, 245), "em Araçatuba/SP", fill=YELLOW, font=title_font)

    # Subtítulo
    sub_font = find_font(["segoeui.ttf", "arial.ttf"], 28)
    sub_lines = [
        "Abertura de veículos, residências e empresas.",
        "Cópia de chaves, fechaduras digitais e codificação.",
    ]
    sy = 360
    for line in sub_lines:
        draw.text((RIGHT_X, sy), line, fill=MUTED, font=sub_font)
        sy += 38

    # CTA telefone — pill amarela embaixo
    cta_font = find_font(["seguibd.ttf", "arialbd.ttf"], 32)
    cta_text = "📞  (18) 99102-0078"
    cta_tw = draw.textlength(cta_text, font=cta_font)
    cta_pad = 32
    cta_box = (RIGHT_X, H - 110, RIGHT_X + cta_tw + cta_pad * 2, H - 40)
    draw_pill(draw, cta_box, fill=YELLOW)
    draw.text((cta_box[0] + cta_pad, cta_box[1] + 18), cta_text, fill=DARK, font=cta_font)

    img.save(OUT, "PNG", optimize=True)
    print(f"Gerado: {OUT} ({OUT.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
