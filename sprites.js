/* ===================================================
   솔밤배 — 도트 스프라이트 (캐릭터 24 x 30, 컬러 외곽선)
   =================================================== */
'use strict';
const OL = '#1a1020';
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function hexRGB(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
// 외곽선(k)을 이웃한 색의 어두운 버전으로 칠한다 (셀아웃)
function spr(rows, pal, opt) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length)), c = mkCanvas(w, h), g = c.getContext('2d');
  const sel = !opt || opt.selout !== false;
  const at = (x, y) => (rows[y] && rows[y][x]) || '.';
  const ink = [38, 18, 40];
  for (let y = 0; y < h; y++) for (let x = 0; x < rows[y].length; x++) {
    const ch = rows[y][x]; if (ch === '.' || !pal[ch]) continue;
    let col = pal[ch];
    if (ch === 'k' && sel) {
      let nb = null;
      for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const n = at(x + dx, y + dy); if (n !== '.' && n !== 'k' && pal[n] && !'eWi'.includes(n)) { nb = pal[n]; break; }
      }
      if (nb) { const [r, gg, b] = hexRGB(nb); const f = 0.38; col = `rgb(${R0(r * f + ink[0] * (1 - f) * 0.9)},${R0(gg * f + ink[1] * (1 - f) * 0.9)},${R0(b * f + ink[2] * (1 - f) * 0.9)})`; }
      else col = '#2a1630';
    }
    g.fillStyle = col; g.fillRect(x, y, 1, 1);
  }
  return c;
}
const R0 = Math.round;
// 레이어: {rows, y0} 또는 {pts}.  '.'=그대로, '_'=지우기
function compose(base, layers) {
  const g = base.map(r => r.split(''));
  for (const L of layers) {
    if (!L) continue;
    if (L.pts) { for (const [x, y, ch] of L.pts) if (g[y] && x >= 0 && x < g[y].length && (!L.onlyOn || L.onlyOn.includes(g[y][x]))) g[y][x] = ch === '_' ? '.' : ch; continue; }
    const y0 = L.y0 || 0;
    L.rows.forEach((row, i) => { const y = y0 + i; if (!g[y]) return; for (let x = 0; x < row.length; x++) { const ch = row[x]; if (ch === '.' || x >= g[y].length) continue; g[y][x] = ch === '_' ? '.' : ch; } });
  }
  return g.map(r => r.join(''));
}
const mirror = pts => pts.map(([x, y, c]) => [23 - x, y, c]);
const E = '........................';
const toPts = (rows, y0 = 0) => rows.flatMap((r, y) => [...r].map((c, x) => c === '.' ? null : [x, y + y0, c]).filter(Boolean));

