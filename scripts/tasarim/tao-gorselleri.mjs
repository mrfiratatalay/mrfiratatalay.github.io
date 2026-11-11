#!/usr/bin/env node
/**
 * Tao: Cozy Focus Timer ürün sayfasının görsellerini üretir.
 *
 * Sayfadaki her uygulama görüntüsü gerçek bir ekran görüntüsünden kesilir; hiçbiri
 * elle çizilmez. Kaynak, uygulamanın ekran görüntüsü arşividir (MAC, IPHONE, IPAD ve
 * IKON klasörleri). Arşiv bu depoda değildir; yeri `--kaynak` ile verilir, verilmezse
 * `~/Desktop/Developer/My-Apps/01/screenshot` aranır.
 *
 *   node scripts/tasarim/tao-gorselleri.mjs            hepsini üretir
 *   node scripts/tasarim/tao-gorselleri.mjs room clocks  yalnızca adı geçen grupları
 *
 * Çıktı `public/studywithme/images/` altına yazılır ve depoya eklenir, çünkü yayın
 * sırasında arşiv yoktur. Odanın duvar ve zemin renkleri ile kenar ölçüleri
 * `src/components/study-with-me/room-measures.json` dosyasına yazılır; sayfa odayı
 * ekranın kenarına kadar bu renklerle uzatır.
 *
 * İkondan gelen çizimler (köşedeki güneş ve ay, kalem, sayfanın sonundaki arkadaş)
 * bu betikle değil `scripts/tasarim/tao-ikon-parcalari.py` ile üretilir.
 *
 * Kurallar (arşivdeki README'lerden):
 * - Dükkandan kaldırılan yedi pencere (yağmur, kar, gün batımı, kiraz çiçeği, sis,
 *   gece okyanus, rüya gecesi) kullanılmaz.
 * - Mac karelerinin başlık çubuğunda eski ad yazar; başlık çubuğu her zaman kesilir.
 * - Hiçbir eşya kenardan kesilmez; yalnızca duvar ve zemin kenara taşabilir.
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const sourceFlag = args.indexOf('--kaynak');
const source = sourceFlag >= 0
  ? path.resolve(args[sourceFlag + 1])
  : path.join(os.homedir(), 'Desktop/Developer/My-Apps/01/screenshot');
const wanted = args.filter((arg, index) => !arg.startsWith('--') && (sourceFlag < 0 || index !== sourceFlag + 1));
const outDir = path.join(root, 'public/studywithme/images');
const measuresFile = path.join(root, 'src/components/study-with-me/room-measures.json');

/** Her grup kendi ölçülerini buraya ekler; sonunda tek dosyaya yazılır. */
const measures = {};
const report = [];

// ---------------------------------------------------------------- yardımcılar

/** Kareyi sRGB'ye çevirip ham piksel olarak okur (Mac kareleri Display P3'tür). */
async function read(relative) {
  const { data, info } = await sharp(path.join(source, relative))
    .toColourspace('srgb')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

const image = (frame) => sharp(frame.data, { raw: { width: frame.width, height: frame.height, channels: 4 } });

function pixel(frame, x, y) {
  const i = (y * frame.width + x) * 4;
  return [frame.data[i], frame.data[i + 1], frame.data[i + 2]];
}

const hex = (rgb) => '#' + rgb.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('');
const distance = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));

/** Bir dikdörtgenin ortalama rengi. */
function average(frame, x0, y0, x1, y1) {
  const sum = [0, 0, 0];
  let count = 0;
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const rgb = pixel(frame, x, y);
      sum[0] += rgb[0]; sum[1] += rgb[1]; sum[2] += rgb[2];
      count += 1;
    }
  }
  return sum.map((value) => value / count);
}

/**
 * Dikdörtgenin içini, her satırda sol ve sağ komşu pikselin arasını doldurarak boyar.
 * Düz zeminin üstündeki uygulama düğmelerini kaldırmak için kullanılır.
 */
function paintOver(frame, x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y += 1) {
    const left = average(frame, x0 - 6, y, x0 - 1, y);
    const right = average(frame, x1 + 1, y, x1 + 6, y);
    for (let x = x0; x <= x1; x += 1) {
      const t = (x - x0) / (x1 - x0);
      const i = (y * frame.width + x) * 4;
      for (let c = 0; c < 3; c += 1) frame.data[i + c] = Math.round(left[c] + (right[c] - left[c]) * t);
    }
  }
}

