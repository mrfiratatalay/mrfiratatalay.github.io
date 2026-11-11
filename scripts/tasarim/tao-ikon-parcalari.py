#!/usr/bin/env python3
"""Tao: Cozy Focus Timer ürün sayfasındaki ikon çizimlerini üretir.

Çizimler elle yapılmaz: uygulama ikonunu çizen betik (`make_icon.py`) olduğu gibi
çalıştırılır ve hesapladığı şekiller parça parça yazdırılır. O betik bu depoda değildir;
uygulamanın ekran görüntüsü arşivindedir (`screenshot/IKON/kaynak/make_icon.py`).

    tao-ikon-parcalari.py <make_icon.py> light|dark <parça> > çıktı.svg

Parçalar ve sayfada gittikleri yer:

    sun            köşedeki güneş (dark: ay)   src/components/study-with-me/art/sun.svg, moon.svg
                                               ve public/studywithme/images/icon/ altına aynı adlarla
    friend-noeyes  kalemi tutan arkadaş, gözsüz public/studywithme/images/icon/friend-day.svg (light),
                                               friend-night.svg (dark)
    eyes           yalnızca gözler             src/components/study-with-me/art/eyes.svg
    pencil         kalem, yatay                public/studywithme/images/icon/pencil.svg
    friend         arkadaş, gözleriyle (sayfada kullanılmıyor; karşılaştırmak için)

Gözler ayrı çıkarılır, çünkü sayfada kırpılır ve imleci izlerler. İkon değişirse dört parça
da yeniden üretilmelidir; yoksa sayfanın sonundaki arkadaş ikondakinden farklı kalır.
"""
import io, sys, contextlib
gen, variant, part = sys.argv[1], sys.argv[2], sys.argv[3]
ns = {}
sys.argv = [gen, variant, "sage", "sun"]
with contextlib.redirect_stdout(io.StringIO()):
    exec(compile(open(gen).read(), gen, "exec"), ns)
g = type("G", (), ns)

if part == "eyes":
    pairs = "".join('<g class="eye"><g class="eye-lid">%s%s</g></g>' % (e.replace("<ellipse", '<ellipse class="eye-ball"'), l.replace("<ellipse", '<ellipse class="eye-light"')) for e, l in zip(g.eyes, g.lights))
    print('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 1024 928">%s</svg>' % pairs)
    sys.exit(0)