/* ---------- 베이스 (24 x 33) ---------- */
const HEAD = [
  E, E, E, E,
  '........kkkkkkkk........',
  '......kksssssssskk......',
  '.....kssssssssssssk.....',
  '....kssssssssssssssk....',
  '...kssssssssssssssssk...',
  '...kssssssssssssssssk...',
  '..kssssssssssssssssssk..',
  '..kssssssssssssssssssk..',
  '..ksssssssssssssssssSk..',
  '..ksssssssssssssssssSk..',
  '..ksssssssssssssssssSk..',
  '..ksssssssssssssssssSk..',
  '..ksssssssssssssssssSk..',
  '..kSssssssssssssssssSk..',
  '...kSsssssssssssssSSk...',
  '....kSSssssssssssSSk....',
  '......kkSSSSSSSSkk......',
];
const BODY = [
  '.....kmzzmmzzmmzzMk.....',
  '....kUoOomMoooooOoOk....',
  '....kUoOozzoooooOoOk....',
  '....kUoOPmMoPoPoOoOk....',
  '....kUoOozzPoPoPOoOk....',
  '....kUoOooooooooOoOk....',
  '....kmMkOxOxOxOxkmMk....',
  '....kkk.kppppPPk.kkk....',
];
const FEET = {
  I: ['........kpPkkpPk........', '........kTtkkTtk........', '........kbBkkbBk........', '........kkkkkkkk........'],
  A: ['.......kpPk..kpPk.......', '.......kTtk..kTtk.......', '.......kbBk..kbBk.......', '.......kkkk..kkkk.......'],
  B: ['.........kpPkpPk........', '.........kTtkTtk........', '.........kbBkbBk........', '.........kkkkkkk........'],
};
const face = dx => ({ pts: [
  [7 + dx, 13, 'e'], [8 + dx, 13, 'e'], [15 + dx, 13, 'e'], [16 + dx, 13, 'e'],
  [7 + dx, 14, 'W'], [8 + dx, 14, 'e'], [15 + dx, 14, 'W'], [16 + dx, 14, 'e'],
  [7 + dx, 15, 'e'], [8 + dx, 15, 'i'], [15 + dx, 15, 'e'], [16 + dx, 15, 'i'],
  [5 + dx, 16, 'c'], [6 + dx, 16, 'c'], [17 + dx, 16, 'c'], [18 + dx, 16, 'c'],
  [11 + dx, 17, 'u'], [12 + dx, 17, 'u'],
] });
const ARM_L_CLEAR = [], ARM_R_CLEAR = [];
for (let y = 22; y <= 28; y++) for (const x of [4, 5, 6]) { ARM_L_CLEAR.push([x, y, '_']); ARM_R_CLEAR.push([23 - x, y, '_']); }
const RAISE_L = [
  [7, 22, 'k'], [7, 23, 'k'], [7, 24, 'k'], [7, 25, 'k'], [7, 26, 'k'], [7, 27, 'k'],
  [6, 22, 'o'], [5, 21, 'o'], [4, 20, 'U'], [5, 20, 'o'], [6, 21, 'O'],
  [3, 19, 'm'], [4, 19, 'm'], [3, 18, 'm'], [4, 18, 'M'],
  [5, 22, 'k'], [4, 21, 'k'], [3, 20, 'k'], [2, 19, 'k'], [2, 18, 'k'], [3, 17, 'k'], [4, 17, 'k'], [5, 18, 'k'], [5, 19, 'k'], [6, 20, 'k'],
];
const POSE = {
  cheer: { pts: [...ARM_L_CLEAR, ...ARM_R_CLEAR, ...RAISE_L, ...mirror(RAISE_L)] },
  wind: { pts: [...ARM_R_CLEAR, ...mirror(RAISE_L)] },
  swing: { pts: [...ARM_R_CLEAR, [16, 26, 'k'], [16, 27, 'k'], [16, 28, 'k'],
    [17, 22, 'k'], [18, 22, 'k'], [19, 22, 'k'], [20, 22, 'k'], [21, 22, 'k'], [22, 22, 'k'],
    [17, 23, 'o'], [18, 23, 'o'], [19, 23, 'o'], [20, 23, 'o'], [21, 23, 'm'], [22, 23, 'm'], [23, 23, 'k'],
    [17, 24, 'O'], [18, 24, 'O'], [19, 24, 'O'], [20, 24, 'O'], [21, 24, 'M'], [22, 24, 'm'], [23, 24, 'k'],
    [17, 25, 'k'], [18, 25, 'k'], [19, 25, 'k'], [20, 25, 'k'], [21, 25, 'k'], [22, 25, 'k']] },
};

/* ---------- 머리카락 ---------- */
const HAIR_TOP = [
  '........kkkkkkkk........',
  '......kkhhhLLhhhkk......',
  '.....khhhLLLLhhhhhk.....',
  '....khhLLLhhhhhhhhhk....',
  '...khhLLhhhhhhhhhhhHk...',
  '..khhhLhhhhhhhhhhhhhHk..',
  '..khhhhhhhhhhhhhhhhhHk..',
  '.khhhhhhhhhhhhhhhhhhhHk.',
  '.khhhHhhhhhHhhhhhHhhhHk.',
  '.khhH.HhH..HhH..HhH.HhHk',
  '.khH...H....H....H...Hk.',
  '.khH.................Hk.',
  '.khH.................Hk.',
  '.kH...................k.',
];
const HAIR = {
  short: [{ y0: 2, rows: HAIR_TOP }],
  long: [{ y0: 2, rows: HAIR_TOP }, { y0: 16, rows: [
    'khhH................Hhhk',
    'khhH................Hhhk',
    'khLh................hLhk',
    'khhH................Hhhk',
    'khhh................hhhk',
    'khhHk..............kHhhk',
    'khhHk..............kHhhk',
    'kHhHk..............kHhHk',
    'kHHk................kHHk',
    '.kk..................kk.',
  ] }],
  pony: [{ y0: 2, rows: HAIR_TOP }, { y0: 6, rows: [
    '.....................kk.',
    '....................krRk',
    '...................kRrhk',
    '....................khhk',
    '....................khLk',
    '....................khhk',
    '.....................khk',
    '.....................kHk',
    '......................k.',
  ] }],
  none: [],
};
const BANG_SHADE = { onlyOn: 's', pts: Array.from({ length: 16 }, (_, i) => [4 + i, 12, 'S']) };

