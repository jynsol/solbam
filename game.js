/* ===================================================
   솔밤배 — 게임
   =================================================== */
'use strict';
const $ = s => document.querySelector(s);
const app = $('#app'), cv = $('#cv'), ctx = cv.getContext('2d');
const R = Math.round, rand = (a, b) => a + Math.random() * (b - a), irand = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
const bay = (x, y) => BAYER[(x & 3) + ((y & 3) << 2)];
const RENDER_SCALE = 3;
const LW = 120; let LH = 240, GY = 154;
const darkCv = mkCanvas(1, 1), darkCtx = darkCv.getContext('2d');
let darkImg, lightBuf, skyCv = mkCanvas(1, 1), groundCv = mkCanvas(1, 1);

/* ---------- 세계 배치 ---------- */
const EV = [{ x: 240, type: 'ginger' }, { x: 500, type: 'snow' }, { x: 760, type: 'elf' }];
const SOL_X = 630, END_X = 966, TREE_X = END_X + 56;
const AMB = [0.9, 0.62, 0.34, 0.12];
const LIT_LIMIT = [EV[1].x + 30, EV[2].x + 30, TREE_X - 50];

function resize() {
  const r = app.getBoundingClientRect();
  LH = clamp(R(LW * r.height / r.width), 180, 300);
  cv.width = LW * RENDER_SCALE; cv.height = LH * RENDER_SCALE; ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0); GY = Math.max(148, R(LH * 0.64));
  darkCv.width = LW; darkCv.height = LH; darkImg = darkCtx.createImageData(LW, LH);
  for (let i = 0; i < LW * LH; i++) { darkImg.data[i * 4] = 9; darkImg.data[i * 4 + 1] = 11; darkImg.data[i * 4 + 2] = 24; }
  lightBuf = new Float32Array(LW * LH);
  buildSky(); buildGround(); makeStars();
  ctx.imageSmoothingEnabled = false;
  document.documentElement.style.setProperty('--u', (r.width / LW) + 'px');
}

/* ---------- 배경 ---------- */
const SKY = ['#11141f', '#151927', '#1a1f30', '#1f2538', '#242b40', '#2a3249', '#303a52'];
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function buildSky() {
  skyCv.width = LW; skyCv.height = GY + 2;
  const g = skyCv.getContext('2d'), im = g.createImageData(LW, GY + 2), n = SKY.length - 1, rgb = SKY.map(hex);
  for (let y = 0; y < GY + 2; y++) {
    const t = clamp(y / (GY - 10), 0, 1) * n, i = Math.min(n - 1, Math.floor(t)), f = t - i;
    for (let x = 0; x < LW; x++) { const c = f > bay(x, y) ? rgb[i + 1] : rgb[i], o = (y * LW + x) * 4; im.data[o] = c[0]; im.data[o + 1] = c[1]; im.data[o + 2] = c[2]; im.data[o + 3] = 255; }
  }
  g.putImageData(im, 0, 0);
  // 지평선 띠 (레퍼런스의 수평 밴드)
  g.fillStyle = '#353f58'; g.fillRect(0, GY - 22, LW, 2);
  g.fillStyle = '#2f3850'; g.fillRect(0, GY - 15, LW, 3);
  g.fillStyle = '#394461'; g.fillRect(0, GY - 8, LW, 2);
}
function buildGround() {
  const h = LH - GY; groundCv.width = 128; groundCv.height = h;
  const g = groundCv.getContext('2d');
  const bands = ['#dcefff', '#c4e2f6', '#b0d4ee', '#9cc6e6', '#86b4da', '#6f9ac6', '#5b80ad', '#4a6893'];
  for (let y = 0; y < h; y++) {
    const t = Math.pow(y / h, 0.85) * (bands.length - 1), i = Math.min(bands.length - 2, Math.floor(t)), f = t - i;
    for (let x = 0; x < 128; x++) { g.fillStyle = f > bay(x, y) ? bands[i + 1] : bands[i]; g.fillRect(x, y, 1, 1); }
  }
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 1);
  for (let i = 0; i < 22; i++) { const x = irand(0, 120), y = irand(3, h * 0.55); g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.55)' : 'rgba(110,150,200,.35)'; g.fillRect(x, y, irand(3, 9), 1); }
}
let STARS = [];
function makeStars() { STARS = []; for (let i = 0; i < 55; i++) STARS.push({ x: rand(0, LW), y: rand(2, GY - 40), p: rand(0, 6.28), s: rand(1.2, 3.5), b: Math.random() < 0.18, y2: Math.random() < 0.3 }); }

function makePine(h, w, c, tiers) {
  const cw = w + 4, ch = h + 5, g = mkCanvas(cw, ch), x0 = Math.floor(cw / 2), cx = g.getContext('2d');
  tiers = tiers || (h > 56 ? 4 : 3);
  const sd = Math.random() * 10;
  const hwAt = r => { const t = r / h, ph = (t * tiers) % 1; return { hw: Math.max(0, R((0.12 + 0.88 * t) * (w / 2) * (0.4 + 0.6 * ph))), ph, ti: Math.floor(t * tiers) }; };
  for (let r = 0; r < h; r++) {
    const { hw, ph, ti } = hwAt(r);
    for (let dx = -hw; dx <= hw; dx++) {
      if (ph > 0.78 && Math.abs(dx) >= hw - 1 && ((dx + r) & 1)) continue; // 들쭉날쭉한 가지 끝
      let col = dx < -hw * 0.25 ? c.light : dx > hw * 0.35 ? c.dark : c.mid;
      if (c.snow) {
        const lim = 0.2 + 0.09 * Math.sin(dx * 1.1 + ti * 2.3 + sd);
        if (ph < lim && dx < hw * 0.75) col = dx > hw * 0.15 ? c.snow2 : c.snow;
        else if (ph < lim + 0.07 && dx < hw * 0.5 && ((dx + r) & 1)) col = c.snow2;
      }
      cx.fillStyle = col; cx.fillRect(x0 + dx, r + 1, 1, 1);
    }
  }
  cx.fillStyle = c.trunk; cx.fillRect(x0 - 1, h + 1, 3, 4);
  const bulbs = [];
  if (c.bulbs) for (let ti = 0; ti < tiers; ti++) {
    const r = Math.floor(((ti + 0.7) / tiers) * h), { hw } = hwAt(r), n = 2 + ti;
    for (let j = 0; j < n; j++) { const u = n === 1 ? 0 : j / (n - 1) * 2 - 1; bulbs.push({ lx: R(u * (hw - 2)), ly: r + 1 + R((1 - u * u) * 2) + R(u * 1.5) - ch }); }
  }
  return { cv: g, ax: x0, h: ch, bulbs, tiers, hwAt, H: h };
}
const WARM = ['#ffe27a', '#fff2b0', '#ffc94a', '#ffe27a', '#ff8a8a', '#fff2b0'];
const PAL_FAR = { mid: '#1b2134', dark: '#181d2f', light: '#1f2639', trunk: '#161a2a' };
const PAL_MID = { mid: '#22324a', dark: '#1d2b42', light: '#2a3c56', snow: '#5d7396', snow2: '#4a5f82', trunk: '#1d2235' };
const PAL_NEAR = { mid: '#2c5c60', dark: '#1f4048', light: '#3f7c76', snow: '#e8f4fc', snow2: '#a9cbe3', trunk: '#5a3a2a', bulbs: true };
let FAR = [], MID = [], NEAR = [], farV = [], midV = [], PROPS = [], BUN = [];
const BIG = { tree: null, lit: false, star: false };
const TREE_IMG = {};
function loadImgs() {
  const TT = ['bubble', 'large', 'pico', 'pine', 'slim', 'smallpine', 'spruce', 'thick', 'tiny', 'tri'], PP = ['cold', 'teal', 'gteal', 'green', 'night'];
  const trees = TT.flatMap(t => PP.map(p => 'trees/' + t + '_' + p));
  return Promise.all([...trees, 'bunny', 'player', 'sol', 'bambi', 'en_fuzz', 'en_slime', 'en_mush', 'monster-poses'].map(n => new Promise(res => {
    const im = new Image(); im.onload = () => { TREE_IMG[n] = im; res(); }; im.onerror = () => res(); im.src = 'img/' + (['player', 'sol', 'bambi'].includes(n) ? n + '-winter-v1' : n === 'en_mush' ? 'elf-christmas-v2' : n.startsWith('en_') ? n + '-christmas-v1' : n) + '.png';
  })));
}
// 그림에서 잘라낸 나무 → 색 변형/좌우 반전 + 전구 자리 계산
function treeFromImg(img, o = {}) {
  const w = img.width, h = img.height, c = mkCanvas(w, h + 2), g = c.getContext('2d');
  if (o.flip) { g.translate(w, 0); g.scale(-1, 1); }
  g.drawImage(img, 0, 0); g.setTransform(1, 0, 0, 1, 0, 0);
  const id = g.getImageData(0, 0, w, h), d = id.data;
  if (o.tint) for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3] || (d[i] > 200 && d[i + 1] > 200 && d[i + 2] > 200)) continue;
    d[i] *= o.tint[0]; d[i + 1] *= o.tint[1]; d[i + 2] *= o.tint[2];
  }
  g.putImageData(id, 0, 0);
  const rows = [];
  for (let y = 0; y < h; y++) { let L = -1, Rr = -1; for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) { if (L < 0) L = x; Rr = x; } rows.push([L, Rr]); }
  // Ground foreground roots at the visible trunk rather than the PNG boundary.
  if (o.tiers) {
    let bottom = h - 1;
    while (bottom > 0 && rows[bottom][0] < 0) bottom--;
    const [left, right] = rows[bottom];
    if (left >= 0) {
      const shift = h - bottom;
      g.clearRect(0, 0, w, h + 2);
      g.putImageData(id, 0, shift);
      for (let n = 0; n < shift; n++) rows.unshift([-1, -1]);
      const width = right - left + 1;
      g.fillStyle = '#a3bfd6';
      g.fillRect(left - 2, h + 1, width + 4, 1);
      g.fillStyle = '#d8eaf4';
      g.fillRect(left - 1, h, width + 2, 1);
      g.fillRect(left, h - 1, Math.max(2, Math.floor(width / 3)), 1);
    }
  }
  const bulbs = [], ax = Math.floor(w / 2);
  if (o.tiers) o.tiers.forEach(t => {
    const r = Math.floor(t * h), [L, Rr] = rows[r]; if (L < 0 || Rr - L < 6) return;
    const n = Math.max(2, Math.round((Rr - L) / (o.gap || 7)));
    for (let j = 0; j < n; j++) { const u = j / (n - 1), x = Math.round(L + 2 + u * (Rr - L - 4)); bulbs.push({ lx: x - ax, ly: r + Math.round((1 - (2 * u - 1) ** 2) * 2) - (h + 2) }); }
  });
  return { cv: c, ax, h: h + 2, bulbs, rows, w };
}

