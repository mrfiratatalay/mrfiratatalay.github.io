# Finder masaüstü duvar kâğıtları

Bu tasarım için yerleşik `image_gen` aracıyla iki özgün raster görsel üretildi. Gündüz görseli oluşturulduktan sonra aynı kompozisyon, gece ışığıyla düzenlendi. WebP dosyaları kaynak PNG'lerden Sharp ile kalite 90 ayarında kodlandı; görüntü içeriği kodla değiştirilmedi.

- `finder-day.webp`: açık tema, sakin taş grisi ve kum beji manzara.
- `finder-night.webp`: koyu tema, aynı manzaranın kömür grisi ve koyu taupe görünümü.
- Kullanım: `src/styles/base.css`, 900px ve üzeri masaüstü görünümü.

## Gündüz üretim prompt'u

Use case: photorealistic-natural. Asset type: desktop wallpaper for a macOS/Finder-inspired personal portfolio website.
Generate a single exceptionally refined, photorealistic natural sand-dune landscape wallpaper in a wide 16:10 landscape composition, high resolution suitable for a Retina desktop. ONLY the landscape, no UI, no words, no logos, no frame, no computer, no device.
Scene: a serene expanse of smooth pale sand dunes in soft early morning light. One graceful large dune sweeps through the lower third, with just two or three quiet rolling dune silhouettes behind it. The upper half is a clean soft light stone-gray sky, subtly luminous, with a gentle neutral atmospheric transition. Distant dunes are subtle; absolutely no jagged mountains, rocks, trees, ocean, buildings, footprints, people or distracting foreground objects. Composition should feel real, spacious and calm, like a carefully composed high-end landscape photograph used on a MacBook desktop.
Palette: silver-gray sky, light warm stone, subdued sand beige, ivory dune highlights, soft taupe shadows. Neutral and sophisticated. Do not make it orange or gold; no blue, navy, purple, magenta or pink cast. Natural sand texture is fine and realistic, mostly smooth with restrained wind ripples near the lower edge. Soft diffuse morning light, minimal harsh contrast, no dramatic sun disk, no lens flare. Enough subtle sculptural depth to feel photographic, not an abstract blur or gradient. Generous calm negative space behind windows, crisp original photographic texture, elegant dune curves and coherent real lighting.

## Gece düzenleme prompt'u

Use case: lighting-weather. Edit target: the supplied neutral sand-dune desktop wallpaper. Create its matching DARK-MODE NIGHT version.
Preserve the exact landscape, camera position, framing, horizon, silhouettes, dune shapes, wind ripples and all spatial composition. Change only time of day, lighting and natural color tone.
Make this the same serene landscape at night, subtly illuminated by soft off-frame moonlight. Sky is deep neutral charcoal gray with a restrained smooth atmospheric glow at the horizon. Sand is dark warm taupe and graphite with faint silver-beige highlights following the original dune ridges. Shadows remain legible, detailed and softly separated; do not crush everything into pure black. High-end natural photographic realism, calm dark MacBook desktop wallpaper, wide16:10 composition same as input.
No blue, navy, purple, violet, magenta or orange cast. No moon disk, sun, stars, extra mountains, rocks, trees, objects, UI, words, logos, frames or computer. No altered terrain. Keep the natural photographic textures and give the night sky generous calm negative space.