/* ---------- 모자 ---------- */
const HAT = {
  beanie: { y0: 0, rows: [
    '..........kkkk..........',
    '.........kWWWWk.........',
    '.........kWWwWk.........',
    '.......kkkkwwkkkk.......',
    '.....kkqqqqqqqqqqkk.....',
    '....kqqUUqqqqqqqqqQk....',
    '...kqqUqqqqqqqqqqqqQk...',
    '..kqqUqWqqWqqWqqWqqqQk..',
    '..kqqqWqWWqWWqWWqWqqQk..',
    '.kTTTTTTTTTTTTTTTTTTTTk.',
    '.kTtTTtTTtTTtTTtTTtTTtk.',
  ] },
  muff: { y0: 2, rows: [
    '.......kddddddddk.......',
    '.....kdD........Ddk.....',
    '....kdD..........Ddk....',
    '...kdD............Ddk...',
    '..kdD..............Ddk..',
    '..kd................dk..',
    '.kdD................Ddk.',
    '.kd..................dk.',
    'kkkkk..............kkkkk',
    'kTTTTk............kTTTTk',
    'kTwTTk............kTTwTk',
    'kTTTtk............ktTTTk',
    'ktTttk............kttTtk',
    '.kkkk..............kkkk.',
  ] },
  ribbon: { y0: 2, rows: [
    '.............kk...kk....',
    '............krrk.krrk...',
    '............krWrkrRrk...',
    '............krrRkRrrk...',
    '.............kkkRkkk....',
    '..............kRkRk.....',
    '..............kk.kk.....',
  ] },
  none: null,
  santa: { y0: 0, rows: [
    '........................',
    '.......kkkkkkk..........',
    '.....kkqqqqqqqkk........',
    '....kqqUqqqqqqqqkk......',
    '...kqqUqqqqqqqqqqqkk....',
    '...kqUqqqqqqqqqqqqqqk...',
    '..kqUqqqqqqqqqqqqqqQqkkk',
    '..kqqqqqqqqqqqqqqqqQkWWk',
    '..kqqqqqqqqqqqqqqqqQkWwk',
    '.kTTTTTTTTTTTTTTTTTTTTkk',
    '.kTtTTtTTtTTtTTtTTtTTtk.',
  ] },
  elf: { y0: -6, rows: [
    '..............kyk.......',
    '..............kYk.......',
    '.............kgk........',
    '.............kgk........',
    '............kggk........',
    '............kgGk........',
    '...........kggGk........',
    '..........kgggGk........',
    '..........kgggGGk.......',
    '.........kgUggGGk.......',
    '........kggUgggGGk......',
    '.......kggUggggGGGk.....',
    '......kggUgggggggGGk....',
    '....kkgggUggggggggGGkk..',
    '..kkggggggggggggggggGGk.',
    '.kRRRRRRRRRRRRRRRRRRRRk.',
    '.kRWRRWRRWRRWRRWRRWRRrk.',
  ] },
};
const TOP_PAD = { elf: 6 };