/* ---------- 나무 생성기 (외곽선 + 3단 음영 + 눈) ---------- */
function rng32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const TPAL = [
  { l: '#62a676', m: '#3f805c', d: '#285a42', ol: '#13261d' },
  { l: '#55a197', m: '#357f76', d: '#225c58', ol: '#112a29' },
  { l: '#6494a8', m: '#45738a', d: '#2f5468', ol: '#15263a' },
  { l: '#80ad66', m: '#5a8a4e', d: '#3d643a', ol: '#1b2a1a' },
];
function genTree(o) {
  const r = rng32(o.seed || 1), h = o.h, w = o.w, W = w + 6, H = h + 4, cx = Math.floor(W / 2);
  const M = new Uint8Array(W * H); // 1 밝음 2 중간 3 어둠 4 줄기 5 줄기어둠 6 눈 7 눈그늘
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) M[y * W + x] = v; };
  const get = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : M[y * W + x];
  const trunkH = o.type === 'bare' ? 0 : Math.max(4, Math.round(h * 0.14)), fh = h - trunkH, tk = Math.max(1, Math.round(w / 22)), tw = tk * 2 + 1;
  if (o.type === 'bare') {
    const th = h; for (let y = Math.round(h * 0.15); y < th; y++) { const ww = 1 + Math.floor((y / th) * tw); for (let x = -ww; x <= ww; x++) set(cx + x, y, x > 0 ? 5 : 4); }
    const nb = 4 + Math.floor(r() * 3);
    for (let i = 0; i < nb; i++) {
      const y0 = Math.round(h * (0.2 + 0.6 * i / nb)), dir = i % 2 ? 1 : -1, len = Math.round(w * (0.25 + r() * 0.2));
      for (let k = 0; k < len; k++) { const x = cx + dir * k, y = y0 - Math.round(k * (0.5 + r() * 0.3)); set(x, y, 4); if (k > len * 0.5 && r() < 0.5) set(x + dir, y - 2, 4); }
    }
  } else {
    const tiers = o.tiers || Math.max(3, Math.min(7, Math.round(fh / (o.type === 'spruce' ? 9 : 13)))), th = fh / tiers;
    for (let t = 0; t < tiers; t++) {
      const y0 = Math.round(t * th * 0.92), y1 = Math.round((t + 1) * th + 2), hwTop = Math.max(1, (w / 2) * (0.12 + 0.88 * t / tiers) * 0.35), hwBot = (w / 2) * (0.25 + 0.75 * (t + 1) / tiers);
      for (let y = y0; y < Math.min(y1, fh + 1); y++) {
        const u = (y - y0) / Math.max(1, y1 - y0);
        let hw = o.type === 'round' ? hwTop + (hwBot - hwTop) * Math.sin(u * Math.PI / 2) : hwTop + (hwBot - hwTop) * u;
        hw = Math.round(hw + (r() < 0.25 ? 1 : 0));
        for (let x = -hw; x <= hw; x++) {
          if (y >= y1 - 2 && Math.abs(x) > hw * 0.5 && ((x + y + t) % 3 === 0)) continue; // 가지 끝 톱니
          const v = x < -hw * 0.3 ? 1 : x > hw * 0.35 || y > y1 - 3 ? 3 : 2;
          set(cx + x, y, v);
        }
      }
    }
    for (let y = fh - 2; y < h; y++) for (let x = -tk; x <= tk; x++) if (y >= fh || !get(cx + x, y)) set(cx + x, y, x > 0 ? 5 : 4);
    for (let y = fh - 2; y < fh; y++) for (let x = -tk; x <= tk; x++) if (get(cx + x, y) && get(cx + x, y) < 4 && y === fh - 1) set(cx + x, y, 3);
  }
  // 눈: 윗면 1~2px
  for (let x = 0; x < W; x++) for (let y = 1; y < H; y++) {
    const v = get(x, y); if (!v || get(x, y - 1)) continue;
    if (v >= 4 && v <= 5 && o.type !== 'bare') continue; if (y + 1 < H && get(x, y + 1)) { set(x, y + 1, 6); if (get(x, y + 2) && get(x, y + 2) < 4 && r() < (o.snowy ? 0.85 : 0.55)) set(x, y + 2, 7); }
  }
  // 그리기 + 테두리 외곽선
  const c = mkCanvas(W, H), g = c.getContext('2d'), p = o.pal, cols = [null, p.l, p.m, p.d, '#7a5236', '#523624', '#eef6fc', '#b8d0e6'];
  const rows = [];
  for (let y = 0; y < H; y++) {
    let L = -1, Rr = -1;
    for (let x = 0; x < W; x++) {
      const v = get(x, y); if (!v) continue; if (L < 0) L = x; Rr = x;
      const trunk = v === 4 || v === 5, edge = trunk ? (!get(x - 1, y) || !get(x + 1, y) || y === H - 1 || !get(x, y + 1)) : (!get(x - 1, y) || !get(x + 1, y) || !get(x, y - 1) || !get(x, y + 1));
      g.fillStyle = edge ? (trunk ? '#2a1a14' : p.ol) : (trunk && x === cx ? '#8a5e3c' : cols[v]); g.fillRect(x, y, 1, 1);
    }
    rows.push([L, Rr]);
  }
  const bulbs = [];
  if (o.bulbs && o.type !== 'bare') o.bulbs.forEach(t => {
    const y = Math.floor(t * (H - 4)), [L, Rr] = rows[y] || [-1, -1]; if (L < 0 || Rr - L < 6) return;
    const n = Math.max(2, Math.round((Rr - L) / (o.gap || 6)));
    for (let j = 0; j < n; j++) { const u = j / (n - 1), x = Math.round(L + 2 + u * (Rr - L - 4)); bulbs.push({ lx: x - cx, ly: y + Math.round((1 - (2 * u - 1) ** 2) * 2) - H }); }
  });
  return { cv: c, ax: cx, h: H, bulbs, rows, w: W };
}
function randTree(seed, opt = {}) {
  const r = rng32(seed * 9973 + 7), roll = r();
  const type = opt.type || (roll < 0.45 ? 'pine' : roll < 0.7 ? 'spruce' : roll < 0.9 ? 'round' : 'bare');
  const h = opt.h || Math.round(type === 'spruce' ? 40 + r() * 50 : type === 'bare' ? 30 + r() * 30 : 24 + r() * 60);
  const w = opt.w || Math.round(type === 'spruce' ? h * (0.35 + r() * 0.12) : type === 'round' ? h * (0.6 + r() * 0.15) : h * (0.5 + r() * 0.15));
  return genTree({ type, h, w, seed, pal: opt.pal || TPAL[Math.floor(r() * TPAL.length)], snowy: r() < 0.6, bulbs: opt.nobulb ? null : [0.3, 0.5, 0.7, 0.85].slice(0, h > 50 ? 4 : 3) });
}
const TINTS = [null, [0.82, 0.9, 1.0], [0.7, 0.86, 0.96]];
function buildWorld() {
  const _r = Math.random; Math.random = rng32(20261212);
  try { buildWorldInner(); } finally { Math.random = _r; }
}
function buildWorldInner() {
  farV = [];
  for (const t of ['pico', 'tiny', 'tri', 'smallpine']) for (const flip of [false, true]) { const im = TREE_IMG['trees/' + t + '_night']; if (im) farV.push(treeFromImg(im, { flip, tint: [0.32, 0.36, 0.52] })); }
  if (!farV.length) for (let i = 0; i < 5; i++) farV.push(makePine(irand(38, 58), irand(24, 34), PAL_FAR));
  midV = [];
  for (const t of ['pico', 'tiny', 'tri', 'smallpine', 'spruce', 'slim']) for (const flip of [false, true]) { const im = TREE_IMG['trees/' + t + '_night']; if (im) midV.push(treeFromImg(im, { flip, tint: [0.55, 0.6, 0.78] })); }
  FAR = []; for (let x = -20; x < 640; x += irand(9, 16)) FAR.push({ x, v: irand(0, farV.length - 1), dy: irand(0, 5) });
  MID = []; for (let x = -20; x < 1100; x += irand(14, 24)) MID.push({ x, v: irand(0, midV.length - 1), dy: irand(0, 6) });
  NEAR = [];
  const TT = ['bubble', 'large', 'pico', 'pine', 'slim', 'smallpine', 'spruce', 'thick', 'tiny', 'tri'], PN = ['cold', 'teal', 'gteal', 'green'];
  let bag = [];
  for (let x = -40; x < TREE_X - 80;) {
    if (!bag.length) bag = [...TT].sort(() => Math.random() - 0.5);
    const t = bag.pop(), im = TREE_IMG['trees/' + t + '_' + pick(PN)];
    const tr = im ? treeFromImg(im, { flip: Math.random() < 0.5, tiers: [0.35, 0.55, 0.75] }) : randTree(x + 99);
    NEAR.push({ x: x + irand(-3, 3), pine: tr, bulbs: tr.bulbs.map((b, i) => ({ ...b, col: WARM[(i * 3 + NEAR.length) % WARM.length], on: false, at: 0, seed: rand(0, 6.28) })) });
    x += Math.max(16, Math.round(tr.w * 0.62)) + irand(0, 12);
  }
  PROPS = [];
  
  BUN = [{ x: 350, dir: -1, hop: null, cool: 0, f: 0, jy: 0 }];
  BIG.tree = makeBigTree();
}
function makeBigTree() {
  const im = TREE_IMG['trees/large_green'];
  const p = im ? treeFromImg(im, { tiers: [0.24, 0.34, 0.44, 0.54, 0.64, 0.74, 0.84], gap: 6 }) : genTree({ type: 'pine', h: 104, w: 74, tiers: 6, seed: 42, pal: TPAL[0], snowy: true, bulbs: [0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.82], gap: 5 });
  const orn = [];
  [0.3, 0.4, 0.5, 0.6, 0.7, 0.8].forEach(t => {
    const y = Math.floor(t * (p.h - 2)), [L, Rr] = p.rows[y] || [-1, -1]; if (L < 0 || Rr - L < 10) return;
    for (let j = 0; j < 2; j++) orn.push({ lx: irand(L + 4, Rr - 5) - p.ax, ly: y - p.h, col: pick(['#d8394a', '#d8394a', '#ffd25e', '#e8f4fc']) });
  });
  return { ...p, bulbs: p.bulbs.map((b, j) => ({ ...b, col: WARM[j % WARM.length], on: false, at: 0, seed: rand(0, 6.28) })), orn, top: -p.h + 1 };
}

/* ---------- 상태 ---------- */
const CH = {}, EN = {};
let GUESTS = [];
function cells(img, n) { const w = img.width / n, out = []; for (let i = 0; i < n; i++) { const c = mkCanvas(w, img.height); c.getContext('2d').drawImage(img, i * w, 0, w, img.height, 0, 0, w, img.height); out.push(c); } return out; }
function toCanvas(img) { const c = mkCanvas(img.width, img.height); c.getContext('2d').drawImage(img, 0, 0); return c; }
function setupSprites() {
  for (const k of ['player', 'sol', 'bambi']) {
    const F = cells(TREE_IMG[k], 12).map(hires => {
      const frame = mkCanvas(32, 32), g = frame.getContext('2d');
      g.imageSmoothingEnabled = false; g.drawImage(hires, 0, 0, 32, 32);
      frame.hires = hires; return frame;
    });
    CH[k] = { F, front: F[0], idle: F[0], walkA: F[4], walkB: F[6], wind: F[k === 'player' ? 8 : 6], swing: F[k === 'player' ? 9 : 7], cheer: F[11] };
  }
  for (const [key, asset] of [['fuzz', 'en_fuzz'], ['slime', 'en_slime'], ['mush', 'en_mush']]) {
    const frame = mkCanvas(24, 28), g = frame.getContext('2d');
    g.imageSmoothingEnabled = false; g.drawImage(TREE_IMG[asset], 0, 0, 24, 28);
    frame.hires = toCanvas(TREE_IMG[asset]); EN[key] = frame;
  }
  if (TREE_IMG['monster-poses']) {
    const frames = cells(TREE_IMG['monster-poses'], 6);
    [EN.fuzz, EN.slime, EN.mush].forEach((base, i) => {
      for (const [name, offset] of [['hit', 0], ['cheer', 3]]) {
        const pose = mkCanvas(base.width, base.height);
        pose.hires = frames[i + offset];
        pose.getContext('2d').drawImage(pose.hires, 0, 0, pose.width, pose.height);
        base[name] = pose;
      }
    });
  }
  CH.bambi.noses = CH.bambi.F.map(noseAnchor);

}
// The nose is the highest red cluster, above the scarf, in each frame.
function noseAnchor(frame) {
  const { data } = frame.getContext('2d').getImageData(0, 0, frame.width, frame.height);
  let top = -1, xSum = 0, ySum = 0, count = 0;
  for (let y = 0; y < frame.height; y++) {
    if (top >= 0 && y > top + 1) break;
    for (let x = 0; x < frame.width; x++) {
      const i = (y * frame.width + x) * 4;
      if (data[i + 3] && data[i] > 150 && data[i + 1] < 110 && data[i + 2] < 110) {
        if (top < 0) top = y;
        xSum += x + 0.5; ySum += y + 0.5; count++;
      }
    }
  }
  return count ? { x: xSum / count, y: ySum / count } : { x: frame.width / 2, y: 16 };
}
function partyArmsUp(time, offset = 0) {
  return (time + offset) % 1.5 < .75;
}
function bambiPose(cam, oy) {
  const i = S.party ? (partyArmsUp(S.T, .16) ? 11 : 0) : bambi.moving ? 4 + (bambi.walkT * 8 | 0) % 4 : bambi.cheer && (S.T * 4 | 0) % 2 ? 11 : (S.T * 2 | 0) % 4;
  const sp = CH.bambi.F[i], flip = !!(bambi.moving && bambi.left), n = CH.bambi.noses[i];
  const x = R(bambi.x - sp.width / 2 - cam), y = R(feetY(sp) + oy + bambi.oy);
  return { sp, flip, x, y, noseX: x + (flip ? sp.width - n.x : n.x), noseY: y + n.y };
}
const S = {
  mode: 'title', cam: 0, camLock: null, amb: 0.3, pieces: 0, holding: false, walkTo: 0, walkRes: null, tapRes: null,
  T: 0, freeze: 0, ts: 1, shakeT: 0, shakeM: 0, flash: 0, flashC: '#fff', sx: 0, sy: 0, hudFlash: [0, 0, 0], hud: false,
};
const player = { x: 24, atk: null, queued: false, combo: 0, walkT: 0, moving: false, cheer: false, lunge: 0, visible: false };
const bambi = { x: -100, oy: 0, visible: false, moving: false, walkT: 0, guide: false };
const sol = { x: TREE_X - 30, visible: false, cheer: false };
let look = { hair: 0, hat: 0, outfit: 0, skin: 1, name: '' };
let PF = null, enemy = null, item = null;
let P = [], SLASH = [], VL = [], RAYS = [], FOOT = [], FLAKES = [], timers = [], tweens = [];
const wait = ms => new Promise(r => timers.push({ t: ms / 1000, r }));
const tween = (sec, fn, ease) => new Promise(r => tweens.push({ t: 0, d: sec, fn, r, ease: ease || (x => x) }));
const easeOut = x => 1 - Math.pow(1 - x, 3), easeIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

