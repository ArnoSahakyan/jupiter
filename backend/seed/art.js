// Illustrations for the demo data, drawn as SVG and rendered with sharp.
// Everything is generated, so there are no stock photos or licenses involved.
const sharp = require('sharp');

const render = (svg) => sharp(Buffer.from(svg)).webp({ quality: 86 }).toBuffer();

// A small seeded random, so every run draws the same pictures.
const rng = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const stars = (random, width, height, count, maxY = height) =>
  Array.from({ length: count }, () =>
    `<circle cx="${(random() * width).toFixed(1)}" cy="${(random() * maxY).toFixed(1)}" r="${(0.6 + random() * 1.6).toFixed(2)}" fill="#fff" opacity="${(0.35 + random() * 0.6).toFixed(2)}"/>`
  ).join('');

const HAIR = {
  short: (c) => `<path d="M138 168c0-46 28-72 62-72s62 26 62 72c-10-22-30-34-62-34s-52 12-62 34z" fill="${c}"/>`,
  long: (c) => `<path d="M128 250c-8-90 18-154 72-154s80 64 72 154c-10-8-18-30-18-60 0-34-22-58-54-58s-54 24-54 58c0 30-8 52-18 60z" fill="${c}"/>`,
  bun: (c) => `<circle cx="200" cy="84" r="26" fill="${c}"/><path d="M138 170c0-48 28-74 62-74s62 26 62 74c-12-26-34-40-62-40s-50 14-62 40z" fill="${c}"/>`,
  curly: (c) => [140, 160, 182, 204, 226, 248, 262].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 112 : 126}" r="${i === 0 || i === 6 ? 20 : 26}" fill="${c}"/>`).join('') + `<circle cx="138" cy="152" r="18" fill="${c}"/><circle cx="262" cy="152" r="18" fill="${c}"/>`,
  none: () => '',
};

