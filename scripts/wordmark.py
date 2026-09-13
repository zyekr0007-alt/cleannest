"""One-time vector asset generation from the existing Ultima font (fonttools)."""
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from pathlib import Path
root = Path(__file__).resolve().parent.parent
font = TTFont(root / 'assets/fonts/Ultima.ttf')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
pen = SVGPathPen(glyphs)
x = 0
for char in 'CleanNest':
    name = cmap[ord(char)]
    glyphs[name].draw(TransformPen(pen, (1, 0, 0, -1, x, 800)))
    x += font['hmtx'][name][0] - 25
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 0 {x+65} 1050"><title>CleanNest</title><path fill="#0B4364" d="{pen.getCommands()}"/></svg>\n'
(root / 'assets/img/wordmark.svg').write_text(svg)