/* ---------- VFX ---------- */
function part(o) { o.max = o.life = o.life || 0.5; o.vx = o.vx || 0; o.vy = o.vy || 0; o.g = o.g || 0; o.s = o.s || 1; o.delay = o.delay || 0; o.seed = Math.random() * 10; o.cols = o.cols || ['#fff']; P.push(o); return o; }
function colOf(p) { const f = 1 - p.life / p.max; return p.cols[Math.min(p.cols.length - 1, Math.floor(f * p.cols.length))]; }
function vlight(x, y, r, i, life) { VL.push({ x, y, r, i, life, max: life }); }
function shake(m, t) { S.shakeM = Math.max(S.shakeM, m); S.shakeT = Math.max(S.shakeT, t); }
function flash(a, c) { S.flash = a; S.flashC = c || '#fff'; }
const glowCache = {};
function glow(r, col) {
  const key = r + col; if (glowCache[key]) return glowCache[key];
  const s = r * 2 + 1, g = mkCanvas(s, s), c = g.getContext('2d'); c.fillStyle = col;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const d = Math.hypot(x - r, y - r) / r; if (d > 1) continue;
    const L = Math.floor(Math.pow(1 - d, 1.8) * 4 + bay(x, y) - 0.35); if (L <= 0) continue;
    c.globalAlpha = [0, .14, .28, .5, .8][Math.min(4, L)]; c.fillRect(x, y, 1, 1);
  }
  return glowCache[key] = g;
}
function drawGlow(x, y, r, col, a) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a == null ? 1 : clamp(a, 0, 1); ctx.drawImage(glow(r, col), R(x - r), R(y - r)); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
function pxl(x, y, c) { ctx.fillStyle = c; ctx.fillRect(R(x), R(y), 1, 1); }
function line(x0, y0, x1, y1, c) {
  x0 = R(x0); y0 = R(y0); x1 = R(x1); y1 = R(y1); ctx.fillStyle = c;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy, n = 0;
  while (n++ < 200) { ctx.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
function flareAt(x, y, L, core, arm) {
  x = R(x); y = R(y); L = Math.max(1, R(L)); ctx.fillStyle = arm || '#ffd76a';
  ctx.fillRect(x - L, y, L * 2 + 1, 1); ctx.fillRect(x, y - L, 1, L * 2 + 1);
  const t = Math.max(1, R(L * 0.3)); ctx.fillRect(x - t, y - 1, t * 2 + 1, 3); ctx.fillRect(x - 1, y - t, 3, t * 2 + 1);
  const d = R(L * 0.4); for (let i = 1; i <= d; i++) { ctx.fillRect(x + i, y + i, 1, 1); ctx.fillRect(x - i, y - i, 1, 1); ctx.fillRect(x + i, y - i, 1, 1); ctx.fillRect(x - i, y + i, 1, 1); }
  ctx.fillStyle = core || '#fff'; const c = Math.max(1, R(L * 0.6)); ctx.fillRect(x - c, y, c * 2 + 1, 1); ctx.fillRect(x, y - c, 1, c * 2 + 1); if (L > 5) ctx.fillRect(x - 1, y - 1, 3, 3);
}
function sparkle(x, y, c, big) {
  x = R(x); y = R(y); ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1);
  if (big) { ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); if (big > 1) { ctx.fillRect(x - 2, y, 1, 1); ctx.fillRect(x + 2, y, 1, 1); ctx.fillRect(x, y - 2, 1, 1); ctx.fillRect(x, y + 2, 1, 1); } }
}
const HOT = ['#ffffff', '#fff1a8', '#ffd25a', '#ff9a3a', '#ff4a5a'];
function burstSparks(x, y, n, sp, o = {}) {
  for (let i = 0; i < n; i++) { const a = o.dir != null ? o.dir + rand(-o.spread, o.spread) : rand(0, 6.283), v = rand(sp * 0.45, sp);
    part({ k: 'streak', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: o.g == null ? 140 : o.g, drag: 0.9, life: rand(0.22, 0.5) * (o.lm || 1), cols: o.cols || HOT, emit: true, delay: o.delay || 0 }); }
}
function burstTwinkle(x, y, n, sp, cols, o = {}) {
  for (let i = 0; i < n; i++) { const a = rand(0, 6.283), v = rand(sp * 0.3, sp);
    part({ k: 'twinkle', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up || 10), g: o.g || 18, drag: 0.93, life: rand(0.5, 1.0) * (o.lm || 1), cols: [pick(cols)], big: Math.random() < 0.4 ? 1 : 0, emit: true, delay: o.delay || 0 }); }
}
function confetti(x, y, n, sp) {
  for (let i = 0; i < n; i++) { const a = rand(-2.9, -0.2), v = rand(sp * 0.4, sp);
    part({ k: 'confetti', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 70, drag: 0.94, life: rand(0.9, 1.6), cols: [pick(['#e8344a', '#3fd17a', '#ffd25e', '#ffffff', '#7fc4ff'])], emit: true, wob: rand(6, 12), ground: true }); }
}
const ring = (x, y, r0, r1, life, cols, delay) => part({ k: 'ring', x, y, r0, r1, life, cols, emit: true, delay: delay || 0 });
const flareP = (x, y, L, life, delay) => part({ k: 'flare', x, y, L, life, emit: true, delay: delay || 0 });
const rays = (x, y, n, len, life, col) => RAYS.push({ x, y, n, len, life, max: life, col: col || '#ffd76a', rot: rand(0, 6) });
function debris(type, x, y, n) {
  for (let i = 0; i < n; i++) { const a = rand(-2.6, -0.4), v = rand(30, 80);
    const cols = type === 'ginger' ? [pick(['#b97436', '#f2c17e', '#fff1c9'])] : type === 'snow' ? [pick(['#ffffff', '#b5d9ec', '#e0f5ff'])] : [pick(['#e0414f', '#fff6ea', '#4cbb72'])];
    part({ k: 'px', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 220, drag: 0.98, life: rand(0.6, 1.1), cols, ground: true, bounce: 0.3 }); }
}
function snowPowder(x, y, n) { for (let i = 0; i < n; i++) part({ k: 'px', x: x + rand(-8, 8), y: y + rand(-12, 8), vx: rand(-40, 40), vy: rand(-50, 0), g: 12, drag: 0.92, life: rand(1.4, 2.6), cols: ['#ffffff', '#e6edff', '#b9c4ef'], wob: rand(2, 5) }); }
function puff(x, y, n) { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), v = rand(15, 45); part({ k: 'puff', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 10, drag: 0.9, life: rand(0.5, 0.9), r0: 1, r1: rand(3, 5), cols: ['#e8e4ff', '#a9a3d6', '#6e689e', '#43406e'] }); } }

/* ---------- 전투 ---------- */
const ENEMY = {
  ginger: { sp: () => EN.fuzz, hp: 3, name: '진저 쿠키', line: '바삭바삭~ 초대장은 내 거야!' },
  snow:   { sp: () => EN.slime, hp: 4, name: '눈사람', line: '눈이 펑펑… 여긴 못 지나가~' },
  elf:    { sp: () => EN.mush, hp: 5, name: '크리스마스 요정', line: '히히, 들켰다!\n그래도 초대장은 못 줘!' },
};
function spawnEnemy(i) {
  const e = EV[i], d = ENEMY[e.type], sp = d.sp();
  return enemy = { type: e.type, x: e.x, oy: 0, sp, w: sp.width, h: sp.height, hp: d.hp, max: d.hp, name: d.name, line: d.line, flash: 0, kb: 0, t: 0, state: 'enter', clip: 0, alpha: 1, dizzy: false, hpShow: 0, broke: [] };
}
function startAttack() {
  if (!enemy || enemy.hp <= 0) return;
  if (player.atk) { player.queued = true; return; }
  player.combo = (player.combo + 1) % 3;
  player.atk = { t: 0, kind: player.combo, slash: false, hit: false, fin: enemy.hp === 1 };
}
function spawnSlash(kind, fin) {
  const cx = player.x + 5, cy = GY - 9;
  if (fin) {
    SLASH.push({ x: cx + 3, y: cy - 2, r1: 6, r2: 22, a0: -2.1, a1: 1.2, t: 0, dur: 0.12, big: true });
    SLASH.push({ x: cx + 3, y: cy - 2, r1: 6, r2: 22, a0: 2.0, a1: -1.3, t: -0.06, dur: 0.12, big: true });
  } else if (kind === 1) SLASH.push({ x: cx, y: cy, r1: 5, r2: 15, a0: 1.3, a1: -1.7, t: 0, dur: 0.1 });
  else if (kind === 2) SLASH.push({ x: cx, y: cy, r1: 5, r2: 18, a0: -2.4, a1: 1.1, t: 0, dur: 0.11, big: true });
  else SLASH.push({ x: cx, y: cy, r1: 5, r2: 15, a0: -1.9, a1: 1.0, t: 0, dur: 0.1 });
}
function hitPoint() { return { x: enemy.x - enemy.w * 0.2, y: GY - enemy.h * 0.55 + enemy.oy }; }
function doHit(a) {
  const { x: hx, y: hy } = hitPoint();
  enemy.hp--; enemy.recoil = .32; enemy.flash = 0.1; enemy.kb = a.fin ? 7 : 3; enemy.hpShow = 9;
  enemy.broke.push({ i: enemy.hp, t: 0 });
  const big = a.kind === 2;
  if (enemy.hp > 0) {
    S.freeze = big ? 0.085 : 0.06; shake(big ? 3 : 2, big ? 0.18 : 0.12);
    flareP(hx, hy, big ? 12 : 8, 0.16);
    ring(hx, hy, 2, big ? 22 : 15, 0.24, ['#ffffff', '#fff1a8', '#ffd25a', '#ff7a8a']);
    burstSparks(hx, hy, big ? 18 : 12, big ? 150 : 120, { dir: -0.3, spread: 1.5 });
    burstTwinkle(hx, hy, big ? 8 : 4, 40, ['#ffd76a', '#5cff9a', '#ff6b7a', '#ffffff']);
    debris(enemy.type, hx, hy, big ? 7 : 4);
    if (big) { confetti(hx, hy, 14, 90); ring(hx, hy, 4, 30, 0.34, ['#fff', '#5cff9a', '#2f9a5a'], 0.04); }
    vlight(hx, hy, big ? 64 : 48, big ? 1.3 : 1.0, big ? 0.35 : 0.24);
  } else finisher(hx, hy);
}
function finisher(hx, hy) {
  S.mode = 'cutscene'; hideHint();
  S.freeze = 0.17; flash(0.9); shake(5, 0.4);
  S.ts = 0.28; tweens.push({ t: 0, d: 0.9, fn: p => S.ts = 0.28 + 0.72 * p, r: () => {}, ease: x => x * x });
  flareP(hx, hy, 24, 0.45);
  ring(hx, hy, 3, 34, 0.4, ['#ffffff', '#fff1a8', '#ffd25a', '#ff9a3a']);
  ring(hx, hy, 3, 50, 0.55, ['#ffffff', '#ff4a5a', '#d8303a'], 0.08);
  ring(hx, hy, 3, 64, 0.7, ['#ffffff', '#5cff9a', '#2f9a5a'], 0.16);
  burstSparks(hx, hy, 34, 190, { g: 90, lm: 1.4 });
  burstTwinkle(hx, hy, 18, 70, ['#ffd76a', '#5cff9a', '#ff6b7a', '#ffffff', '#6ab8ff'], { lm: 1.6 });
  confetti(hx, hy, 28, 130); rays(hx, hy, 14, 70, 1.1); vlight(hx, hy, 110, 1.8, 1.2);
  enemy.state = 'dying'; enemy.dieAt = 0;
}
function dissolve(mode) {
  const im = enemy.sp.getContext('2d').getImageData(0, 0, enemy.w, enemy.h).data;
  const ox = enemy.x - enemy.w / 2, oy = GY - enemy.h + 1 + enemy.oy, cx = enemy.w / 2, cy = enemy.h / 2;
  for (let y = 0; y < enemy.h; y++) for (let x = 0; x < enemy.w; x++) {
    const o = (y * enemy.w + x) * 4; if (im[o + 3] < 10) continue;
    const col = `rgb(${im[o]},${im[o + 1]},${im[o + 2]})`;
    if (mode === 'crumble') part({ k: 'px', x: ox + x, y: oy + y, vx: (x - cx) * rand(2, 6) + rand(-12, 12), vy: rand(-60, -10) - (enemy.h - y) * 0.8, g: 240, drag: 0.985, life: rand(1.2, 2.0), cols: [col, col, col, col, '#ffd76a'], ground: true, bounce: 0.28, delay: rand(0, 0.08) });
    else { const a = Math.atan2(y - cy, x - cx), v = rand(50, 130) * (0.6 + Math.hypot(x - cx, y - cy) / enemy.h); part({ k: 'px', x: ox + x, y: oy + y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, g: 110, drag: 0.93, life: rand(1.0, 1.7), cols: [col, col, col, '#dfe8ff'], ground: true, bounce: 0.12 }); }
  }
}