/* ---------- 팔레트 ---------- */
const SKINS = [['#ffdcc5', '#f2b49a'], ['#e2a87e', '#c3845e'], ['#a8e2a2', '#76ba7c'], ['#aad6ff', '#7aa8e8']];
const SKIN_NAMES = ['PEACH', 'TAN', 'GREEN', 'BLUE'];
const HAIR_COL = { h: '#80492f', H: '#52291f', L: '#c1825a' };
const OUTFITS = {
  santa:   { U: '#ff6e78', o: '#e0414f', O: '#a8263c', x: '#8a1c34', P: '#fbf6ec', m: '#fbf6ec', M: '#cfc8de', z: '#e0414f', name: 'SANTA' },
  tree:    { U: '#6fd394', o: '#3fa66a', O: '#26744c', x: '#1c5a3c', P: '#fbf6ec', m: '#e8424f', M: '#a8263c', z: '#fbf6ec', name: 'TREE' },
  night:   { U: '#7d97ee', o: '#4f68c8', O: '#323f8c', x: '#252f6e', P: '#ffd25e', m: '#ffd25e', M: '#e39a2e', z: '#fbf6ec', name: 'NIGHT SKY' },
  rudolph: { U: '#cf9a6c', o: '#a06a44', O: '#6c442c', x: '#553420', P: '#f7e9cf', m: '#f7e9cf', M: '#d8c09a', z: '#e0414f', name: 'RUDOLPH' },
};
function humanPal(skin, out, extra) {
  return Object.assign({
    k: OL, s: skin[0], S: skin[1], e: '#24162a', i: '#6b4a3a', W: '#ffffff', c: '#ff8f8f', u: '#b84a58', ...HAIR_COL,
    U: out.U, o: out.o, O: out.O, x: out.x, P: out.P, m: out.m, M: out.M, z: out.z, n: '#3a2836', y: '#ffd25e',
    p: '#4a3a58', b: '#8a5a3c', B: '#5e3a28',
    q: '#e0414f', Q: '#a8263c', T: '#fbf6ec', t: '#d8d0c4', w: '#e6e2f0',
    r: '#ff6a8a', R: '#c42a56', d: '#8f80c8', D: '#655aa0', g: '#4cbb72', G: '#2a7a4e', Y: '#e39a2e',
  }, extra || {});
}
function buildHuman(o) {
  const pal = humanPal(o.skin, o.out, o.pal);
  if (o.hat === 'muff') { pal.T = '#ffb0cc'; pal.t = '#ee7fa8'; pal.w = '#ffffff'; }
  const top = TOP_PAD[o.hat] || 0, hair = HAIR[o.hair] || [], hat = HAT[o.hat];
  const build = (feet, dx, pose, extra) => {
    const base = [...HEAD, ...BODY, ...FEET[feet]];
    let rows = compose(base, [face(dx), ...hair, hair.length ? BANG_SHADE : null, top ? null : hat, extra, pose]);
    if (top) { rows = compose([...Array(top).fill(E), ...rows], [{ ...hat, y0: hat.y0 + top }]); if (extra && extra.after) rows = compose(rows, [{ pts: extra.after.map(([x, y, c]) => [x, y + top, c]) }]); }
    return spr(rows, pal);
  };
  const q = o.extraQ || o.extra;
  return {
    front: build('I', 0, null, o.extra), cheer: build('I', 0, POSE.cheer, o.extra),
    idle: build('I', 2, null, q), walkA: build('A', 2, null, q), walkB: build('B', 2, null, q),
    wind: build('I', 2, POSE.wind, q), swing: build('A', 2, POSE.swing, q),
  };
}
const OPTS = {
  hair: [['short', 'SHORT'], ['long', 'LONG'], ['pony', 'PONYTAIL']],
  hat: [['beanie', 'BEANIE'], ['muff', 'EARMUFFS'], ['ribbon', 'RIBBON'], ['none', 'NONE']],
  outfit: Object.keys(OUTFITS).map(k => [k, OUTFITS[k].name]),
  skin: SKINS.map((s, i) => [i, SKIN_NAMES[i]]),
};
function buildPlayer(lk) { return buildHuman({ skin: SKINS[lk.skin] || SKINS[0], out: OUTFITS[OPTS.outfit[lk.outfit][0]], hair: OPTS.hair[lk.hair][0], hat: OPTS.hat[lk.hat][0] }); }