if part == "pencil":
    import math as _m
    deg = -_m.degrees(g.PEN_A)
    print(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 800 1000 170">
  <defs>
    <filter id="pb8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="pink" x="-3%" y="-3%" width="106%" height="106%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="9" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
  <g transform="rotate({deg:.2f} {g.PEN_E[0]} {g.PEN_E[1]})">
    <path d="{g.P_SIL}" fill="#3a2a12" opacity="0.38" filter="url(#pb8)" transform="translate(8 20)"/>
    <g filter="url(#pink)">
      <path d="{g.P_ERASER}" fill="#F29BA2"/><path d="{g.P_ERASER_LO}" fill="#E0808B" opacity="0.75"/>
      <path d="{g.P_FERRULE}" fill="#DAD3C8"/><path d="{g.P_FERRULE_LO}" fill="#B9B1A5" opacity="0.8"/>
      <path d="{g.P_BARREL}" fill="#F6C74F"/><path d="{g.P_TOP}" fill="#FBDD79"/><path d="{g.P_BOT}" fill="#E6AC3C"/>
      <path d="{g.P_WOOD}" fill="#F5DAB0"/><path d="{g.P_WOOD_LO}" fill="#E7C692" opacity="0.9"/>
      <path d="{g.P_LEAD}" fill="#2B2927"/>
      <path d="{g.P_FACETS}" fill="none" stroke="#C8912E" stroke-width="5" stroke-linecap="round"/>
      <path d="{g.P_SHINE}" fill="none" stroke="#FFF6CF" stroke-width="7" stroke-linecap="round" opacity="0.85"/>
      <g fill="none" stroke="{g.INK}" stroke-linecap="round" stroke-linejoin="round">
        <path d="{g.P_RIDGES}" stroke-width="6" opacity="0.55"/>
        <path d="{g.P_SEAMS}" stroke-width="10"/>
        <path d="{g.P_SCALLOP}" stroke-width="10"/>
        <path d="{g.P_SIL}" stroke-width="{g.W_PEN}"/>
      </g>
    </g>
  </g>
</svg>''')
    sys.exit(0)

if part == "sun":
    rays = "" if g.DARK else '<path d="%s" fill="none" stroke="%s" stroke-width="10" stroke-linecap="round"/>' % (g.SUN_RAYS, g.GRAPHITE)
    print(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <defs>
    <clipPath id="sunClip-{variant}"><path d="{g.SUN_DISC}"/></clipPath>
    <filter id="wax-{variant}" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="2" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
  <g filter="url(#wax-{variant})">
    <g clip-path="url(#sunClip-{variant})">
      <rect width="320" height="320" fill="{g.SUN_FILL}" opacity="0.80"/>
      <path d="{g.SUN_HATCH}" fill="none" stroke="{g.SUN_STROKE}" stroke-width="13" stroke-linecap="round" opacity="0.75"/>
    </g>
    <path d="{g.SUN_EDGE}" fill="none" stroke="{g.GRAPHITE}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    {rays}
  </g>
</svg>''')
else:
    eyes, lights, brows = "".join(g.eyes), "".join(g.lights), "".join('<path d="%s"/>' % b for b in g.brows)
    eye_svg = "" if part == "friend-noeyes" else '<g fill="%s">%s</g><g fill="%s" opacity="0.86">%s</g>' % (g.INK, eyes, g.B_LIGHT, lights)
    print(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 1024 928">
  <defs>
    <linearGradient id="mat" gradientUnits="userSpaceOnUse" x1="{g.LIGHT_PT[0]:.1f}" y1="{g.LIGHT_PT[1]:.1f}" x2="{g.SHADE_PT[0]:.1f}" y2="{g.SHADE_PT[1]:.1f}">
      <stop offset="0" stop-color="{g.B_LIGHT}" stop-opacity="0.75"/><stop offset="0.46" stop-color="{g.B_BASE}" stop-opacity="0"/><stop offset="1" stop-color="{g.B_SHADE}" stop-opacity="0.62"/>
    </linearGradient>
    <radialGradient id="glow" gradientUnits="userSpaceOnUse" cx="{g.LIGHT_PT[0]:.1f}" cy="{g.LIGHT_PT[1]:.1f}" r="{0.72 * g.U:.1f}">
      <stop offset="0" stop-color="{g.B_LIGHT}" stop-opacity="0.50"/><stop offset="0.48" stop-color="{g.B_LIGHT}" stop-opacity="0.12"/><stop offset="1" stop-color="{g.B_LIGHT}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="above"><path d="{g.CLIP_ABOVE}"/></clipPath>
    <clipPath id="bodyClip"><path d="{g.BODY}"/></clipPath>
    <clipPath id="penClip"><path d="{g.P_SIL}"/></clipPath>
    <filter id="b8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="b18" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="b26" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter>
    <filter id="ink" x="-3%" y="-3%" width="106%" height="106%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="9" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
  <g clip-path="url(#above)"><path d="{g.BODY}" fill="{g.SHADOW}" opacity="{g.SHADOW_O}" filter="url(#b18)" transform="translate(40 28)"/></g>
  <path d="{g.P_SIL}" fill="{g.SHADOW}" opacity="{g.SHADOW_O * 1.35:.2f}" filter="url(#b8)" transform="translate(12 24)"/>
  <g clip-path="url(#above)">
    <path d="{g.BODY}" fill="{g.B_BASE}"/>
    <path d="{g.BODY}" fill="url(#mat)"/>
    <path d="{g.BODY}" fill="url(#glow)"/>
    <g clip-path="url(#bodyClip)">
      <path d="{g.BODY}" fill="none" stroke="{g.B_SHADE}" stroke-width="70" opacity="0.55" filter="url(#b26)" transform="translate(-30 -22)"/>
      <path d="{g.P_SIL}" fill="#6B5A44" opacity="0.30" filter="url(#b18)" transform="translate(0 -22)"/>
    </g>
    <g fill="#F2AC98" opacity="0.50" filter="url(#b8)">{g.CHEEKS}</g>
    <g filter="url(#ink)">
      <path d="{g.OUTLINE}" fill="{g.INK}" fill-rule="evenodd"/>
      {eye_svg}
      <g fill="none" stroke="{g.INK}" stroke-width="{g.W_FACE:.1f}" stroke-linecap="round">{brows}</g>
      <path d="{g.MOUTH}" fill="none" stroke="{g.INK}" stroke-width="{g.W_FACE * 1.30:.1f}" stroke-linecap="round"/>
    </g>
  </g>
  <g filter="url(#ink)">
    <path d="{g.P_ERASER}" fill="#F29BA2"/><path d="{g.P_ERASER_LO}" fill="#E0808B" opacity="0.75"/>
    <path d="{g.P_FERRULE}" fill="#DAD3C8"/><path d="{g.P_FERRULE_LO}" fill="#B9B1A5" opacity="0.8"/>
    <path d="{g.P_BARREL}" fill="#F6C74F"/><path d="{g.P_TOP}" fill="#FBDD79"/><path d="{g.P_BOT}" fill="#E6AC3C"/>
    <path d="{g.P_WOOD}" fill="#F5DAB0"/><path d="{g.P_WOOD_LO}" fill="#E7C692" opacity="0.9"/>
    <path d="{g.P_LEAD}" fill="#2B2927"/>
    <path d="{g.P_FACETS}" fill="none" stroke="#C8912E" stroke-width="5" stroke-linecap="round"/>
    <path d="{g.P_SHINE}" fill="none" stroke="#FFF6CF" stroke-width="7" stroke-linecap="round" opacity="0.85"/>
    <g fill="none" stroke="{g.INK}" stroke-linecap="round" stroke-linejoin="round">
      <path d="{g.P_RIDGES}" stroke-width="6" opacity="0.55"/>
      <path d="{g.P_SEAMS}" stroke-width="10"/>
      <path d="{g.P_SCALLOP}" stroke-width="10"/>
      <path d="{g.P_SIL}" stroke-width="{g.W_PEN}"/>
    </g>
    <g clip-path="url(#penClip)" fill="#7A5514" opacity="0.38" filter="url(#b8)">{g.paw_shadow}</g>
    {g.paw_svg}
  </g>
</svg>''')