/* ---------- 업데이트 ---------- */
let last = 0;
function loop(now) { const rdt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now; update(rdt); render(); requestAnimationFrame(loop); }
function update(rdt) {
  for (let i = timers.length - 1; i >= 0; i--) { timers[i].t -= rdt; if (timers[i].t <= 0) { const r = timers[i].r; timers.splice(i, 1); r(); } }
  for (let i = tweens.length - 1; i >= 0; i--) { const w = tweens[i]; w.t += rdt; const p = Math.min(1, w.t / w.d); w.fn(w.ease(p)); if (p >= 1) { tweens.splice(i, 1); w.r(); } }
  let dt; if (S.freeze > 0) { S.freeze -= rdt; dt = 0; } else dt = rdt * S.ts;
  S.T += dt;

  player.moving = false;
  if (S.mode === 'walk' && S.holding && player.x < S.walkTo) {
    player.x = Math.min(S.walkTo, player.x + 54 * dt); player.moving = true; player.walkT += dt;
    if (!FOOT.length || player.x - FOOT[FOOT.length - 1].x > 4) { FOOT.push({ x: R(player.x), alt: FOOT.length & 1 }); if (FOOT.length > 260) FOOT.shift(); }
    if (Math.random() < dt * 10) part({ k: 'px', x: player.x - 3, y: GY, vx: rand(-14, -4), vy: rand(-18, -6), g: 60, life: 0.35, cols: ['#ffffff', '#c4e2f6'] });
  }
  if (S.mode === 'walk' && player.x >= S.walkTo && S.walkRes) { const r = S.walkRes; S.walkRes = null; r(); }

  const a = player.atk;
  if (a) {
    a.t += dt;
    if (!a.slash && a.t >= 0.045) { a.slash = true; spawnSlash(a.kind, a.fin); }
    if (!a.hit && a.t >= 0.08) { a.hit = true; doHit(a); }
    player.lunge = a.t < 0.045 ? -1 : a.t < 0.17 ? 4 : 4 * (1 - (a.t - 0.17) / 0.08);
    if (a.t >= 0.25) { player.atk = null; player.lunge = 0; if (player.queued && S.mode === 'battle') { player.queued = false; startAttack(); } else player.queued = false; }
  }

  if (enemy) {
    const e = enemy;
    e.t += dt; e.recoil = Math.max(0, (e.recoil || 0) - dt); e.flash = Math.max(0, e.flash - dt); e.kb *= Math.pow(0.002, dt); e.hpShow = Math.max(0, e.hpShow - dt);
    for (const b of e.broke) b.t += dt; e.broke = e.broke.filter(b => b.t < 0.5);
    if (e.state === 'dying') {
      e.dieAt += dt;
      if (!e.done && e.dieAt > 0.02) {
        e.done = true;
        if (e.type === 'ginger') { dissolve('crumble'); e.alpha = 0; }
        else if (e.type === 'snow') {
          dissolve('burst'); snowPowder(e.x, GY - 14, 60); e.alpha = 0;
          for (let k = 0; k < 24; k++) part({ k: 'px', x: e.x + rand(-6, 6), y: GY - 8, vx: rand(-70, 70), vy: rand(-110, -30), g: 240, life: rand(0.6, 1.1), cols: [pick(['#ffffff', '#b5d9ec', '#e0f5ff'])], ground: true, bounce: 0.2 });
        } else { e.state = 'knocked'; e.kb = 0; e.kbv = 90; }
        if (e.res) { const r = e.res; e.res = null; setTimeout(r, 0); }
      }
    }
    if (e.state === 'knocked') { e.x += e.kbv * dt; e.kbv *= Math.pow(0.02, dt); if (e.kbv < 3) { e.state = 'dazed'; e.dizzy = true; } }
  }

  if (bambi.guide) {
    const target = Math.min(player.x + 92, TREE_X + 30);
    if (bambi.x < target - 1) { bambi.x += Math.min(72 * dt, target - bambi.x); bambi.moving = true; bambi.walkT += dt; } else bambi.moving = false;
  }

  for (const b of BUN) {
    if (b.hop) {
      b.hop.t += dt; const p = b.hop.t / 0.42;
      if (p >= 1) { b.x = b.hop.x1; b.hop = null; b.jy = 0; b.f = 0; BUN = []; for (let k = 0; k < 4; k++) part({ k: 'px', x: b.x + rand(-4, 4), y: GY, vx: rand(-14, 14), vy: rand(-16, -6), g: 60, life: 0.35, cols: ['#ffffff', '#c4e2f6'] }); }
      else { b.x = b.hop.x0 + (b.hop.x1 - b.hop.x0) * p; b.jy = -Math.sin(p * Math.PI) * 7; b.f = p < 0.3 ? 1 : p < 0.85 ? 2 : 3; }
      continue;
    }
    if (S.mode === 'walk' && player.visible && Math.abs(b.x - player.x) < 35) {
      b.hop = { t: 0, x0: b.x, x1: b.x - 16 };
    }
  }
  for (let i = P.length - 1; i >= 0; i--) {
    const p = P[i];
    if (p.delay > 0) { p.delay -= dt; continue; }
    p.life -= dt; if (p.life <= 0) { P.splice(i, 1); continue; }
    if (p.k === 'conv') { const f = easeIO(1 - p.life / p.max); p.x = p.x0 + (p.tx - p.x0) * f + Math.sin(f * 3.14) * p.cx; p.y = p.y0 + (p.ty - p.y0) * f + Math.sin(f * 3.14) * p.cy; continue; }
    p.vy += p.g * dt;
    if (p.drag) { const d = Math.pow(p.drag, dt * 60); p.vx *= d; p.vy *= d; }
    if (p.wob) p.x += Math.sin(S.T * p.wob + p.seed) * 6 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.vr) p.rot += p.vr * dt;
    if (p.ground && p.y > GY + 1) { p.y = GY + 1; p.vy *= -(p.bounce || 0.2); p.vx *= 0.55; if (p.vr) p.vr *= 0.5; if (Math.abs(p.vy) < 10) { p.vy = 0; p.g = 0; } }
  }
  for (const s of SLASH) s.t += dt; SLASH = SLASH.filter(s => s.t < s.dur * 2.6);
  for (const v of VL) v.life -= dt; VL = VL.filter(v => v.life > 0);
  for (const r of RAYS) { r.life -= dt; r.rot += dt * 0.5; } RAYS = RAYS.filter(r => r.life > 0);

  if (item) {
    item.t += rdt;
    if (item.fly) {
      item.ft += rdt; const f = easeIO(Math.min(1, item.ft / item.fd));
      item.x = item.fx + (item.tx - item.fx) * f; item.y = item.fy + (item.ty - item.fy) * f - Math.sin(f * 3.14) * 22;
      if (Math.random() < 0.7) part({ k: 'twinkle', x: item.x + rand(-3, 3), y: item.y + rand(-2, 3), vx: rand(-8, 8), vy: rand(-6, 12), g: 10, life: rand(0.4, 0.8), cols: [pick(['#ffd76a', '#ffffff', '#ff9fc0'])], emit: true });
      if (f >= 1) { item.fly = false; if (item.res) { const r = item.res; item.res = null; r(); } }
    }
  }

  let camT;
  if (S.camLock != null) camT = S.camLock;
  else if (enemy && S.mode !== 'walk') camT = (player.x + enemy.x) / 2 - LW / 2;
  else camT = player.x - LW * 0.34;
  const prev = S.cam; S.cam += (camT - S.cam) * Math.min(1, rdt * 3.5); const dc = S.cam - prev;
  for (const f of FLAKES) { f.y += f.vy * rdt; f.x += Math.sin(S.T * f.w + f.p) * 4 * rdt - dc * f.z; if (f.y > LH) { f.y = -2; f.x = rand(0, LW); } if (f.x < -2) f.x += LW + 4; if (f.x > LW + 2) f.x -= LW + 4; }
  if (S.shakeT > 0) { S.shakeT -= rdt; const m = S.shakeM * clamp(S.shakeT / 0.25, 0.3, 1); S.sx = R(rand(-m, m)); S.sy = R(rand(-m, m)); if (S.shakeT <= 0) { S.sx = S.sy = 0; S.shakeM = 0; } }
  S.flash = Math.max(0, S.flash - rdt * 5);
  for (let i = 0; i < 3; i++) S.hudFlash[i] = Math.max(0, S.hudFlash[i] - rdt);
}

