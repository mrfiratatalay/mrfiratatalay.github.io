#!/usr/bin/env node
/**
 * Özgün duvar kağıtlarını üretir (gündüz ve gece). Tek seferlik tasarım betiği:
 *   node scripts/tasarim/duvar-kagitlari.mjs
 * Çıktı: public/wallpapers/*.webp
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = path.join(root, 'public', 'wallpapers');
mkdirSync(outDir, { recursive: true });

const W = 2560;
const H = 1600;

// Dalga çizgileri: soldan sağa akan yumuşak eğriler (üst kenar).
const WAVES = [
  'M-40 840 C 380 640 820 1000 1300 820 C 1760 650 2100 520 2600 650',
  'M-40 1000 C 460 830 900 1200 1400 1030 C 1840 880 2200 770 2600 870',
  'M-40 1170 C 540 990 1000 1350 1520 1190 C 1960 1050 2280 1020 2600 1090',
  'M-40 1360 C 620 1210 1160 1500 1700 1370 C 2100 1270 2380 1270 2600 1310',
];

const close = (d) => `${d} L2600 1700 L-40 1700 Z`;

function wallpaper(theme) {
  const light = theme === 'light';
  const sky = light
    ? ['#3f7bf2', '#6f9bff', '#a8b9ff', '#e8c6f0', '#ffd3bf']
    : ['#050820', '#0a1240', '#171552', '#2d1350', '#45144d'];
  const waves = light
    ? [
        ['#b5ccff', '#cbb9ff', '#ffd0e2'],
        ['#7aa0ff', '#9a85ff', '#f6a6cf'],
        ['#4a77f6', '#7558ec', '#e070ad'],
        ['#2a4fd4', '#4b33c0', '#b8478f'],
      ]
    : [
        ['#1d2b7a', '#2c2384', '#4a1d6e'],
        ['#2340b8', '#4a2bb0', '#8a2b86'],
        ['#2f5be6', '#6236d6', '#b83a95'],
        ['#1638b4', '#3a20a3', '#8c2675'],
      ];
  const highlight = light ? '#ffffff' : '#9fc1ff';
  const glowWarm = light ? '#fff2e2' : '#ff4f9a';
  const glowCool = light ? '#ffffff' : '#3d6bff';

  const waveLayers = WAVES.map((d, index) => {
    const [a, b, c] = waves[index];
    const blur = [10, 5, 2, 0][index];
    return `
      <linearGradient id="w${index}" x1="0" y1="0" x2="1" y2="0.2">
        <stop offset="0" stop-color="${a}"/>
        <stop offset="0.55" stop-color="${b}"/>
        <stop offset="1" stop-color="${c}"/>
      </linearGradient>
      <g ${blur ? `filter="url(#b${index})"` : ''}>
        <path d="${close(d)}" fill="url(#w${index})" fill-opacity="0.94"/>
        <path d="${close(d)}" fill="url(#shade)"/>
        <path d="${d}" fill="none" stroke="${highlight}" stroke-opacity="${light ? 0.22 : 0.16}" stroke-width="70" filter="url(#crest)"/>
        <path d="${d}" fill="none" stroke="${highlight}" stroke-opacity="${light ? 0.55 - index * 0.08 : 0.4 - index * 0.06}" stroke-width="${3 + index}" filter="url(#soft)"/>
      </g>`;
  }).join('');

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0.15" y2="1">
        ${sky.map((color, i) => `<stop offset="${i / (sky.length - 1)}" stop-color="${color}"/>`).join('')}
      </linearGradient>
      <radialGradient id="warm" cx="0.74" cy="0.6" r="0.5">
        <stop offset="0" stop-color="${glowWarm}" stop-opacity="${light ? 0.85 : 0.45}"/>
        <stop offset="1" stop-color="${glowWarm}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="cool" cx="0.1" cy="0.05" r="0.55">
        <stop offset="0" stop-color="${glowCool}" stop-opacity="${light ? 0.45 : 0.35}"/>
        <stop offset="1" stop-color="${glowCool}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="0.45" stop-color="${light ? '#ffffff' : '#8fb0ff'}" stop-opacity="${light ? 0.7 : 0.45}"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity="${light ? 0.22 : 0.4}"/>
      </linearGradient>
      <filter id="b0" filterUnits="userSpaceOnUse" x="-600" y="-600" width="3800" height="2800"><feGaussianBlur stdDeviation="10"/></filter>
      <filter id="b1" filterUnits="userSpaceOnUse" x="-600" y="-600" width="3800" height="2800"><feGaussianBlur stdDeviation="5"/></filter>
      <filter id="b2" filterUnits="userSpaceOnUse" x="-600" y="-600" width="3800" height="2800"><feGaussianBlur stdDeviation="2"/></filter>
      <filter id="soft" filterUnits="userSpaceOnUse" x="-600" y="-600" width="3800" height="2800"><feGaussianBlur stdDeviation="1.6"/></filter>
      <filter id="crest" filterUnits="userSpaceOnUse" x="-600" y="-600" width="3800" height="2800"><feGaussianBlur stdDeviation="28"/></filter>
      <filter id="big" filterUnits="userSpaceOnUse" x="-800" y="-800" width="4200" height="3200"><feGaussianBlur stdDeviation="80"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <rect width="${W}" height="${H}" fill="url(#warm)"/>
    <rect width="${W}" height="${H}" fill="url(#cool)"/>
    <path d="M-400 700 C 400 300 1300 880 2960 240" fill="none" stroke="url(#ribbon)" stroke-width="300" filter="url(#big)"/>
    <path d="M-400 520 C 700 760 1500 260 2960 520" fill="none" stroke="url(#ribbon)" stroke-width="140" stroke-opacity="0.6" filter="url(#big)"/>
    ${waveLayers}
  </svg>`);
}

for (const theme of ['light', 'dark']) {
  const svg = wallpaper(theme);
  const name = theme === 'light' ? 'gunduz' : 'gece';
  await sharp(svg).webp({ quality: 86, smartSubsample: true }).toFile(path.join(outDir, `${name}.webp`));
  await sharp(svg).resize(1440).webp({ quality: 84, smartSubsample: true }).toFile(path.join(outDir, `${name}-kucuk.webp`));
  console.log(`${name} duvar kağıdı hazır`);
}