/** Satır aralığında, satırın referans renginden belirgin biçimde ayrılan piksellerin kutusu. */
function contentBox(frame, x0, y0, x1, y1, referenceX) {
  const box = { x0: Infinity, y0: Infinity, x1: -1, y1: -1 };
  for (let y = y0; y <= y1; y += 1) {
    const reference = pixel(frame, referenceX, y);
    for (let x = x0; x <= x1; x += 1) {
      if (distance(pixel(frame, x, y), reference) > 26) {
        box.x0 = Math.min(box.x0, x); box.x1 = Math.max(box.x1, x);
        box.y0 = Math.min(box.y0, y); box.y1 = Math.max(box.y1, y);
      }
    }
  }
  return box.x1 < 0 ? null : box;
}

async function write(pipeline, name, { quality = 82, alphaQuality = 100 } = {}) {
  const file = path.join(outDir, name);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const info = await pipeline.webp({ quality, alphaQuality, effort: 6, smartSubsample: true }).toFile(file);
  report.push(`${name.padEnd(38)} ${String(info.width).padStart(4)}×${String(info.height).padEnd(4)} ${(info.size / 1024).toFixed(1).padStart(6)} KB`);
  return file;
}

/** Yazılmış bir görselin pikselleri: renkler tarayıcının göreceği hâlinden ölçülür. */
async function reread(name) {
  const { data, info } = await sharp(path.join(outDir, name)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/**
 * Bir kenar boyunca renk durakları: `linear-gradient` içine doğrudan yazılabilir.
 * Düz yüzeylerde birkaç örnek alır; çizgilerde (ani renk değişimi) sert durak koyar.
 */
function edgeStops(frame, { vertical, at }) {
  const length = vertical ? frame.height : frame.width;
  const sample = (i) => {
    const colours = [];
    for (let offset = 0; offset < 3; offset += 1) colours.push(vertical ? pixel(frame, at + offset, i) : pixel(frame, i, at + offset));
    return colours[0].map((_, c) => (colours[0][c] + colours[1][c] + colours[2][c]) / 3);
  };
  // Önce kenarı düz parçalara ayır. Her piksel parçanın ilk rengiyle karşılaştırılır;
  // komşusuyla karşılaştırılsaydı yumuşak kenarlı bir çizgi duvara karışırdı.
  const runs = [];
  let start = 0;
  let reference = sample(0);
  for (let i = 1; i <= length; i += 1) {
    if (i === length || distance(sample(i), reference) > 10) {
      runs.push([start, i - 1]);
      start = i;
      if (i < length) reference = sample(i);
    }
  }
  // Bir iki piksellik geçişler atılır; iki durak arasını tarayıcı kendisi yumuşatır.
  const solid = runs.filter(([a, b]) => b - a >= 4);
  const stops = [];
  for (const [a, b] of solid) {
    const span = b - a;
    const points = span > 200 ? 6 : 2;
    const middle = sample(Math.round((a + b) / 2));
    for (let p = 0; p < points; p += 1) {
      const inset = Math.min(4, Math.floor(span / 4));
      const i = Math.round(a + inset + ((span - inset * 2) * p) / (points - 1));
      const position = p === 0 ? a : p === points - 1 ? b + 1 : i;
      stops.push(`${hex(points === 2 ? middle : sample(i))} ${((position / length) * 100).toFixed(3)}%`);
    }
  }
  return stops.join(', ');
}

/**
 * Bir kenar boyunca ilk çizginin başladığı yer, kenarın uzunluğuna oranla.
 * Sol kenarda zemin çizgisini, üst kenarda köşe çizgisini bulur.
 */
function lineStart(frame, { vertical, at }) {
  const length = vertical ? frame.height : frame.width;
  const get = (i) => (vertical ? pixel(frame, at, i) : pixel(frame, i, at));
  const wall = get(8);
  for (let i = 8; i < length; i += 1) {
    if (distance(get(i), wall) > 40) return Number((i / length).toFixed(5));
  }
  throw new Error('Kenarda çizgi bulunamadı.');
}

// ---------------------------------------------------------------- oda (sayfanın tepesi)

/**
 * Sayfanın tepesindeki oda. Üç ışık hâli aynı kadrajla kesilir ki ışık değişirken
 * hiçbir şey yerinden oynamasın. Üçünde de sayaç aynı rakamı gösteren kareler seçildi.
 */
async function room() {
  const lights = ['day', 'evening', 'night'];

  // Geniş ekran: Mac penceresi. Başlık çubuğu ve alttaki düğmeler çıkarılır.
  // Pencerenin yuvarlak alt köşeleri 1590. satırda başlar; kesim onun üstünde biter.
  const wide = { top: 72, bottom: 1588 };
  const wideSources = ['MAC/02-oda/06-odak-sabah-2.png', 'MAC/02-oda/08-odak-aksam-2.png', 'MAC/02-oda/09-odak-gece-2.png'];
  measures.wide = { width: 2608, height: wide.bottom - wide.top, light: {} };
  for (const [index, light] of lights.entries()) {
    const frame = await read(wideSources[index]);
    const controls = contentBox(frame, 700, 1480, 1900, 1602, 600);
    if (!controls) throw new Error('Mac karesinde alttaki düğmeler bulunamadı.');
    paintOver(frame, controls.x0 - 18, controls.y0 - 10, controls.x1 + 18, wide.bottom);
    const crop = image(frame).extract({ left: 0, top: wide.top, width: frame.width, height: wide.bottom - wide.top }).removeAlpha();
    await write(crop.clone(), `room/wide-${light}.webp`);
    await write(crop.clone().resize({ width: 1304 }), `room/wide-${light}-1304.webp`);
    const written = await reread(`room/wide-${light}.webp`);
    measures.wide.horizon = lineStart(written, { vertical: true, at: 2 });
    measures.wide.corner = lineStart(written, { vertical: false, at: 2 });
    measures.wide.light[light] = {
      leftEdge: edgeStops(written, { vertical: true, at: 1 }),
      topEdge: edgeStops(written, { vertical: false, at: 1 }),
      wall: hex(average(written, 40, 40, 400, 300)),
      sideWall: hex(average(written, 2200, 40, 2560, 600)),
      floor: hex(average(written, 40, 1100, 500, 1500)),
      line: hex(average(written, 100, 899, 400, 902)),
    };
  }

  // Telefon: iPhone karesi. Üstteki saat çubuğu ve alttaki düğmeler kadrajın dışında kalır.
  const tall = { top: 250, bottom: 2370 };
  const tallSources = ['IPHONE/01-oda/06-odak-sabah-3.png', 'IPHONE/01-oda/08-odak-aksam-3.png', 'IPHONE/01-oda/09-odak-gece-3.png'];
  measures.tall = { width: 1206, height: tall.bottom - tall.top, light: {} };
  for (const [index, light] of lights.entries()) {
    const frame = await read(tallSources[index]);
    const crop = image(frame).extract({ left: 0, top: tall.top, width: frame.width, height: tall.bottom - tall.top }).removeAlpha();
    await write(crop.clone(), `room/tall-${light}.webp`);
    await write(crop.clone().resize({ width: 804 }), `room/tall-${light}-804.webp`);
    const written = await reread(`room/tall-${light}.webp`);
    measures.tall.corner = lineStart(written, { vertical: false, at: 2 });
    measures.tall.light[light] = {
      topEdge: edgeStops(written, { vertical: false, at: 1 }),
      bottomEdge: edgeStops(written, { vertical: false, at: written.height - 4 }),
      wall: hex(average(written, 30, 30, 300, 200)),
      sideWall: hex(average(written, 900, 30, 1180, 600)),
      floor: hex(average(written, 10, 1700, 60, 2080)),
    };
  }
}

/**
 * Kesimin kenarında eşya kalmış mı? Kenardaki ince çerçeve tek renk değilse uyarır.
 * Saat ve pencere gibi sayfanın duvarına karışacak kesimler için kullanılır.
 */
function warnIfCut(frame, box, name) {
  const ring = [];
  for (let x = box.left; x < box.left + box.width; x += 3) {
    ring.push(pixel(frame, x, box.top + 2), pixel(frame, x, box.top + box.height - 3));
  }
  for (let y = box.top; y < box.top + box.height; y += 3) {
    ring.push(pixel(frame, box.left + 2, y), pixel(frame, box.left + box.width - 3, y));
  }
  const middle = [0, 1, 2].map((c) => ring.map((rgb) => rgb[c]).sort((a, b) => a - b)[ring.length >> 1]);
  const worst = Math.max(...ring.map((rgb) => distance(rgb, middle)));
  if (worst > 14) console.warn(`! ${name}: kesimin kenarında duvardan başka bir şey var (fark ${worst}).`);
  return middle;
}

/** Bir grup kesimin duvar renklerinin ortalaması: sayfadaki şeridin rengi bu olur. */
function sharedWall(colours) {
  return [0, 1, 2].map((c) => Math.round(colours.reduce((sum, rgb) => sum + rgb[c], 0) / colours.length));
}

/**
 * Kesimin duvarını ortak renge çeker. Kareler birkaç dakika arayla çekildiği için
 * duvarları iki üç ton oynar; fark kanal başına sabit bir sayı olarak eklenir, böylece
 * kesimler aynı şeridin üstünde yan yana durunca aralarında ton farkı kalmaz.
 */
function matchWall(pipeline, from, to) {
  return pipeline.linear([1, 1, 1], [to[0] - from[0], to[1] - from[1], to[2] - from[2]]);
}

// ---------------------------------------------------------------- bir oturum

/**
 * Bir oturumun beş ânı. Beşi de aynı kadrajla kesilir; sayfa aşağı indikçe üst üste
 * değişirler ve yalnızca arkadaş, sayaç ve ışık değişmiş görünür. Yan duvar kadraj dışıdır.
 */
async function story() {
  const box = { left: 480, top: 90, width: 1480, height: 1536 };
  const sources = [
    'MAC/02-oda/02-bos-ogle.png', // uyuyor, başlat düğmesi
    'MAC/02-oda/23-odak-gulumsuyor-net-2.png', // masada, gülümsüyor
    'MAC/02-oda/21-mola-gerinme-gunduz-3.png', // pencerede geriniyor
    'MAC/02-oda/08-odak-aksam-2.png', // akşam, lamba
    'MAC/02-oda/05-bos-gece.png', // gece, yatakta
  ];
  measures.story = { width: box.width, height: box.height };
  for (const [index, file] of sources.entries()) {
    const crop = image(await read(file)).extract(box);
    await write(crop.clone().resize({ width: 1184 }), `story/${index + 1}.webp`);
    await write(crop.clone().resize({ width: 740 }), `story/${index + 1}-740.webp`);
  }
}

// ---------------------------------------------------------------- görünümler

/** On altı hazır görünüm, ayakta ve arka planı ayrılmış. Hepsi aynı tuvalde, ayakları aynı hizada. */
async function looks() {
  const names = [
    'coquette', 'library', 'paris', 'school', 'bunny', 'strawberry', 'daisy', 'cat',
    'campus', 'gamer', 'explorer', 'detective', 'barista', 'sailor', 'pilot', 'painter',
  ];
  for (const [index, name] of names.entries()) {
    const file = `MAC/06-kiyafetler/ayakta/kesik/${String(index + 1).padStart(2, '0')}-${name}.png`;
    await write(sharp(path.join(source, file)).toColourspace('srgb'), `looks/${name}.webp`, { quality: 88 });
  }
  measures.looks = { width: 400, height: 540 };
}

// ---------------------------------------------------------------- süslenmiş odalar

/**
 * Stüdyodaki eşyalarla kurulmuş dört oda (akşam, odakta). Yan duvardaki eşya da
 * görünsün diye kadraj köşeyi içine alır. Dördünde de yalnızca satışta olan eşya var.
 */
async function rooms() {
  const box = { left: 300, top: 72, width: 2120, height: 1418 };
  const sources = {
    'rainy-city': 'MAC/05-premium-oda/03-aksam-2.png',
    'northern-lights': 'MAC/05-premium-oda/20-aksam-odak-acik-goz-2.png',
    'starry-night': 'MAC/05-premium-oda/02-aksam-2.png',
    'night-train': 'MAC/05-premium-oda/05-aksam-2.png',
  };
  measures.rooms = { width: box.width, height: box.height };
  for (const [name, file] of Object.entries(sources)) {
    const crop = image(await read(file)).extract(box);
    await write(crop.clone().resize({ width: 1500 }), `rooms/${name}.webp`);
    await write(crop.clone().resize({ width: 900 }), `rooms/${name}-900.webp`);
  }
}

// ---------------------------------------------------------------- saatler

/**
 * Yedi saat, akşam duvarında. Hepsi aynı kutuyla kesilir ki birbirlerine göre
 * boyları doğru kalsın. Kum saati başlık çubuğuna yakın durduğu için üstüne biraz
 * duvar eklenir (kenardaki satır yukarı doğru çoğaltılır).
 */
async function clocks() {
  const box = { left: 984, top: 72, width: 640, height: 380 };
  const extra = 44;
  // `07-saatler` klasöründeki karelerde son rakam değişirken yakalanmış, bulanık.
  // Aynı saatler süslenmiş odaların ikinci karelerinde net; kadrajda saatten başka şey yok.
  const sources = {
    ink: 'MAC/02-oda/08-odak-aksam-2.png',
    chalkboard: 'MAC/05-premium-oda/02-aksam-2.png',
    'flip-clock': 'MAC/05-premium-oda/03-aksam-2.png',
    'retro-digital': 'MAC/05-premium-oda/04-aksam-2.png',
    projection: 'MAC/05-premium-oda/05-aksam-2.png',
    hourglass: 'MAC/05-premium-oda/20-aksam-odak-acik-goz-2.png',
    ceramic: 'MAC/05-premium-oda/07-aksam-2.png',
  };
  const frames = [];
  for (const [name, file] of Object.entries(sources)) {
    const frame = await read(file);
    frames.push([name, frame, warnIfCut(frame, box, `saat ${name}`)]);
  }
  const wall = sharedWall(frames.map(([, , colour]) => colour));
  for (const [name, frame, colour] of frames) {
    const crop = matchWall(image(frame).extract(box).removeAlpha(), colour, wall).extend({ top: extra, extendWith: 'copy' });
    await write(crop, `clocks/${name}.webp`, { quality: 88 });
  }
  measures.clocks = { width: box.width, height: box.height + extra, wall: hex(wall) };
}

// ---------------------------------------------------------------- pencereler

/**
 * Satıştaki altı pencere, gece. iPad karelerinden kesilir, çünkü pencere en büyük
 * orada çizilir. (iPad karelerinin çoğu saat düzeltmesinden önce çekildi; o düzeltme
 * yalnızca duvardaki saati etkiler, pencereyi değil. Saatler bu yüzden Mac'ten alınır.)
 */
async function windows() {
  const box = { left: 60, top: 550, width: 640, height: 870 };
  const sources = {
    clear: 'IPAD/01-oda/09-odak-gece-2.png',
    'starry-night': 'IPAD/07-manzaralar/05-yildizli-gece.png',
    'rainy-city': 'IPAD/07-manzaralar/02-yagmurlu-sehir.png',
    thunderstorm: 'IPAD/07-manzaralar/08-firtina.png',
    'night-train': 'IPAD/07-manzaralar/09-gece-treni.png',
    'northern-lights': 'IPAD/07-manzaralar/10-kuzey-isiklari.png',
  };
  const frames = [];
  for (const [name, file] of Object.entries(sources)) {
    const frame = await read(file);
    frames.push([name, frame, warnIfCut(frame, box, `pencere ${name}`)]);
  }
  const wall = sharedWall(frames.map(([, , colour]) => colour));
  for (const [name, frame, colour] of frames) {
    const crop = matchWall(image(frame).extract(box).removeAlpha(), colour, wall).resize({ width: 480 });
    await write(crop, `windows/${name}.webp`, { quality: 88 });
  }
  measures.windows = { width: box.width, height: box.height, wall: hex(wall) };
}

// ---------------------------------------------------------------- defter

/** Defterin iki sayfası, iPhone'dan. Üstteki saat çubuğu ve kapatma işareti kadraj dışıdır. */
async function notebook() {
  const pages = {
    tasks: ['IPHONE/02-defter/01-gorevler.png', { left: 0, top: 325, width: 1206, height: 1235 }],
    record: ['IPHONE/10-app-store/kaynak/ekran/02-kayit.png', { left: 0, top: 325, width: 1206, height: 1705 }],
  };
  measures.notebook = {};
  for (const [name, [file, box]] of Object.entries(pages)) {
    await write(image(await read(file)).extract(box).resize({ width: 804 }), `notebook/${name}.webp`, { quality: 86 });
    const written = await reread(`notebook/${name}.webp`);
    measures.notebook[name] = { width: written.width, height: written.height };
    measures.notebook.paper = hex(average(written, 8, written.height - 40, 200, written.height - 8));
  }
}

// ---------------------------------------------------------------- cihazlar

/**
 * Üç cihaz, üç ayrı oda: cihazlar arasında eşitleme olmadığı için aynı odayı göstermezler.
 * Mac karesinin başlık çubuğu eski adı taşır; kesilir ve sayfada yeni adla yeniden çizilir.
 * iPad karesi saat düzeltmesinden sonra çekilenlerdendir.
 */
async function devices() {
  await write(sharp(path.join(source, 'IPHONE/10-app-store/kaynak/ekran/20-aurora-odak-2.png')).toColourspace('srgb').resize({ width: 603 }), 'devices/phone.webp', { quality: 84 });
  await write(sharp(path.join(source, 'IPAD/04-premium-oda/23-gunduz-odak-2.png')).toColourspace('srgb').resize({ width: 860 }), 'devices/pad.webp', { quality: 84 });

  const mac = await read('MAC/05-premium-oda/02-aksam-2.png');
  const bar = pixel(mac, 1304, 12);
  let barEnd = 0;
  for (let y = 12; y < 200; y += 1) {
    if (distance(pixel(mac, 1304, y), bar) > 10 && distance(pixel(mac, 1304, y + 3), bar) > 10) { barEnd = y; break; }
  }
  if (barEnd < 30) throw new Error('Mac karesinde başlık çubuğunun bittiği yer bulunamadı.');
  const body = { left: 0, top: barEnd + 1, width: mac.width, height: mac.height - barEnd - 1 };
  await write(image(mac).extract(body).resize({ width: 1500 }), 'devices/mac.webp', { quality: 84 });
  measures.devices = {
    macBar: hex(bar),
    macBarHeight: barEnd + 1,
    mac: { width: body.width, height: body.height },
    phone: { width: 1206, height: 2622 },
    pad: { width: 2064, height: 2752 },
  };
}

// ---------------------------------------------------------------- paylaşım görseli

/** Bağlantı paylaşılınca görünen 1200 × 630 görsel: gündüz odası, sola doğru biraz duvar eklenmiş. */
async function social() {
  const frame = await read('MAC/02-oda/06-odak-sabah-2.png');
  const controls = contentBox(frame, 700, 1480, 1900, 1602, 600);
  paintOver(frame, controls.x0 - 18, controls.y0 - 10, controls.x1 + 18, 1588);
  const widened = await image(frame)
    .extract({ left: 0, top: 72, width: frame.width, height: 1516 })
    .removeAlpha()
    .extend({ left: 330, extendWith: 'copy' })
    .png()
    .toBuffer();
  const file = path.join(outDir, 'social.jpg');
  const info = await sharp(widened).resize({ height: 630 }).extract({ left: 4, top: 0, width: 1200, height: 630 }).jpeg({ quality: 86, mozjpeg: true }).toFile(file);
  report.push(`${'social.jpg'.padEnd(38)} ${String(info.width).padStart(4)}×${String(info.height).padEnd(4)} ${(info.size / 1024).toFixed(1).padStart(6)} KB`);
}

// ---------------------------------------------------------------- çalıştır

const groups = { room, story, looks, rooms, clocks, windows, notebook, devices, social };

for (const [name, build] of Object.entries(groups)) {
  if (wanted.length > 0 && !wanted.includes(name)) continue;
  await build();
}

if (wanted.length === 0) {
  await fs.writeFile(measuresFile, JSON.stringify(measures, null, 2) + '\n');
} else {
  // Tek grup üretildiğinde öbür grupların ölçüleri korunur.
  let previous = {};
  try { previous = JSON.parse(await fs.readFile(measuresFile, 'utf8')); } catch { /* ilk çalıştırma */ }
  await fs.writeFile(measuresFile, JSON.stringify({ ...previous, ...measures }, null, 2) + '\n');
}

console.log(report.join('\n'));
console.log(`\n${report.length} görsel yazıldı: ${path.relative(root, outDir)}`);