/* ---------- 렌더 ---------- */
function drawSp(img, x, y, flip, alpha) {
  x = R(x); y = R(y); if (alpha != null) ctx.globalAlpha = alpha;
  if (flip) { ctx.save(); ctx.translate(x + img.width, y); ctx.scale(-1, 1); ctx.drawImage(img.hires || img, 0, 0, img.width, img.height); ctx.restore(); } else ctx.drawImage(img.hires || img, x, y, img.width, img.height);
  ctx.globalAlpha = 1;
}
const TREE_BOW = spr([
  '.dd.....dd.', 'dhhdd.ddhhd', 'dhrrdkdrrhd', 'drrrdkdrrrd',
  '.ddrdkdrdd.', '...dr.rd...', '..dr...rd..', '..dd...dd..'
], { d: '#823447', r: '#da535e', h: '#ff9992', k: '#f5c779' }, NO);
const BLUE_PRESENT = spr([
  '...dd.dd...', '..dbbdbbd..', '.ddddbdddd.', 'dccccbccccd',
  'dbbbbhbbbbd','dddddhddddd','.dbbbhbbbd.','.dbbbhbbbd.','.ddddddddd.'
], { d:'#34456a', b:'#668bd0', c:'#92bce5', h:'#fff0bc' }, NO);
function decorateTree(tree, bulbs, x, oy, level, centerpiece) {
  if (!level || (!centerpiece && !bulbs.some(b => b.on && S.T >= b.at))) return;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#c4a35d'; ctx.lineWidth = 0.65;
  for (let j = 1; j < bulbs.length; j++) {
    const a = bulbs[j - 1], b = bulbs[j];
    if (Math.abs(a.ly - b.ly) > 5 || b.lx <= a.lx) continue;
    ctx.beginPath(); ctx.moveTo(x + a.lx, GY + 3 + a.ly + oy);
    ctx.quadraticCurveTo(x + (a.lx + b.lx) / 2, GY + 6 + Math.max(a.ly, b.ly) + oy, x + b.lx, GY + 3 + b.ly + oy); ctx.stroke();
    ctx.fillStyle = '#f4d38a';
    ctx.fillRect(R(x + (a.lx + b.lx) / 2), R(GY + 4.5 + (a.ly + b.ly) / 2 + oy), 1, 1);
  }
  if (level >= 2) bulbs.forEach((bulb, index) => {
    if (index % 2) return;
    const bx = R(x + bulb.lx), by = GY + 7 + bulb.ly + oy;
    const palette = ['#cc5064', '#83b9e2', '#cea3de', '#edbd64'];
    ctx.fillStyle = '#c9a56a';
    ctx.fillRect(bx, by - 3, 1, 2);
    if (level >= 3 && index % 16 === 4) {
      drawSp(TREE_BOW, bx - 5, by - 2);
    } else if (level >= 3 && index % 8 === 2) {
      // Hooked peppermint cane, with alternating cream and berry bands.
      ctx.fillStyle = '#8e394c';
      ctx.fillRect(bx - 2, by - 1, 4, 2);
      ctx.fillRect(bx - 3, by, 2, 2);
      ctx.fillRect(bx, by, 2, 6);
      ctx.fillStyle = '#fff1d5';
      ctx.fillRect(bx - 2, by - 1, 2, 1);
      ctx.fillRect(bx, by + 1, 2, 1);
      ctx.fillRect(bx, by + 4, 2, 1);
    } else if (level >= 3 && index % 8 === 6) {
      starGem(bx, by + 1, 3.2, '#ffcd64', 0);
      ctx.fillStyle = '#fff1ba'; ctx.fillRect(bx - 1, by, 1, 1);
    } else {
      ctx.fillStyle = '#655068';
      ctx.fillRect(bx - 1, by - 1, 3, 5);
      ctx.fillRect(bx - 2, by, 5, 3);
      ctx.fillStyle = palette[Math.floor(index / 4) % palette.length];
      ctx.fillRect(bx - 1, by, 3, 3);
      ctx.fillStyle = '#fff6dc'; ctx.fillRect(bx - 1, by, 1, 1);
    }
  });
  ctx.restore();
}
// Strings of warm lights and hanging stars transform the forest canopy.
function drawForestCanopy(cam, oy, lit) {
  if ((S.festival || 0) < 2) return;
  for (let i = 1; i < NEAR.length; i++) {
    const a = NEAR[i - 1], b = NEAR[i];
    if (b.x < cam - 30 || a.x > cam + LW + 30 || b.x - a.x > 65) continue;
    if (![a, b].every(t => t.bulbs.some(v => v.on && S.T >= v.at))) continue;
    const x0 = a.x - cam, x1 = b.x - cam;
    const y0 = GY - Math.min(72, a.pine.h * .72) + oy, y1 = GY - Math.min(72, b.pine.h * .72) + oy;
    ctx.strokeStyle = '#7d8d66'; ctx.lineWidth = .75; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0+x1)/2, Math.max(y0,y1)+12, x1,y1); ctx.stroke();
    for(let j=1;j<8;j++) {
      const u=j/8, x=x0+(x1-x0)*u, y=(1-u)*(1-u)*y0+2*(1-u)*u*(Math.max(y0,y1)+12)+u*u*y1;
      const col=j%2?'#ffe2a1':'#f0a3a4';
      lit.push(R(x), R(y), {col, at: S.decorAt, seed:i+j});
      if(S.festival>=3 && j%2===0) {line(x,y,x,y+5,'#c0a471');starGem(x,y+7,2.2,'#f1cc79',0);}
    }
  }
}
function starGem(x,y,r,col,rotation) {
  ctx.fillStyle=col;ctx.beginPath();
  for(let i=0;i<10;i++){const a=rotation-Math.PI/2+i*Math.PI/5,d=i%2?r*.45:r;const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();
}

const whiteCache = new Map();
function whiteOf(img) { if (whiteCache.has(img)) return whiteCache.get(img); const c = mkCanvas(img.width, img.height), g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); if (img.hires) { c.hires = mkCanvas(img.hires.width, img.hires.height); const h = c.hires.getContext('2d'); h.drawImage(img.hires, 0, 0); h.globalCompositeOperation = 'source-in'; h.fillStyle = '#fff'; h.fillRect(0, 0, c.hires.width, c.hires.height); } whiteCache.set(img, c); return c; }
const LIGHTS = [];
function addL(x, y, r, i) { if (x + r < 0 || x - r > LW || y + r < 0 || y - r > LH) return; LIGHTS.push(x, y, r, i); }
function computeDark() {
  lightBuf.fill(0);
  for (let n = 0; n < LIGHTS.length; n += 4) {
    const lx = LIGHTS[n], ly = LIGHTS[n + 1], r = LIGHTS[n + 2], I = LIGHTS[n + 3], r2 = r * r;
    const x0 = Math.max(0, Math.floor(lx - r)), x1 = Math.min(LW - 1, Math.ceil(lx + r)), y0 = Math.max(0, Math.floor(ly - r)), y1 = Math.min(LH - 1, Math.ceil(ly + r));
    for (let y = y0; y <= y1; y++) { const dy = y - ly, row = y * LW; for (let x = x0; x <= x1; x++) { const dx = x - lx, d2 = dx * dx + dy * dy; if (d2 >= r2) continue; let f = 1 - Math.sqrt(d2) / r; f = f * f * (3 - 2 * f); lightBuf[row + x] += f * I; } }
  }
  const D = darkImg.data, amb = S.amb, s0 = GY - 80, s1 = GY - 30;
  for (let y = 0; y < LH; y++) {
    const ra = y < s0 ? amb * 0.35 : y < s1 ? amb * (0.35 + 0.65 * (y - s0) / (s1 - s0)) : amb, row = y * LW, by = (y & 3) << 2;
    for (let x = 0; x < LW; x++) { const v = ra * (1 - Math.min(1, lightBuf[row + x])), lv = Math.floor(v * 7 + BAYER[(x & 3) + by]); D[(row + x) * 4 + 3] = lv <= 0 ? 0 : Math.min(245, lv * 35); }
  }
  darkCtx.putImageData(darkImg, 0, 0);
}
function feetY(sp) { return GY - sp.height + 1; }
function render() {
  const cam = S.cam - S.sx, oy = S.sy, T = S.T;
  LIGHTS.length = 0; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(skyCv, 0, 0);
  for (const s of STARS) { const tw = Math.sin(T * s.s + s.p); if (tw > -0.3) { const c = s.y2 ? '#fff2b0' : '#ffffff'; ctx.fillStyle = tw > 0.6 ? c : '#5d6788'; ctx.fillRect(R(s.x), R(s.y), 1, 1); if (s.b && tw > 0.75) sparkle(s.x, s.y, c, 1); } }
  // 초승달
  const mx = LW - 28, my = 26;
  ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(mx, my, 8, 0, 6.29); ctx.fill();
  ctx.fillStyle = SKY[0]; ctx.beginPath(); ctx.arc(mx + 4, my - 3, 7, 0, 6.29); ctx.fill();
  for (const t of FAR) { const xx = ((t.x - cam * 0.16) % 640 + 640) % 640 - 40; if (xx > -30 && xx < LW + 30) { const v = farV[t.v]; ctx.drawImage(v.cv, R(xx - v.ax), GY - v.h + 2 + t.dy + oy); } }
  for (const t of MID) { const xx = t.x - cam * 0.45; if (xx > -30 && xx < LW + 30) { const v = midV[t.v]; ctx.drawImage(v.cv, R(xx - v.ax), GY - v.h + 3 + t.dy + oy); } }
  const gx = -(((R(cam) % 128) + 128) % 128);
  ctx.drawImage(groundCv, gx, GY + oy); ctx.drawImage(groundCv, gx + 128, GY + oy);
  const lit = [];
  drawForestCanopy(cam, oy, lit);
  for (const t of NEAR) {
    const xx = t.x - cam; if (xx < -30 || xx > LW + 30) continue;
    ctx.drawImage(t.pine.cv, R(xx - t.pine.ax), GY - t.pine.h + 3 + oy);
    decorateTree(t.pine, t.bulbs, xx, oy, S.festival || 0, false);
    for (const b of t.bulbs) { const bx = R(xx + b.lx), by = GY + 3 + b.ly + oy; if (b.on && T >= b.at) lit.push(bx, by, b); else { ctx.fillStyle = '#1a2a33'; ctx.fillRect(bx, by, 1, 1); } }
  }
  if (BIG.tree) {
    const t = BIG.tree, xx = TREE_X - cam;
    if (xx > -60 && xx < LW + 60) {
      drawSp(t.cv, xx - t.ax, GY - t.h + 3 + oy);
      decorateTree(t, t.bulbs, xx, oy, S.festival || 0, true);
      for (const o of t.orn) { const ox = R(xx + o.lx), oy2 = GY + 3 + o.ly + oy; ctx.fillStyle = OL; ctx.fillRect(ox - 1, oy2, 4, 2); ctx.fillRect(ox, oy2 - 1, 2, 4); ctx.fillStyle = o.col; ctx.fillRect(ox, oy2, 2, 2); ctx.fillStyle = '#fff'; ctx.fillRect(ox, oy2, 1, 1); }
      for (const b of t.bulbs) { const bx = R(xx + b.lx), by = GY + 3 + b.ly + oy; if (b.on && T >= b.at) lit.push(bx, by, b); else { ctx.fillStyle = '#1a2a33'; ctx.fillRect(bx, by, 1, 1); } }
      if (S.festival >= 3) {
        drawSp(GIFT, xx - 24, GY + oy + 1 - GIFT.height);
        drawSp(BLUE_PRESENT, xx - 1, GY + oy + 2 - BLUE_PRESENT.height);
        drawSp(GIFT, xx + 16, GY + oy + 3 - GIFT.height);
      }

    }
  }
  ctx.fillStyle = '#86a8d0'; for (const f of FOOT) { const xx = R(f.x - cam); if (xx > -2 && xx < LW + 2) ctx.fillRect(xx - 3 + f.alt * 3, GY + 2 + f.alt + oy, 2, 1); }
  for (const p of PROPS) { const im = TREE_IMG[p.n], xx = p.x - cam; if (!im || xx < -30 || xx > LW + 30) continue; drawSp(im, xx - im.width / 2, GY - im.height + 2 + p.dy + oy, p.flip); }
  const BI = TREE_IMG.bunny;
  if (BI && !S.party) { const cw = BI.width / 4; for (const b of BUN) {
    const xx = R(b.x - cam - cw / 2); if (xx < -20 || xx > LW + 20) continue;
    const y = R(GY - BI.height + 1 + oy + b.jy + [0, -5, -3, 0][b.f]);
    ctx.save(); if (b.dir < 0) { ctx.translate(xx + cw, y); ctx.scale(-1, 1); ctx.drawImage(BI, b.f * cw, 0, cw, BI.height, 0, 0, cw, BI.height); } else ctx.drawImage(BI, b.f * cw, 0, cw, BI.height, xx, y, cw, BI.height); ctx.restore();
  } }
  for (const q of GUESTS) {
    if (S.T < q.at) continue;
    if (!q.shown) { q.shown = true; puff(q.x, GY - 6, 6); burstTwinkle(q.x, GY - 10, 6, 30, ['#ffd76a', '#fff']); }
    const sprite = partyArmsUp(T, q.seed) && q.c.cheer ? q.c.cheer : q.c;
    drawSp(sprite, q.x - cam - sprite.width / 2, GY + 1 + oy - sprite.height);

  }
  drawParts(false, cam, oy);
  if (sol.visible) { const sp = S.party ? (partyArmsUp(T, .08) ? CH.sol.cheer : CH.sol.front) : sol.cheer && (T * 4 | 0) % 2 ? CH.sol.cheer : CH.sol.F[(T * 2 | 0) % 4]; drawSp(sp, sol.x - sp.width / 2 - cam, feetY(sp) + oy - (S.party ? 0 : (T * 1.5 | 0) % 2)); }
  const bp = bambiPose(cam, oy);
  if (bambi.visible) drawSp(bp.sp, bp.x, bp.y, bp.flip);
  if (enemy && enemy.alpha > 0) drawEnemy(cam, oy);
  if (player.visible && PF) drawPlayer(cam, oy);
  if (item && item.visible) { const bob = item.fly ? 0 : R(Math.sin(item.t * 4) * 1.5); drawSp(item.sp, item.x - item.sp.width / 2 - cam, item.y - item.sp.height / 2 + bob + oy); }
  const starX = TREE_X - cam, starY = GY + 3 + (BIG.tree ? BIG.tree.top : 0) - 4 + oy;
  if (BIG.star) drawSp(STAR, starX - 5, starY - 6);

  // 빛
  if (player.visible && S.mode !== 'custom') addL(player.x - cam, GY - 12 + oy, 38 + S.pieces * 7, 1);
  if (S.mode === 'custom') addL(LW / 2, LH * 0.25, 70, 1.2);
  if (enemy && enemy.alpha > 0) addL((player.x + enemy.x) / 2 - cam, GY - 12 + oy, 54, 0.55);
  const { noseX, noseY } = bp;
  if (bambi.visible) addL(noseX, noseY, 28, 0.75 + 0.15 * Math.sin(T * 5));
  for (let i = 0; i < lit.length; i += 3) { const b = lit[i + 2]; addL(lit[i], lit[i + 1], BIG.lit ? 14 : 11, 0.42 * (0.8 + 0.2 * Math.sin(T * 3 + b.seed))); }
  for (const v of VL) addL(v.x - cam, v.y + oy, v.r, v.i * (v.life / v.max));
  if (item && item.visible) addL(item.x - cam, item.y + oy, 28, 0.85);
  if (BIG.star) addL(starX, starY, BIG.lit ? 76 : 36, BIG.lit ? 1.1 : 0.8);
  computeDark(); ctx.drawImage(darkCv, 0, 0);

  // 발광
  drawGlow(mx, my, 22, '#3a3a5e', 1);
  if (player.visible && S.mode !== 'custom') drawGlow(player.x - cam, GY - 12 + oy, 16, '#2a2212', 0.8);
  for (let i = 0; i < lit.length; i += 3) {
    const b = lit[i + 2], tw = Math.sin(T * (2.1 + .55 * Math.sin(b.seed)) + b.seed), age = T - b.at;
    ctx.fillStyle = b.col; ctx.fillRect(lit[i], lit[i + 1], 1, 1);
    if (tw > .91) sparkle(lit[i], lit[i + 1], '#fff6d1', tw > .985 ? 2 : 1);
    drawGlow(lit[i], lit[i + 1], 7, b.col, 0.60 + 0.36 * tw);
    if (age < 0.25) flareAt(lit[i], lit[i + 1], R(5 * (1 - age / 0.25)) + 1, '#fff', b.col);
  }
  if (bambi.visible) { drawGlow(noseX, noseY, 5, '#ff3344', 0.85 + 0.15 * Math.sin(T * 5)); }
  if (item && item.visible) { const bob = item.fly ? 0 : R(Math.sin(item.t * 4) * 1.5); drawGlow(item.x - cam, item.y + oy + bob, 13, '#ffcf6a', 0.8); if ((item.t * 6 | 0) % 3 === 0) sparkle(item.x - cam + 6, item.y - 5 + oy + bob, '#fff', 1); }
  if (BIG.star) { drawGlow(starX, starY, BIG.lit ? 24 : 13, '#ffcf6a', 0.9); if (BIG.lit) flareAt(starX, starY, 7 + R(Math.sin(T * 4) * 2), '#fff', '#ffe08a'); }
  if (S.festival >= 2) {
    for(const t of NEAR){const x=t.x-cam;if(x < -20 || x > LW+20 || !t.bulbs.some(b=>b.on&&T>=b.at))continue;
      for(let j=0;j<S.festival;j++){const phase=T*.45+t.x*.17+j*2.1,px=x+Math.sin(phase)*12,py=GY-t.pine.h*(.3+j*.18)+Math.cos(phase)*4+oy;
        ctx.save();ctx.globalAlpha=.35+.3*Math.sin(phase)**2;starGem(px,py,1.3,'#ffe3a0',phase);ctx.restore();}
    }
  }
  if(BIG.lit){for(let j=0;j<3;j++){const a=T*.7+j*2.094;starGem(starX+Math.cos(a)*10,starY+Math.sin(a)*5,1.5,'#fff2bd',a);}}
  drawRays(cam, oy);
  for (const s of SLASH) drawSlash(s, cam, oy);
  drawParts(true, cam, oy);
  for (const f of FLAKES) { ctx.fillStyle = f.z > 1 ? '#eef4ff' : '#8d9cc4'; ctx.fillRect(R(f.x), R(f.y), f.z > 1.15 ? 2 : 1, f.z > 1.15 ? 2 : 1); }
  if (S.hud) drawHUD();
  if (enemy && enemy.alpha > 0 && enemy.state !== 'dying' && enemy.state !== 'enter' && enemy.hpShow > 0) drawHearts(cam, oy);
  if (S.flash > 0) { ctx.globalAlpha = Math.min(1, S.flash); ctx.fillStyle = S.flashC; ctx.fillRect(0, 0, LW, LH); ctx.globalAlpha = 1; }
}
function drawPlayer(cam, oy) {
  const F = PF.F; let sp = F[(S.T * 2 | 0) % 4]; const a = player.atk;
  if (a) sp = a.t < 0.045 ? F[8] : a.t < 0.17 ? F[9] : F[10];
  else if (player.cheer) sp = F[S.party && !partyArmsUp(S.T) ? 0 : 11];
  else if (player.moving) sp = F[4 + (player.walkT * 9 | 0) % 4];
  const x = player.x - sp.width / 2 - cam + player.lunge, y = feetY(sp) + oy;
  if (a && a.t < 0.045) cane(x, y, [[12, 24], [12, 23], [11, 22], [11, 21], [10, 20], [10, 19], [10, 18], [11, 17], [12, 17], [13, 18]]);
  drawSp(sp, x, y);
  if (a && a.t >= 0.045 && a.t < 0.17) cane(x, y, [[24, 23], [25, 23], [26, 23], [27, 23], [28, 23], [29, 23], [30, 22], [31, 22], [32, 23], [32, 24]]);
}
function cane(x, y, pts) { pts.forEach(([px, py], i) => { ctx.fillStyle = (i >> 1) % 2 ? '#e8344a' : '#ffffff'; ctx.fillRect(R(x + px), R(y + py), 1, 1); }); }
const MONSTER_MOTION = {
  ginger: { tempo: 1.55, jump: 4, tilt: .16, squash: .09 },
  snow: { tempo: 1.15, jump: 3, tilt: .045, squash: .18 },
  elf: { tempo: 1.8, jump: 5, tilt: .1, squash: .07 }
};
function drawMonsterPose(sprite, center, feet, tilt, squash, alpha) {
  ctx.save();
  ctx.translate(R(center), R(feet));
  ctx.rotate(tilt);
  ctx.scale(1 + squash, 1 - squash);
  drawSp(sprite, -sprite.width / 2, -sprite.height, false, alpha);
  ctx.restore();
}
function drawEnemy(cam, oy) {
  const e = enemy; let bob = 0, sx = 0;
  if (e.state === 'idle' || e.state === 'battle') { if (e.type === 'ginger') bob = -R(Math.abs(Math.sin(e.t * 7)) * 3); else if (e.type === 'snow') sx = R(Math.sin(e.t * 2.2)); else bob = -R(Math.abs(Math.sin(e.t * 5)) * 2); }
  const x = e.x - e.w / 2 - cam + e.kb + sx, y = GY - e.h + 1 + oy + bob + e.oy;
  if (e.clip > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x - 6, 0, e.w + 12, GY + 1 + oy); ctx.clip(); drawSp(e.sp, x, y + e.clip); ctx.restore(); }
  else if (e.recoil > 0) {
    const progress = 1 - e.recoil / .32;
    const kick = Math.sin(progress * Math.PI * 2) * (1 - progress);
    const pose = MONSTER_MOTION[e.type];
    const hit = e.sp.hit || e.sp;
    drawMonsterPose(hit, x + e.w / 2,
      y + e.h - Math.max(0, kick) * pose.jump, kick * (pose.tilt + .12),
      kick * pose.squash, e.alpha);
  }
  else drawSp(e.flash > 0 ? whiteOf(e.sp) : e.sp, x, y, false, e.alpha < 1 ? e.alpha : null);

  if (e.dizzy) for (let i = 0; i < 3; i++) { const an = S.T * 5 + i * 2.09; sparkle(x + 12 + Math.cos(an) * 9, y + 8 + Math.sin(an) * 2, '#ffd25e', 1); }
}
function drawHearts(cam, oy) {
  const e = enemy, n = e.max, w = n * 8 - 1, x0 = R(e.x - w / 2 - cam), y = R(GY - e.h - 10 + oy);
  for (let i = 0; i < n; i++) {
    const br = e.broke.find(b => b.i === i), x = x0 + i * 8;
    if (i < e.hp) drawSp(HEART_FULL, x, y);
    else { drawSp(HEART_EMPTY, x, y); if (br) { const f = br.t / 0.5; ctx.fillStyle = '#ff4a62'; for (let k = 0; k < 4; k++) ctx.fillRect(R(x + 3 + (k - 1.5) * 3 * f * 2), R(y + 2 - 6 * f + 12 * f * f + (k & 1)), 1, 1); } }
  }
}
function drawHUD() {
  const x0 = R(LW / 2 - 21), y = 8;
  ctx.fillStyle = 'rgba(14,18,32,.6)'; ctx.fillRect(x0 - 3, y - 3, 48, 15);
  for (let i = 0; i < 3; i++) {
    const x = x0 + i * 15;
    if (i < S.pieces) { drawSp(ENVELOPE, x, y); if (S.hudFlash[i] > 0) { drawGlow(x + 6, y + 4, 11, '#ffcf6a', S.hudFlash[i]); flareAt(x + 6, y + 4, R(7 * S.hudFlash[i]) + 1, '#fff', '#ffe08a'); } }
    else drawSp(ENVELOPE_EMPTY, x, y);
  }
}
function drawSlash(s, cam, oy) {
  if (s.t < 0) return;
  const p = Math.min(1, s.t / s.dur), dir = Math.sign(s.a1 - s.a0), head = s.a0 + (s.a1 - s.a0) * easeOut(p);
  const tp = clamp((s.t - s.dur * 0.35) / (s.dur * 1.6), 0, 1), tail = s.a0 + (s.a1 - s.a0) * (1 - Math.pow(1 - tp, 2)), span = Math.abs(head - tail);
  if (span < 0.02) return;
  const cx = s.x - cam, cy = s.y + oy;
  for (let a = tail; dir > 0 ? a <= head : a >= head; a += dir * 0.03) {
    const along = Math.abs(a - tail) / span, thick = (s.r2 - s.r1) * (0.15 + 0.85 * Math.pow(along, 0.7));
    for (let r = s.r2 - thick; r <= s.r2; r += 0.6) {
      const x = R(cx + Math.cos(a) * r), y = R(cy + Math.sin(a) * r);
      if (along < 0.35 && ((x + y) & 1)) continue;
      let c = along > 0.88 ? '#ffffff' : r > s.r2 - 0.7 ? '#ffe08a' : r > s.r2 - thick * .5 ? '#fff0ca' : '#dc6272';
      if (s.big && r < s.r2 - thick + 1.2) c = '#a84058';
      ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1);
    }
  }
  if (p < 1) { const hx = cx + Math.cos(head) * (s.r2 - 1), hy = cy + Math.sin(head) * (s.r2 - 1); drawGlow(hx, hy, 6, '#ffe8b0', 0.8); sparkle(hx, hy, '#fff', 1); }
}
function drawRays(cam, oy) {
  for (const r of RAYS) {
    const f = r.life / r.max, cx = r.x - cam, cy = r.y + oy, L = r.len * (0.4 + 0.6 * Math.min(1, (1 - f) * 4)); ctx.fillStyle = r.col;
    for (let k = 0; k < r.n; k++) { const a = r.rot + k * 6.283 / r.n, ll = L * (k % 2 ? 0.65 : 1);
      for (let d = 5; d < ll; d++) { const x = R(cx + Math.cos(a) * d), y = R(cy + Math.sin(a) * d); if (bay(x, y) > (1 - d / ll) * f * 1.6) continue; ctx.fillRect(x, y, 1, 1); } }
  }
}
function drawParts(emit, cam, oy) {
  for (const p of P) {
    if (!!p.emit !== emit || p.delay > 0) continue;
    const x = p.x - cam, y = p.y + oy, c = colOf(p), f = 1 - p.life / p.max;
    switch (p.k) {
      case 'px': ctx.fillStyle = c; ctx.fillRect(R(x), R(y), p.s, p.s); break;
      case 'streak': line(x, y, x - p.vx * 0.025, y - p.vy * 0.025, c); pxl(x, y, f < 0.4 ? '#fff' : c); break;
      case 'twinkle': { const on = ((p.life * 14 + p.seed) | 0) % 3; if (on || f < 0.2) sparkle(x, y, c, p.big && on === 1 ? 1 : 0); break; }
      case 'confetti': { ctx.fillStyle = c; const w = Math.abs(Math.sin(S.T * p.wob + p.seed)) > 0.5; ctx.fillRect(R(x), R(y), w ? 2 : 1, w ? 1 : 2); break; }
      case 'ring': { const r = p.r0 + (p.r1 - p.r0) * easeOut(f), n = Math.max(12, R(r * 6.3)); ctx.fillStyle = c;
        for (let i = 0; i < n; i++) { const a = i / n * 6.283, xx = R(x + Math.cos(a) * r), yy = R(y + Math.sin(a) * r * 0.9); if (f > 0.5 && bay(xx, yy) < (f - 0.5) * 2) continue; ctx.fillRect(xx, yy, 1, 1); } break; }
      case 'flare': drawGlow(x, y, R(p.L * 0.9) + 2, '#ffd890', 1 - f); flareAt(x, y, p.L * Math.pow(1 - f, 0.6), '#fff', f < 0.3 ? '#fff6c8' : '#ffd25a'); break;
      case 'puff': { const r = p.r0 + (p.r1 - p.r0) * easeOut(f); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(R(x), R(y), r, 0, 6.29); ctx.fill(); break; }
      case 'conv': sparkle(x, y, c, f > 0.6 ? 1 : 0); line(x, y, x + (p.x0 - p.x) * 0.08, y + (p.y0 - p.y) * 0.08, c); break;
      case 'carrot': { const a = p.rot; ctx.fillStyle = '#ff8a2a'; for (let i = -2; i <= 2; i++) ctx.fillRect(R(x + Math.cos(a) * i), R(y + Math.sin(a) * i), 1, 1); ctx.fillStyle = '#3fa66a'; ctx.fillRect(R(x - Math.cos(a) * 3), R(y - Math.sin(a) * 3), 1, 1); break; }
      case 'hat': { const a = p.rot; ctx.fillStyle = '#2b2540'; for (let i = -2; i <= 2; i++) for (let j = 0; j < 3; j++) ctx.fillRect(R(x + Math.cos(a) * i - Math.sin(a) * j), R(y + Math.sin(a) * i + Math.cos(a) * j), 1, 1); ctx.fillStyle = '#d8394a'; ctx.fillRect(R(x), R(y), 1, 1); break; }
    }
  }
}