// Head-and-shoulders portrait on a soft gradient.
const avatar = ({ bg, skin, hair, hairStyle, shirt, glasses }) => render(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  ${hairStyle === 'long' ? HAIR.long(hair) : ''}
  <path d="M80 400c0-78 54-122 120-122s120 44 120 122z" fill="${shirt}"/>
  <rect x="178" y="236" width="44" height="52" rx="18" fill="${skin}"/>
  <path d="M170 286c10 16 50 16 60 0" stroke="#000" stroke-opacity=".08" stroke-width="10" fill="none"/>
  <ellipse cx="200" cy="178" rx="62" ry="72" fill="${skin}"/>
  <ellipse cx="138" cy="186" rx="10" ry="16" fill="${skin}"/><ellipse cx="262" cy="186" rx="10" ry="16" fill="${skin}"/>
  ${hairStyle === 'long' ? HAIR.short(hair) : HAIR[hairStyle](hair)}
  <circle cx="178" cy="184" r="6" fill="#2b2233"/><circle cx="222" cy="184" r="6" fill="#2b2233"/>
  <path d="M182 216q18 14 36 0" stroke="#7a3b3b" stroke-width="5" stroke-linecap="round" fill="none"/>
  <circle cx="164" cy="204" r="9" fill="#ff8a8a" opacity=".25"/><circle cx="236" cy="204" r="9" fill="#ff8a8a" opacity=".25"/>
  ${glasses ? `<g fill="none" stroke="#2b2233" stroke-width="4"><circle cx="178" cy="184" r="17"/><circle cx="222" cy="184" r="17"/><path d="M195 184h10"/></g>` : ''}
</svg>`);

// Wide banner scenes for cover photos and post pictures.
const SCENES = {
  // night sky with a banded planet
  planet: ({ sky, planet, seed, width, height }) => {
    const r = rng(seed);
    const cx = width * 0.68, cy = height * 0.52, rad = height * 0.3;
    return `
    <defs>
      <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
      <clipPath id="p"><circle cx="${cx}" cy="${cy}" r="${rad}"/></clipPath>
      <radialGradient id="sh" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#s)"/>
    ${stars(r, width, height, 140)}
    <g clip-path="url(#p)">
      <rect x="${cx - rad}" y="${cy - rad}" width="${rad * 2}" height="${rad * 2}" fill="${planet[0]}"/>
      ${[0.18, 0.42, 0.6, 0.8].map((f, i) => `<rect x="${cx - rad}" y="${cy - rad + rad * 2 * f}" width="${rad * 2}" height="${rad * (i % 2 ? 0.16 : 0.1)}" fill="${planet[1 + (i % 2)]}"/>`).join('')}
      <ellipse cx="${cx + rad * 0.3}" cy="${cy + rad * 0.3}" rx="${rad * 0.2}" ry="${rad * 0.11}" fill="${planet[3]}"/>
      <circle cx="${cx}" cy="${cy}" r="${rad}" fill="url(#sh)"/>
    </g>
    <circle cx="${width * 0.2}" cy="${height * 0.26}" r="${height * 0.05}" fill="#e9e2ff" opacity=".85"/>`;
  },
  // layered mountains at dusk
  mountains: ({ sky, hills, seed, width, height }) => {
    const r = rng(seed);
    const ridge = (base, amp, color, steps = 9) => {
      let d = `M0 ${height}L0 ${base}`;
      for (let i = 1; i <= steps; i++) d += `L${(width / steps) * i} ${base - r() * amp}`;
      return `<path d="${d}L${width} ${height}z" fill="${color}"/>`;
    };
    return `
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".7" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient></defs>
    <rect width="${width}" height="${height}" fill="url(#s)"/>
    ${stars(r, width, height, 60, height * 0.35)}
    <circle cx="${width * 0.74}" cy="${height * 0.42}" r="${height * 0.12}" fill="${sky[2]}" opacity=".9"/>
    ${ridge(height * 0.62, height * 0.22, hills[0])}
    ${ridge(height * 0.74, height * 0.18, hills[1], 12)}
    ${ridge(height * 0.86, height * 0.12, hills[2], 7)}`;
  },
  // calm sea under a big moon
  sea: ({ sky, water, seed, width, height }) => {
    const r = rng(seed);
    const horizon = height * 0.6;
    const ripples = Array.from({ length: 18 }, (_, i) => {
      const y = horizon + 12 + i * ((height - horizon) / 18);
      const w = 40 + r() * 140;
      return `<rect x="${width * 0.5 - w / 2 + (r() - 0.5) * 120}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="3" rx="1.5" fill="#fff" opacity="${(0.15 + r() * 0.3).toFixed(2)}"/>`;
    }).join('');
    return `
    <defs>
      <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
      <linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${water[0]}"/><stop offset="1" stop-color="${water[1]}"/></linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#s)"/>
    ${stars(r, width, height, 90, horizon * 0.8)}
    <circle cx="${width * 0.5}" cy="${horizon - height * 0.14}" r="${height * 0.13}" fill="#fff4dc"/>
    <rect y="${horizon}" width="${width}" height="${height - horizon}" fill="url(#w)"/>
    ${ripples}`;
  },
  // city skyline at night (the campus)
  city: ({ sky, buildings, seed, width, height }) => {
    const r = rng(seed);
    let x = 0, blocks = '';
    while (x < width) {
      const w = 50 + r() * 90, h = height * (0.25 + r() * 0.4);
      const color = buildings[Math.floor(r() * buildings.length)];
      blocks += `<rect x="${x.toFixed(1)}" y="${(height - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${color}"/>`;
      for (let wy = height - h + 14; wy < height - 16; wy += 22)
        for (let wx = x + 10; wx < x + w - 14; wx += 18)
          if (r() > 0.55) blocks += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="8" height="10" fill="#ffd98a" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
      x += w + 4;
    }
    return `
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
    <rect width="${width}" height="${height}" fill="url(#s)"/>
    ${stars(r, width, height, 80, height * 0.5)}
    ${blocks}`;
  },
};

const scene = (kind, options, width, height) =>
  render(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${SCENES[kind]({ ...options, width, height })}</svg>`);

module.exports = {
  avatar,
  cover: (kind, options) => scene(kind, options, 1500, 500),
  picture: (kind, options) => scene(kind, options, 1200, 900),
};