/* ---------- 솔 (산타) ---------- */
const SOL_TRIM = { pts: [
  ...[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((x, i) => [x, 21, i % 3 ? 'T' : 't']),
  [9, 22, 'T'], [10, 22, 'T'], [9, 23, 'y'], [10, 23, 'y'], [9, 24, 'T'], [10, 24, 'T'], [9, 25, 'y'], [10, 25, 'y'],
  ...[8, 9, 10, 11, 12, 13, 14, 15].map(x => [x, 24, x === 9 || x === 10 ? 'T' : 'o']),
  ...[8, 9, 10, 11, 12, 13, 14, 15].map(x => [x, 25, x === 9 || x === 10 ? 'y' : 'o']),
  ...[8, 9, 10, 11, 12, 13, 14, 15].map(x => [x, 26, x === 11 || x === 12 ? 'y' : 'n']),
  ...[8, 9, 10, 11, 12, 13, 14, 15].map((x, i) => [x, 27, i % 3 ? 'T' : 't']),
  [5, 27, 'T'], [6, 27, 't'], [17, 27, 'T'], [18, 27, 't'],
] };
const SOL = buildHuman({
  skin: SKINS[0], out: { U: '#ff6e78', o: '#e0414f', O: '#a8263c', x: '#8a1c34', P: '#fbf6ec', m: '#fbf6ec', M: '#cfc8de', z: '#d8d0c4' }, hair: 'long', hat: 'santa',
  pal: { h: '#4a2a32', H: '#2c181e', L: '#7d4c4c', i: '#4a2a3a', n: '#2a1e2e', p: '#2a1e2e', b: '#2a1e2e', B: '#1a1020' },
  extra: SOL_TRIM,
});
/* ---------- 밤비 (루돌프) ---------- */
const BAMBI_ADD = dx => [
  [0, 10, 'k'], [1, 10, 'k'], [2, 10, 'k'], [0, 11, 'k'], [1, 11, 'S'], [2, 11, 'v'], [0, 12, 'k'], [1, 12, 'k'], [2, 12, 'S'],
  [23, 10, 'k'], [22, 10, 'k'], [21, 10, 'k'], [23, 11, 'k'], [22, 11, 'S'], [21, 11, 'v'], [23, 12, 'k'], [22, 12, 'k'], [21, 12, 'S'],
  ...[[8, 16], [9, 16], [14, 16], [15, 16], [9, 17], [10, 17], [13, 17], [14, 17], [10, 18], [11, 18], [12, 18], [13, 18], [11, 14], [12, 14]].map(([x, y]) => [x + dx, y, 'l']),
  [10 + dx, 15, 'n'], [11 + dx, 15, 'n'], [12 + dx, 15, 'n'], [13 + dx, 15, 'n'],
  [10 + dx, 16, 'n'], [11 + dx, 16, 'X'], [12 + dx, 16, 'n'], [13 + dx, 16, 'N'],
  [11 + dx, 17, 'n'], [12 + dx, 17, 'N'],
  // 털 하이라이트
  [7, 6, 'j'], [8, 6, 'j'], [6, 7, 'j'], [5, 8, 'j'], [9, 5, 'j'],
  // 배
  ...[[9, 23], [10, 23], [11, 23], [12, 23], [13, 23], [14, 23], [9, 24], [10, 24], [11, 24], [12, 24], [13, 24], [14, 24], [10, 25], [11, 25], [12, 25], [13, 25]].map(([x, y]) => [x, y, 'l']),
  [11, 22, 'y'], [12, 22, 'Y'],
];
const ANTLERS = toPts([
  '...a..a..........a..a...',
  '...aa.a..........a.aa...',
  '....aaa..........aaa....',
  '.....aA..........Aa.....',
  '.....kaAk......kAak.....',
  '......kkk......kkk......',
]);
const BAMBI_BODY = [...[8, 9, 10, 11, 12, 13, 14, 15].flatMap(x => [[x, 21, 'm'], [x, 22, 'o'], [x, 23, 'o'], [x, 24, 'o'], [x, 25, 'o'], [x, 26, 'o'], [x, 27, 'O']]), [6, 21, 'm'], [7, 21, 'm'], [16, 21, 'm'], [17, 21, 'M']];
const BAMBI = buildHuman({
  skin: ['#b67c4c', '#8e5c36'], out: { U: '#c99165', o: '#a06a44', O: '#6c442c', x: '#553420', P: '#a06a44', m: '#e0414f', M: '#a8263c', z: '#e0414f' }, hair: 'none', hat: 'none',
  pal: { l: '#f7e6c8', n: '#ff3b4f', N: '#c42036', X: '#ffffff', a: '#f2cf96', A: '#c0915a', v: '#f2a8a0', j: '#d49a68', p: '#a06a44', P: '#8e5c36', b: '#4a2c1e', B: '#2e1a12', T: '#c99165', t: '#a06a44', c: '#ff8a7a', i: '#5a3a2a' },
  extra: { pts: [...BAMBI_BODY, ...BAMBI_ADD(0), ...ANTLERS] },
  extraQ: { pts: [...BAMBI_BODY, ...BAMBI_ADD(2), ...ANTLERS] },
});
/* ---------- 장난꾸러기 엘프 ---------- */
const ELF_EARS = [[0, 11, 'k'], [1, 12, 'k'], [0, 12, 'k'], [1, 13, 's'], [2, 13, 's'], [0, 13, 'k'], [1, 14, 'k'], [2, 14, 'k'],
  [23, 11, 'k'], [22, 12, 'k'], [23, 12, 'k'], [22, 13, 's'], [21, 13, 's'], [23, 13, 'k'], [22, 14, 'k'], [21, 14, 'k']];
const ELF_SET = buildHuman({
  skin: SKINS[0], out: { U: '#6fd394', o: '#3fa66a', O: '#26744c', x: '#1c5a3c', P: '#ffd25e', m: '#ffd25e', M: '#e39a2e', z: '#e0414f' }, hair: 'short', hat: 'elf',
  pal: { h: '#ee7a34', H: '#b14c1e', L: '#ffab62', p: '#e0414f', P: '#fbf6ec', b: '#4cbb72', B: '#2a7a4e', T: '#e0414f', t: '#fbf6ec', i: '#2a7a4e' },
  extra: { pts: [], after: ELF_EARS },
});

/* ---------- 적 ---------- */
const GINGER = spr([
  '.......kkkkkk.......',
  '.....kkgLLgggkk.....',
  '....kgLLggggggGk....',
  '...kgLgggggggggGk...',
  '...kggeeggggeegGk...',
  '...kggWeggggWegGk...',
  '...kgcgiggggigcGk...',
  '....kgggiiiiggGk....',
  '.....kkggggggkk.....',
  '..kkkkggggggggkkkk..',
  '.kgigggggrgggggigGk.',
  '..kkkkggggBgggkkkk..',
  '.....kgggrggggk.....',
  '.....kgggggggGk.....',
  '....kggggkkgggGk....',
  '...kggggk..kgggGk...',
  '...kiiiik..kiiiik...',
  '...kkkkkk..kkkkkk...',
], { k: OL, g: '#cf8040', G: '#9a5a2c', L: '#ecaa66', i: '#fff6ea', e: '#24162a', W: '#ffffff', c: '#ff8a7a', r: '#e8344a', B: '#3fbf6a' });
const SNOWMAN = spr([
  '.........kkkkkk.........',
  '.........kKKKJk.........',
  '.........kKKKJk.........',
  '.........kRRRRk.........',
  '......kkkkkkkkkkkk......',
  '.......kwwwwwwwwk.......',
  '......kwwwwwwwwwWk......',
  '.....kwwwwwwwwwwWWk.....',
  '.....kwWewwwwWewwWk.....',
  '.....kweewwwweewWWk.....',
  '...oooooowwwwwwwcWk.....',
  '.....kcwwwwwwwwwWWk.....',
  '......kwwkwkwkwWWk......',
  '.......kwwwwwwWWk.......',
  '......kRRRRRRRRRRk......',
  '.....kRrRWRRWRRWRrk.....',
  '....kwwRRwwwwwwwwWWk....',
  '...kwwwRrwwwwwwwwwWWk...',
  '..kwwwwRWwwwkwwwwwwWWk..',
  '..kwwwwwwwwwwwwwwwwWWk..',
  '.kwwwwwwwwwwwwwwwwwwWWk.',
  '.kwwwwwwwwwwkwwwwwwwWWk.',
  '.kwwwwwwwwwwwwwwwwwwWWk.',
  '.kwwwwwwwwwwwwwwwwwWWWk.',
  '.kWwwwwwwwwwwwwwwwwWWWk.',
  '..kWwwwwwwwwwwwwwwWWWk..',
  '...kWWwwwwwwwwwwWWWWk...',
  '....kkWWWWWWWWWWWWkk....',
  '......kkkkkkkkkkkk......',
], { k: OL, K: '#2b2540', J: '#4a4366', R: '#3fa66a', r: '#26744c', w: '#f6f9ff', W: '#b8c8e8', o: '#ff8a2a', c: '#ffb0c0', e: '#24162a' });

/* ---------- 아이템 / 아이콘 ---------- */
const NV = '#1e2235', NO = { selout: false };
const ENVELOPE = spr(['kkkkkkkkkkkk', 'kwWWWWWWWWwk', 'kPwWWWWWWwPk', 'kWPwWWWWwPWk', 'kWWPwrrwPWWk', 'kWWWrrrrWWWk', 'kWWWWrrWWWWk', 'kwWWWWWWWWwk', 'kkkkkkkkkkkk'], { k: NV, W: '#fbf3dc', w: '#e3d5b0', P: '#c9b282', r: '#e8344a' }, NO);
const ENVELOPE_EMPTY = spr(['kkkkkkkkkkkk', 'k..........k', 'k..........k', 'k..........k', 'k..........k', 'k..........k', 'k..........k', 'k..........k', 'kkkkkkkkkkkk'], { k: '#4c5578' }, NO);
const STAR = spr(['.....k.....', '....kYk....', '....kYk....', '...kYWYk...', 'kkkkYWYkkkk', 'kYYYWWYYYyk', '.kyYYYYYyk.', '..kyYYYyk..', '..kyYkYyk..', '.kyYk.kYyk.', '.kyk...kyk.', '.kk.....kk.'], { k: '#7a3f12', Y: '#ffd25e', y: '#e89a2c', W: '#fff6c8' }, NO);
const HEART_FULL = spr(['.kk.kk.', 'kWRkRRk', 'kRRRRRk', 'kRRRRDk', '.kRRDk.', '..kDk..', '...k...'], { k: NV, R: '#ff4a62', D: '#c42a52', W: '#ffffff' }, NO);
const HEART_EMPTY = spr(['.kk.kk.', 'kWbkbbk', 'kbbbbbk', 'kbbbbBk', '.kbbBk.', '..kBk..', '...k...'], { k: NV, b: '#cfe0ff', B: '#9fb6e6', W: '#ffffff' }, NO);
const GIFT = spr(['...kk.kk...', '..kRRkRRk..', '.kkkkRkkkk.', 'kGGGGRGGGGk', 'kgggkRkgggk', 'kkkkkRkkkkk', '.kgggRgggk.', '.kgggRgggk.', '.kGGGRGGGk.', '.kkkkkkkkk.'], { k: NV, R: '#ffd25e', G: '#e8344a', g: '#c42a3c' }, NO);
const ICON_CAL = spr(['.k.....k.', 'kkkkkkkkk', 'kRRRRRRRk', 'kkkkkkkkk', 'kWWWWWWWk', 'kWkWWWkWk', 'kWWWWWWWk', 'kWkWkWkWk', 'kWWWWWWWk', 'kkkkkkkkk'], { k: NV, R: '#e8344a', W: '#fbf3dc' }, NO);
const ICON_PIN = spr(['..kkkkk..', '.kRRRRRk.', 'kRRWWRRDk', 'kRWkkWRDk', 'kRRWWRRDk', '.kRRRRDk.', '..kRRDk..', '...kDk...', '....k....'], { k: NV, R: '#e8344a', D: '#a3233a', W: '#fbf3dc' }, NO);
const ICON_CANE = spr(['..kkkk.', '.kWRRWk', 'kWk..kR', 'kRk..kW', '.k...kR', '.....kW', '.....kR', '.....kW', '.....kR', '......k'], { k: NV, R: '#e8344a', W: '#ffffff' }, NO);