/* ---------- 대사 / 입력 ---------- */
const dlg = $('#dlg'), dlgN = $('#dlgName'), dlgT = $('#dlgLine'), dlgX = $('#dlgNext'), dlgP = $('#dlgPic');
let dlgState = null;
function portrait(name) {
  dlgP.width = dlgP.height = 66; const g = dlgP.getContext('2d'); g.setTransform(3, 0, 0, 3, 0, 0); g.clearRect(0, 0, 22, 22); g.imageSmoothingEnabled = false;
  const src = { '밤비': CH.bambi.F[0], '솔': CH.sol.F[0], '솔 & 밤비': CH.sol.cheer, '진저 쿠키': EN.fuzz, '눈사람': EN.slime, '크리스마스 요정': EN.mush, '???': CH.sol.F[0] }[name];
  if (!src) return;
  const h = Math.min(22, src.height), dx = R((22 - src.width) / 2);
  if (src.width === 32 && ['밤비', '솔', '솔 & 밤비', '???'].includes(name)) g.drawImage(src.hires || src, 12, 9, 72, 66, 0, 1, 22, 20);
  else if (src.hires) g.drawImage(src.hires, 0, 0, src.hires.width, src.hires.height, 1, 0, 20, 22);
  else g.drawImage(src, 0, 0, src.width, h, dx, R((22 - h) / 2) + 1, src.width, h);
  if (name === '???') { g.globalCompositeOperation = 'source-in'; g.fillStyle = '#3c4566'; g.fillRect(0, 0, 22, 22); g.globalCompositeOperation = 'source-over'; }
}
function say(name, text) {
  return new Promise(res => {
    dlg.classList.remove('hide'); dlgN.textContent = name; dlgN.className = 'tag ' + ({ '밤비': 'red', '솔': 'gold', '???': 'gold', '솔 & 밤비': 'gold' }[name] || 'blue');
    portrait(name); $('#dlgText').dataset.full = text; dlgT.textContent = ''; dlgX.style.visibility = 'hidden';
    dlg.classList.remove('in'); void dlg.offsetWidth; dlg.classList.add('in');
    const st = { text, i: 0, done: false, res, tm: null }; dlgState = st;
    const tick = () => { st.i++; dlgT.textContent = text.slice(0, st.i); if (st.i >= text.length) { st.done = true; dlgX.style.visibility = 'visible'; } else st.tm = setTimeout(tick, 30); };
    st.tm = setTimeout(tick, 80);
  });
}
function dlgTap() {
  const st = dlgState; if (!st) return false;
  if (!st.done) { clearTimeout(st.tm); st.i = st.text.length; dlgT.textContent = st.text; st.done = true; dlgX.style.visibility = 'visible'; return true; }
  dlgState = null; dlg.classList.add('hide'); st.res(); return true;
}
const hintEl = $('#hint');
function hint(html) { hintEl.innerHTML = html; hintEl.classList.remove('hide'); }
function hideHint() { hintEl.classList.add('hide'); }
const waitTap = () => new Promise(r => { S.tapRes = r; });
const walkUntil = x => { S.mode = 'walk'; S.walkTo = x; return new Promise(r => { S.walkRes = r; }); };
function onDown(e) {
  if (e.target.closest && e.target.closest('button,input,#gate,.modal')) return;
  if (e.preventDefault) e.preventDefault();
  if (S.mode === 'title') { openGate(); return; }
  if (dlgTap()) return;
  if (S.tapRes) { const r = S.tapRes; S.tapRes = null; r(); return; }
  if (S.mode === 'walk') S.holding = true; else if (S.mode === 'battle') startAttack();
}
const onUp = () => { S.holding = false; };
app.addEventListener('pointerdown', onDown);
addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp); addEventListener('blur', onUp);
addEventListener('keydown', e => { if (e.target.tagName === 'INPUT' || e.repeat) return; if ([' ', 'Enter', 'ArrowRight'].includes(e.key)) onDown({ target: app }); });
addEventListener('keyup', e => { if ([' ', 'Enter', 'ArrowRight'].includes(e.key)) onUp(); });
app.addEventListener('contextmenu', e => e.preventDefault());

/* ---------- 이름 ---------- */
const nm = () => look.name || '손님';
function voc() { const n = look.name; if (!n) return '손님'; const c = n.charCodeAt(n.length - 1); return c >= 0xAC00 && c <= 0xD7A3 ? n + ((c - 0xAC00) % 28 ? '아' : '야') : n; }

/* ---------- 아이콘을 DOM에 ---------- */
function iconURL(sp, sc) { const c = mkCanvas(sp.width * sc, sp.height * sc), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sp, 0, 0, c.width, c.height); return c.toDataURL(); }
function placeIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => { const sp = { star: STAR, gift: GIFT, cane: ICON_CANE, cal: ICON_CAL, pin: ICON_PIN, env: ENVELOPE, heart: HEART_FULL }[el.dataset.icon]; if (sp) { el.src = iconURL(sp, 4); el.style.width = sp.width * (+el.dataset.s || 3) + 'px'; } });
}

/* ---------- 화면 흐름 ---------- */
function loadSaved() {
    try { if (localStorage.getItem('solbam_done')) $('#quick').classList.remove('hide'); } catch (e) {}
}
const saveLook = () => { try { localStorage.setItem('solbam_look', JSON.stringify(look)); } catch (e) {} };
function setScene(kind) {
  S.party = kind === 'title';
  S.festival = kind === 'title' ? 3 : 0; S.decorAt = -10;
  if (kind === 'title') {
    S.camLock = TREE_X - LW / 2; S.cam = S.camLock; S.amb = 0.3; BIG.lit = true; BIG.star = true;
    BIG.tree.bulbs.forEach(b => { b.on = true; b.at = 0; }); NEAR.forEach(t => t.bulbs.forEach(b => { b.on = true; b.at = 0; }));
    spawnParty(true);
  } else {
    S.camLock = null; BIG.lit = false; BIG.star = false; GUESTS = [];
    BIG.tree.bulbs.forEach(b => { b.on = false; }); NEAR.forEach(t => t.bulbs.forEach(b => { b.on = false; }));
    sol.x = TREE_X - 30; sol.cheer = false; player.cheer = false; bambi.cheer = false;
    sol.visible = true; bambi.visible = false; player.x = 30; S.cam = player.x - LW * 0.34;
  }
}
/* ---------- 이름 + 비밀번호 ---------- */
async function unlock(pw) {
  const raw = Uint8Array.from(atob(CONFIG.secret), c => c.charCodeAt(0));
  const salt = raw.slice(0, 16), iv = raw.slice(16, 28), data = raw.slice(28);
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  Object.assign(CONFIG, JSON.parse(new TextDecoder().decode(plain)));
}
function openGate() {
  S.mode = 'gate'; $('#title').classList.add('hide'); $('#gate').classList.remove('hide');
  try { $('#gName').value = localStorage.getItem('solbam_name') || ''; } catch (e) {}
}
async function submitGate() {
  const name = $('#gName').value.trim(), pw = $('#gPass').value.trim(), err = $('#gErr'), box = $('#gate');
  const fail = msg => { err.textContent = msg; box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); };
  if (!name) return fail('이름을 적어 주세요');
  err.textContent = '확인 중…';
  try { await unlock(pw); } catch (e) { return fail('비밀번호가 달라요'); }
  err.textContent = ''; look.name = name.slice(0, 8);
  try { localStorage.setItem('solbam_name', look.name); localStorage.setItem('solbam_pw', pw); } catch (e) {}
  document.activeElement && document.activeElement.blur();
  box.classList.add('hide'); startGame();
}
$('#gGo').addEventListener('click', submitGate);
$('#gName').addEventListener('keydown', e => { if (e.key === 'Enter') $('#gPass').focus(); });
$('#gPass').addEventListener('keydown', e => { if (e.key === 'Enter') submitGate(); });
function startGame() {
  $('#title').classList.add('hide'); PF = CH.player; player.visible = true; runGame();
}
$('#quick').addEventListener('click', async e => {
  e.stopPropagation();
  let pw = null, nm = ''; try { pw = localStorage.getItem('solbam_pw'); nm = localStorage.getItem('solbam_name') || ''; } catch (_) {}
  try { await unlock(pw || ''); look.name = nm; PF = CH.player; $('#title').classList.add('hide'); showCard(); } catch (_) { openGate(); }
});

/* ---------- 이야기 ---------- */
async function runGame() {
  setScene('game'); S.mode = 'cutscene'; S.hud = true; S.amb = AMB[0]; S.pieces = 0;
  await wait(500);
  bambi.visible = true; bambi.moving = true; bambi.left = true; const sx = S.cam + LW + 14, tx = player.x + 24;
  await tween(1.1, p => { bambi.x = sx + (tx - sx) * p; bambi.walkT += 0.03; });
  bambi.moving = false; burstTwinkle(bambi.x, GY - 24, 6, 20, ['#ffffff', '#ffd76a']);
  await say('밤비', `${voc()}, 큰일났어!`);
  await say('밤비', '장난꾸러기들이 트리 장식이랑\n초대장을 훔쳐 갔어!');
  await say('밤비', '같이 찾아줄래?\n나 먼저 가 있을게!');
  bambi.guide = true; bambi.left = false;
  hint('화면을 <b>꾹</b> 누르고 있으면 걸어가요');
  for (let i = 0; i < 3; i++) {
    if (i === 2) { await walkUntil(SOL_X); S.holding = false; hideHint(); await solVoice(); hint('<b>꾹</b> 눌러서 계속 가요'); }
    await walkUntil(EV[i].x - 32); S.holding = false; hideHint();
    await encounter(i);
    hint('<b>꾹</b> 눌러서 계속 가요');
  }
  await walkUntil(END_X); S.holding = false; hideHint();
  await ending();
}
async function encounter(i) {
  S.mode = 'cutscene'; const e = spawnEnemy(i), type = e.type;
  if (type === 'ginger') { const x1 = e.x, x0 = S.cam + LW + 14; e.state = 'idle'; await tween(0.9, p => { e.x = x0 + (x1 - x0) * easeOut(p); }); debris('ginger', e.x, GY, 3); }
  else if (type === 'snow') { e.clip = e.h; shake(1, 0.6); for (let k = 0; k < 4; k++) setTimeout(() => snowPowder(e.x, GY - 2, 10), k * 120); await tween(0.7, p => { e.clip = R(e.h * (1 - easeOut(p))); }); e.clip = 0; e.state = 'idle'; snowPowder(e.x, GY - 6, 24); }
  else {
    e.oy = -GY - 24;
    for (let k = 0; k < 14; k++) part({ k: 'px', x: e.x + rand(-14, 14), y: rand(GY - 70, GY - 40), vx: rand(-10, 10), vy: rand(0, 20), g: 40, life: rand(1, 1.6), cols: ['#e8f4fc', '#ffffff'] });
    await tween(0.5, p => { e.oy = (-GY - 24) * (1 - p * p); });
    e.oy = 0; e.state = 'idle'; shake(2, 0.15); snowPowder(e.x, GY - 2, 18); ring(e.x, GY, 2, 16, 0.3, ['#fff', '#b9c4ef']);
  }
  e.hpShow = 99;
  await say(e.name, e.line);
  S.mode = 'battle'; e.state = 'battle';
  hint(i === 0 ? '화면을 <b>톡톡</b> 눌러서 공격!' : '<b>톡톡톡!</b>');
  const iv = setInterval(() => { if (e.hp < e.max) { hideHint(); clearInterval(iv); } }, 100);
  await new Promise(r => { e.res = r; });
  clearInterval(iv); hideHint();
  await wait(type === 'elf' ? 1000 : 1000);
  let px = e.x;
  if (type === 'elf') {
    await say('크리스마스 요정', '에잇! 내가 졌으니까 초대장 줄게!\n파티에서 만나!');
    puff(e.x, GY - 11, 16); burstTwinkle(e.x, GY - 11, 14, 50, ['#ffd76a', '#5cff9a', '#ffffff']); ring(e.x, GY - 11, 2, 18, 0.35, ['#fff', '#b9b3ff']);
    px = e.x; e.alpha = 0; e.dizzy = false; await wait(500);
  }
  enemy = null;
  await lightUp(i);
  await pieceGet(i, px, GY - 22);
  S.mode = 'walk';
}
async function pieceGet(i, x, y) {
  for (let k = 0; k < 26; k++) { const a = k / 26 * 6.283, r = rand(22, 34); part({ k: 'conv', x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, x0: x + Math.cos(a) * r, y0: y + Math.sin(a) * r, tx: x, ty: y, cx: Math.cos(a + 1.6) * 8, cy: Math.sin(a + 1.6) * 8, life: rand(0.5, 0.7), cols: [pick(['#ffd76a', '#ffffff', '#ff9fc0', '#5cff9a'])], emit: true }); }
  vlight(x, y, 40, 0.6, 0.8);
  await wait(650);
  item = { sp: ENVELOPE, x, y, t: 0, visible: true };
  flareP(x, y, 14, 0.4); ring(x, y, 2, 24, 0.4, ['#fff', '#ffe08a', '#ffd25a']); burstTwinkle(x, y, 12, 50, ['#ffd76a', '#ffffff']); vlight(x, y, 70, 1.3, 0.6); shake(1, 0.1);
  await wait(700);
  player.cheer = true;
  Object.assign(item, { fly: true, ft: 0, fd: 0.6, fx: item.x, fy: item.y, tx: player.x, ty: GY - 32 });
  await new Promise(r => { item.res = r; });
  flareP(item.x, item.y, 10, 0.3); rays(item.x, item.y, 10, 22, 1.2, '#ffe08a'); burstTwinkle(item.x, item.y, 10, 40, ['#ffd76a', '#fff', '#ff9fc0']); vlight(item.x, item.y, 60, 1, 0.8);
  await wait(700);
  await showPiece(i);
  item.visible = false; player.cheer = false; S.pieces = i + 1; S.hudFlash[i] = 1;
  burstTwinkle(S.cam + LW / 2 - 21 + i * 15 + 6, 11, 8, 30, ['#ffd76a', '#fff']);
}
function showPiece(i) {
  return new Promise(res => {
    const m = $('#piece'), pc = CONFIG.pieces[i];
    $('#pn').textContent = i + 1; $('#pl').textContent = pc.label; $('#px').textContent = pc.text;
    $('#pslots').innerHTML = [0, 1, 2].map(k => `<img src="${iconURL(k <= i ? ENVELOPE : ENVELOPE_EMPTY, 4)}" class="${k === i ? 'new' : ''}">`).join('');
    m.classList.remove('hide'); const pp = m.querySelector('.letter'); pp.classList.remove('pop'); void pp.offsetWidth; pp.classList.add('pop');
    $('#pOk').onclick = e => { e.stopPropagation(); m.classList.add('hide'); res(); };
  });
}
async function lightUp(i) {
  S.festival = i + 1; S.decorAt = S.T;
  const a0 = S.amb, a1 = AMB[i + 1]; tween(1.8, p => { S.amb = a0 + (a1 - a0) * p; }, easeIO);
  ring(player.x, GY - 12, 3, 100, 1.8, ['#fff6ce', '#ffd76a']);
  burstTwinkle(player.x, GY - 18, 22, 45, ['#ffd76a', '#fff6ce', '#ef8a92']);
  for (const t of NEAR) {
    if (t.x > LIT_LIMIT[i]) continue;
    if (Math.abs(t.x - player.x) < 95) {
      const tx=t.x,ty=GY-t.pine.h*.65;
      for(let k=0;k<3;k++)part({k:'conv',x:player.x,y:GY-18,x0:player.x,y0:GY-18,tx:tx+k*3-3,ty:ty-k*5,cx:12,cy:-18,life:1.1+k*.15,cols:['#fff0b1'],emit:true});
      vlight(tx,ty,25,.65,2.3);
    }
    t.bulbs.forEach((b, j) => { if (!b.on) { b.on = true; b.at = S.T + Math.abs(t.x - player.x) * 0.004 + j * 0.04; } });
  }
  for (let k = 0; k < 24 + i * 8; k++) part({ k: 'twinkle', x: S.cam + rand(0, LW), y: GY - rand(15, 95), vx: rand(-3, 3), vy: -rand(3, 9), life: rand(1.4, 2.4), cols: [pick(['#ffd76a', '#fff6ce', '#ee9bad'])], emit: true, delay: k * 0.04 });
  await wait(2200);
}
async function solVoice() {
  S.mode = 'cutscene';
  for (let k = 0; k < 24; k++) part({ k: 'twinkle', x: S.cam + rand(LW * 0.4, LW + 10), y: rand(-10, 30), vx: rand(-14, -4), vy: rand(10, 24), g: 2, life: rand(1.6, 2.6), cols: [pick(['#ffd76a', '#fff6c8', '#ffffff'])], big: 1, emit: true, delay: k * 0.05 });
  await wait(600); await say('???', `호호호~ ${nm()}, 부탁해~!`);
}
async function ending() {
  S.mode = 'cutscene'; S.camLock = TREE_X - LW / 2 - 6;
  await wait(800);
  bambi.cheer = true; await say('밤비', `${voc()}, 다 찾았구나!\n고마워!`); bambi.cheer = false;
  sol.cheer = true; await say('솔', '호호호! 자, 마지막 장식은\n네가 달아줘!'); sol.cheer = false;
  item = { sp: STAR, x: player.x, y: GY - 32, t: 0, visible: true };
  player.cheer = true; flareP(item.x, item.y, 12, 0.4); burstTwinkle(item.x, item.y, 10, 40, ['#ffd76a', '#fff']);
  hint('화면을 <b>톡!</b> 눌러서 별을 달아 줘'); S.mode = 'tap';
  await waitTap();
  hideHint(); S.mode = 'cutscene'; player.cheer = false;
  const topY = GY + 3 + BIG.tree.top - 4;
  Object.assign(item, { fly: true, ft: 0, fd: 0.9, fx: item.x, fy: item.y, tx: TREE_X, ty: topY });
  await new Promise(r => { item.res = r; });
  item.visible = false; BIG.star = true;
  flash(0.3, '#fff6d0'); shake(3, 0.3);
  flareP(TREE_X, topY, 22, 0.5); ring(TREE_X, topY, 2, 40, 0.5, ['#fff', '#ffe08a', '#ffd25a']); burstSparks(TREE_X, topY, 24, 120, { g: 60 }); vlight(TREE_X, topY, 90, 1.5, 1);
  await wait(500);
  const bulbs = [...BIG.tree.bulbs].sort((a, b) => a.ly - b.ly), step = 0.045;
  bulbs.forEach((b, j) => { b.on = true; b.at = S.T + j * step; });
  for (let k = 0; k < 10; k++) setTimeout(() => { const b = bulbs[Math.floor(k / 10 * bulbs.length)]; vlight(TREE_X + b.lx, GY + 3 + b.ly, 30, 0.6, 0.4); }, k * bulbs.length * step * 100);
  await wait(bulbs.length * step * 1000 + 200);
  BIG.lit = true; flash(0.36, '#fff2ce'); shake(4, 0.4);
  rays(TREE_X, topY, 16, 90, 3.2);
  ring(TREE_X, topY, 4, 60, 0.6, ['#fff', '#ffe08a', '#ffd25a']); ring(TREE_X, topY, 4, 90, 0.9, ['#fff', '#ff4a5a', '#d8303a'], 0.1); ring(TREE_X, topY, 4, 120, 1.1, ['#fff', '#5cff9a', '#2f9a5a'], 0.2);
  confetti(TREE_X, topY + 10, 40, 140); vlight(TREE_X, GY - 40, 140, 1.6, 2.2);
  tween(2.2, p => { S.amb = AMB[3] + (0.14 - AMB[3]) * p; }, easeIO);
  for (const t of NEAR) t.bulbs.forEach(b => { if (!b.on) { b.on = true; b.at = S.T + rand(0, 0.6); } });
  for (let k = 0; k < 7; k++) setTimeout(() => firework(TREE_X + rand(-56, 56), rand(16, GY - 90)), 300 + k * 420);
  goldSnow(); sol.cheer = true; bambi.cheer = true; player.cheer = true; spawnParty(false);
  await wait(1600);
  await say('솔 & 밤비', '메리 크리스마스!\n파티에서 만나!');
  try { localStorage.setItem('solbam_done', '1'); } catch (e) {}
  const mer = $('#merry'); mer.classList.remove('hide'); mer.classList.remove('pop'); void mer.offsetWidth; mer.classList.add('pop');
  for (let k = 0; k < 3; k++) setTimeout(() => firework(TREE_X + rand(-50, 50), rand(20, 60)), k * 300);
  S.mode = 'tap'; await Promise.race([waitTap(), wait(4500)]); S.tapRes = null;
  mer.classList.add('hide'); showCard();
}
function spawnParty(instant) {
  S.party = true; PF = CH.player;
  // Six named cast members only, all within the narrow mobile viewport.
  S.camLock = TREE_X - LW / 2; if (instant) S.cam = S.camLock;
  Object.assign(sol, { x: TREE_X - 10, visible: true, cheer: true });
  Object.assign(player, { x: TREE_X + 10, visible: true, moving: false, atk: null, lunge: 0, cheer: true });
  Object.assign(bambi, { x: TREE_X + 30, visible: true, moving: false, guide: false, oy: 0, cheer: true });
  GUESTS = [EN.fuzz, EN.slime, EN.mush].map((c, i) => ({ c, type: EV[i].type, x: TREE_X + [-48, -30, 48][i], at: instant ? 0 : S.T + 0.25 * i, seed: i * 2.1, shown: instant }));
}
function firework(x, y) {
  const col = pick([['#fff2d3', '#de7686', '#ad354c'], ['#fff1cd', '#87c99c', '#317858'], ['#ffffff', '#ffe08a', '#f0a93a'], ['#ffffff', '#9ad1ff', '#6ab8ff']]);
  for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283 + rand(-0.05, 0.05), v = rand(45, 62); part({ k: 'streak', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 26, drag: 0.95, life: rand(1.0, 1.4), cols: [...col, col[2]], emit: true }); }
  burstTwinkle(x, y, 10, 30, [col[1], '#fff'], { lm: 1.5, g: 10 }); flareP(x, y, 8, 0.25); vlight(x, y, 50, 0.7, 0.6);
}
function goldSnow() { for (let k = 0; k < 70; k++) part({ k: 'twinkle', x: S.cam + rand(0, LW), y: rand(-60, 0), vx: rand(-6, 6), vy: rand(12, 26), life: rand(4, 7), cols: [pick(['#ffd76a', '#fff6c8', '#ffffff', '#ff9fc0'])], big: Math.random() < 0.3 ? 1 : 0, emit: true, wob: rand(1, 3), delay: rand(0, 3) }); }

/* ---------- 초대장 카드 ---------- */
function showCard() {
  S.mode = 'card'; S.hud = false; hideHint();
  $('#toName').textContent = look.name || '소중한 손님';
  $('#cIntro').textContent = CONFIG.intro; $('#cWhen').innerHTML = CONFIG.when; $('#cWhere').innerHTML = CONFIG.where;
  $('#cPot').textContent = CONFIG.potluck || '포트럭 안내는 곧 알려드릴게요!';
  if (CONFIG.rsvpUrl) $('#bRsvp').classList.remove('hide');
  const pc = $('#portrait'); pc.width = 360; pc.height = 150; const g = pc.getContext('2d'); g.setTransform(3, 0, 0, 3, 0, 0); g.imageSmoothingEnabled = false; g.clearRect(0, 0, pc.width, pc.height);
  const t = TREE_IMG['trees/pico_green'] ? treeFromImg(TREE_IMG['trees/pico_green']) : genTree({ type: 'pine', h: 30, w: 26, seed: 7, pal: TPAL[0], snowy: true });
  if(BIG.tree.cv.hires) g.drawImage(BIG.tree.cv.hires,43,2,34,45); else g.drawImage(t.cv,60-t.ax,47-t.h+2); g.drawImage(STAR,55,0);
  g.fillStyle = '#c4e2f6'; g.fillRect(0, 47, 120, 3); g.fillStyle = '#ffffff'; g.fillRect(0, 47, 120, 1);
  [EN.fuzz.cheer || EN.fuzz, EN.slime.cheer || EN.slime, CH.sol.cheer, CH.player.cheer, CH.bambi.cheer, EN.mush.cheer || EN.mush].forEach((sp, i) => g.drawImage(sp.hires || sp, 10 + i * 20 - sp.width / 2, 48 - sp.height, sp.width, sp.height));
  const c = $('#card'); c.classList.remove('hide'); const pp = c.querySelector('.letter'); pp.classList.remove('pop'); void pp.offsetWidth; pp.classList.add('pop'); c.scrollTop = 0;
}
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); setTimeout(() => el.classList.remove('on'), 1600); }
$('#bMap').addEventListener('click', () => window.open(CONFIG.mapUrl, '_blank'));
$('#bRsvp').addEventListener('click', () => window.open(CONFIG.rsvpUrl, '_blank'));
$('#bCopy').addEventListener('click', async () => {
  const t = CONFIG.address;
  try { await navigator.clipboard.writeText(t); toast('주소를 복사했어요!'); }
  catch (e) { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('주소를 복사했어요!'); } catch (_) { toast(t); } ta.remove(); }
});
$('#bAgain').addEventListener('click', () => location.reload());

/* ---------- 시작 ---------- */
async function init() {
  resize(); await loadImgs(); setupSprites(); buildWorld(); loadSaved(); placeIcons();
  for (let i = 0; i < 70; i++) FLAKES.push({ x: rand(0, LW), y: rand(0, LH), vy: rand(6, 16), w: rand(1, 2.5), p: rand(0, 6), z: rand(0.4, 1.4) });
  setScene('title');
  addEventListener('resize', resize);
  requestAnimationFrame(t => { last = t; loop(t); });
}
init();

