import {
  EDGE_KINDS,
  KINDS,
  SVG_NS,
  clamp,
  esc,
  isPending,
  movedNodes,
  nodeById,
  selEdge,
  selNode,
  state,
} from './model';
import type { Member, MemberSection, UmlNode } from './model';

const wrap = document.getElementById('canvas-wrap') as HTMLDivElement;
const viewport = document.getElementById('viewport') as HTMLDivElement;
const nodesLayer = document.getElementById('nodes') as HTMLDivElement;
const edgesSvg = document.querySelector<SVGSVGElement>('#edges') as SVGSVGElement;
const edgePaths = document.querySelector<SVGGElement>('#edge-paths') as SVGGElement;
const zoomLabel = document.getElementById('zoom-label') as HTMLSpanElement;
const btnColorize = document.getElementById('btn-colorize') as HTMLButtonElement;

export { wrap, nodesLayer };

export function svgEl(tag: string): SVGElement {
  return document.createElementNS(SVG_NS, tag);
}

export function applyCam(): void {
  viewport.style.transform = `translate(${state.cam.x}px, ${state.cam.y}px) scale(${state.cam.z})`;
  wrap.style.backgroundPosition = `${state.cam.x}px ${state.cam.y}px`;
  wrap.style.backgroundSize = `${26 * state.cam.z}px ${26 * state.cam.z}px`;
  zoomLabel.textContent = Math.round(state.cam.z * 100) + '%';
}

export function zoomAt(clientX: number, clientY: number, factor: number): void {
  const r = wrap.getBoundingClientRect();
  const mx = clientX - r.left;
  const my = clientY - r.top;
  const z2 = clamp(state.cam.z * factor, 0.2, 3);
  const k = z2 / state.cam.z;
  state.cam.x = mx - k * (mx - state.cam.x);
  state.cam.y = my - k * (my - state.cam.y);
  state.cam.z = z2;
  applyCam();
}

export function toCanvas(cx: number, cy: number): { x: number; y: number } {
  const r = wrap.getBoundingClientRect();
  return {
    x: (cx - r.left - state.cam.x) / state.cam.z,
    y: (cy - r.top - state.cam.y) / state.cam.z,
  };
}

export function viewCenter(): { x: number; y: number } {
  const r = wrap.getBoundingClientRect();
  return toCanvas(r.left + r.width / 2, r.top + r.height / 2);
}

export function fitView(): void {
  if (!state.nodes.length) {
    state.cam = { x: 80, y: 40, z: 1 };
    applyCam();
    return;
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of state.nodes) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (n._w ?? 220));
    maxY = Math.max(maxY, n.y + (n._h ?? 100));
  }
  const r = wrap.getBoundingClientRect();
  const pad = 70;
  const z = clamp(
    Math.min((r.width - pad * 2) / (maxX - minX), (r.height - pad * 2) / (maxY - minY)),
    0.2,
    1.5
  );
  state.cam.z = z;
  state.cam.x = r.width / 2 - ((minX + maxX) / 2) * z;
  state.cam.y = r.height / 2 - ((minY + maxY) / 2) * z;
  applyCam();
}

export function syncColorize(): void {
  edgesSvg.classList.toggle('colorize', state.colorize);
  btnColorize.classList.toggle('is-active', state.colorize);
}

function memberRow(n: UmlNode, m: Member, key: MemberSection): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'member' + (isPending('member', m.id) ? ' ai-change' : '');
  row.dataset.mid = m.id;
  if (m.note) row.title = m.note;
  const isEnum = n.kind === 'enum';
  if (isEnum) {
    const name = m.name ? esc(m.name) : '<span class="unnamed">(unnamed)</span>';
    const val = m.type ? `<span class="m-type"> = ${esc(m.type)}</span>` : '';
    row.innerHTML = `<span class="m-name">${name}</span>${val}`;
    return row;
  }
  const mods = m.mods.length ? `<span class="m-mods">${esc(m.mods.join(' '))} </span>` : '';
  const vis = m.vis ? `<span class="m-vis">${esc(m.vis)}</span>` : '';
  const params = key === 'methods' ? `<span class="m-params">(${esc(m.params ?? '')})</span>` : '';
  const name = m.name ? esc(m.name) : '<span class="unnamed">(unnamed)</span>';
  const type = m.type ? `<span class="m-type">: ${esc(m.type)}</span>` : '';
  const note = m.note ? '<span class="note-glyph">\u270E</span>' : '';
  row.innerHTML = `${note}${mods}${vis}${vis ? ' ' : ''}<span class="m-name">${name}</span>${params}${type}`;
  return row;
}

function nodeSection(n: UmlNode, key: MemberSection, kindLabel: string): HTMLDivElement {
  const sec = document.createElement('div');
  sec.className = 'node-sec sec-' + key;
  for (const m of n[key]) sec.appendChild(memberRow(n, m, key));
  const add = document.createElement('button');
  add.className = 'add-btn';
  add.dataset.action = 'add-' + key;
  add.textContent = '+ ' + kindLabel;
  sec.appendChild(add);
  return sec;
}

export function renderNodes(): void {
  nodesLayer.textContent = '';
  for (const n of state.nodes) {
    const el = document.createElement('div');
    el.className =
      'node kind-' +
      n.kind +
      (selNode(n.id) ? ' selected' : '') +
      (state.linkFrom === n.id ? ' link-source' : '') +
      (isPending('node', n.id) ? ' ai-change' : '');
    el.dataset.id = n.id;
    el.style.left = n.x + 'px';
    el.style.top = n.y + 'px';
    if (n.note) el.title = n.note;

    const head = document.createElement('div');
    head.className = 'node-head';
    const stereo = KINDS[n.kind]?.stereo ?? '';
    head.innerHTML =
      (n.note ? '<span class="note-glyph node-note" title="' + esc(n.note) + '">\u270E</span>' : '') +
      (stereo ? `<div class="stereo">${esc(stereo)}</div>` : '') +
      `<div class="node-name" data-role="name">${
        n.name ? esc(n.name) : '<span class="unnamed">(unnamed)</span>'
      }</div>`;
    el.appendChild(head);

    if (n.kind === 'enum') {
      el.appendChild(nodeSection(n, 'attributes', 'value'));
    } else if (n.kind === 'interface') {
      el.appendChild(nodeSection(n, 'attributes', 'property'));
      el.appendChild(nodeSection(n, 'methods', 'method'));
    } else {
      el.appendChild(nodeSection(n, 'attributes', 'attribute'));
      el.appendChild(nodeSection(n, 'methods', 'method'));
    }
    nodesLayer.appendChild(el);
    n._w = el.offsetWidth;
    n._h = el.offsetHeight;
  }
}

export function anchor(a: UmlNode, b: UmlNode): { x: number; y: number } {
  const aw = a._w ?? 220;
  const ah = a._h ?? 100;
  const cx = a.x + aw / 2;
  const cy = a.y + ah / 2;
  const dx = b.x + (b._w ?? 220) / 2 - cx;
  const dy = b.y + (b._h ?? 100) / 2 - cy;
  const sx = dx ? (aw / 2 + 2) / Math.abs(dx) : Infinity;
  const sy = dy ? (ah / 2 + 2) / Math.abs(dy) : Infinity;
  const s = Math.min(sx, sy);
  return { x: cx + dx * s, y: cy + dy * s };
}

export function onBorder(n: UmlNode, px: number, py: number): boolean {
  const w = n._w ?? 220;
  const h = n._h ?? 100;
  const lx = px - n.x;
  const ly = py - n.y;
  if (lx < -6 || ly < -6 || lx > w + 6 || ly > h + 6) return false;
  const m = 12;
  return lx < m || lx > w - m || ly < m || ly > h - m;
}

export function nearestBorderPoint(n: UmlNode, px: number, py: number): { x: number; y: number } {
  const w = n._w ?? 220;
  const h = n._h ?? 100;
  const x = clamp(px - n.x, 0, w);
  const y = clamp(py - n.y, 0, h);
  const dl = x;
  const dr = w - x;
  const dt = y;
  const db = h - y;
  const m = Math.min(dl, dr, dt, db);
  if (m === dl) return { x: n.x, y: n.y + y };
  if (m === dr) return { x: n.x + w, y: n.y + y };
  if (m === dt) return { x: n.x + x, y: n.y };
  return { x: n.x + x, y: n.y + h };
}

function edgeLabelText(x: number, y: number, txt: string, cls: string): SVGTextElement {
  const t = svgEl('text') as SVGTextElement;
  t.setAttribute('x', String(x));
  t.setAttribute('y', String(y));
  t.setAttribute('class', cls);
  t.setAttribute('text-anchor', 'middle');
  t.textContent = txt;
  return t;
}

// Does a straight segment pass through any node box (besides a/b)?
function segBlocked(x: number, y1: number, y2: number, skipA: string, skipB: string): boolean {
  const lo = Math.min(y1, y2);
  const hi = Math.max(y1, y2);
  for (const n of state.nodes) {
    if (n.id === skipA || n.id === skipB) continue;
    if (x > n.x + 6 && x < n.x + (n._w ?? 220) - 6 && n.y + (n._h ?? 100) > lo + 6 && n.y < hi - 6) return true;
  }
  return false;
}

function segBlockedH(y: number, x1: number, x2: number, skipA: string, skipB: string): boolean {
  const lo = Math.min(x1, x2);
  const hi = Math.max(x1, x2);
  for (const n of state.nodes) {
    if (n.id === skipA || n.id === skipB) continue;
    if (y > n.y + 6 && y < n.y + (n._h ?? 100) - 6 && n.x + (n._w ?? 220) > lo + 6 && n.x < hi - 6) return true;
  }
  return false;
}

// Nearest free vertical channel: midpoint between neighbouring node columns.
function corridorX(x1: number, x2: number, y1: number, y2: number, skipA: string, skipB: string): number {
  const bounds = new Set<number>();
  for (const n of state.nodes) {
    bounds.add(n.x);
    bounds.add(n.x + (n._w ?? 220));
  }
  const cand = [...bounds].sort((p, q) => p - q);
  const mids: number[] = [cand[0] - 60, cand[cand.length - 1] + 40];
  for (let i = 0; i < cand.length - 1; i++) mids.push((cand[i] + cand[i + 1]) / 2);
  mids.sort((p, q) => Math.abs(p - (x1 + x2) / 2) - Math.abs(q - (x1 + x2) / 2));
  for (const m of mids) if (!segBlocked(m, y1, y2, skipA, skipB)) return Math.round(m);
  return Math.round((x1 + x2) / 2);
}

function corridorY(y1: number, y2: number, x1: number, x2: number, skipA: string, skipB: string): number {
  const bounds = new Set<number>();
  for (const n of state.nodes) {
    bounds.add(n.y);
    bounds.add(n.y + (n._h ?? 100));
  }
  const cand = [...bounds].sort((p, q) => p - q);
  const mids: number[] = [cand[0] - 40, cand[cand.length - 1] + 40];
  for (let i = 0; i < cand.length - 1; i++) mids.push((cand[i] + cand[i + 1]) / 2);
  mids.sort((p, q) => Math.abs(p - (y1 + y2) / 2) - Math.abs(q - (y1 + y2) / 2));
  for (const m of mids) if (!segBlockedH(m, x1, x2, skipA, skipB)) return Math.round(m);
  return Math.round((y1 + y2) / 2);
}

function edgeRoute(
  a: UmlNode,
  b: UmlNode
): { d: string; s: { x: number; y: number }; e: { x: number; y: number }; mid: { x: number; y: number } } {
  const aw = a._w ?? 220;
  const ah = a._h ?? 100;
  const bw = b._w ?? 220;
  const bh = b._h ?? 100;
  const acx = a.x + aw / 2;
  const acy = a.y + ah / 2;
  const bcx = b.x + bw / 2;
  const bcy = b.y + bh / 2;
  const sepX = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + aw, b.x + bw));
  const sepY = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + ah, b.y + bh));
  if (sepX === 0 && sepY === 0) {
    // overlapping boxes: straight center-to-center
    return {
      d: `M ${acx} ${acy} L ${bcx} ${bcy}`,
      s: { x: acx, y: acy },
      e: { x: bcx, y: bcy },
      mid: { x: (acx + bcx) / 2, y: (acy + bcy) / 2 },
    };
  }
  if (sepX >= sepY) {
    const right = bcx > acx;
    const sx = right ? a.x + aw : a.x;
    const ex = right ? b.x : b.x + bw;
    const sy = acy;
    const ey = bcy;
    // detour through a free horizontal channel when the straight run is blocked
    if (segBlocked(sy, sx, ex, a.id, b.id)) {
      const ch = corridorY(sy, ey, sx, ex, a.id, b.id);
      const m1 = right ? sx + 16 : sx - 16;
      const m2 = right ? ex - 16 : ex + 16;
      if ((right && m2 > m1) || (!right && m2 < m1)) {
        return {
          d: `M ${sx} ${sy} H ${m1} V ${ch} H ${m2} V ${ey}`,
          s: { x: sx, y: sy },
          e: { x: ex, y: ey },
          mid: { x: m2, y: ch },
        };
      }
    }
    const mx = (sx + ex) / 2;
    return {
      d: `M ${sx} ${sy} H ${mx} V ${ey} H ${ex}`,
      s: { x: sx, y: sy },
      e: { x: ex, y: ey },
      mid: { x: mx, y: (sy + ey) / 2 },
    };
  }
  const down = bcy > acy;
  const sy = down ? a.y + ah : a.y;
  const ey = down ? b.y : b.y + bh;
  const sx = acx;
  const ex = bcx;
  if (segBlocked(sx, sy, ey, a.id, b.id)) {
    const ch = corridorX(sx, ex, sy, ey, a.id, b.id);
    const m1 = down ? sy + 16 : sy - 16;
    const m2 = down ? ey - 16 : ey + 16;
    if ((down && m2 > m1) || (!down && m2 < m1)) {
      return {
        d: `M ${sx} ${sy} V ${m1} H ${ch} V ${m2} H ${ex} V ${ey}`,
        s: { x: sx, y: sy },
        e: { x: ex, y: ey },
        mid: { x: ch, y: (m1 + m2) / 2 },
      };
    }
  }
  const my = (sy + ey) / 2;
  return {
    d: `M ${sx} ${sy} V ${my} H ${ex} V ${ey}`,
    s: { x: sx, y: sy },
    e: { x: ex, y: ey },
    mid: { x: (sx + ex) / 2, y: my },
  };
}

export function renderEdges(): void {
  edgePaths.textContent = '';
  (document.getElementById('link-ghost') as SVGGElement | null)?.replaceChildren();
  for (const e of state.edges) {
    const a = nodeById(e.from);
    const b = nodeById(e.to);
    if (!a || !b) continue;
    const def = EDGE_KINDS[e.kind] ?? EDGE_KINDS.association;

    const g = svgEl('g') as SVGGElement;
    g.classList.add('edge-g');
    g.dataset.id = e.id;
    if (selEdge(e.id)) g.classList.add('selected');
    if (isPending('edge', e.id)) g.classList.add('ai-change');
    if (e.note) {
      const t = svgEl('title') as SVGTitleElement;
      t.textContent = e.note;
      g.appendChild(t);
    }

    const markerStart = def.start ? ` url(#${def.start})` : '';
    const markerEnd = ` url(#${def.end})`;

    let labelX: number;
    let labelY: number;

    if (e.from === e.to) {
      // self-relation loop on the right side of the node
      const w = a._w ?? 220;
      const h = a._h ?? 100;
      const y1 = a.y + h * 0.25;
      const y2 = a.y + h * 0.6;
      const x = a.x + w;
      const d = `M ${x} ${y1} C ${x + 55} ${y1}, ${x + 55} ${y2}, ${x} ${y2}`;
      const hit = svgEl('path') as SVGPathElement;
      hit.setAttribute('d', d);
      hit.setAttribute('class', 'edge-hit');
      g.appendChild(hit);
      const line = svgEl('path') as SVGPathElement;
      line.setAttribute('d', d);
      line.setAttribute('class', 'edge-line' + (def.dashed ? ' dashed' : ''));
      line.setAttribute('marker-start', markerStart);
      line.setAttribute('marker-end', markerEnd);
      g.appendChild(line);
      labelX = x + 66;
      labelY = (y1 + y2) / 2;
    } else {
      const pts = e.points;
      const usePts = !!pts && pts.length >= 2 && !movedNodes.has(a.id) && !movedNodes.has(b.id);
      const route = usePts ? null : edgeRoute(a, b);
      const d = usePts
        ? 'M ' + pts!.map(p => `${p.x} ${p.y}`).join(' L ')
        : route!.d;
      const hit = svgEl('path') as SVGPathElement;
      hit.setAttribute('d', d);
      hit.setAttribute('class', 'edge-hit');
      g.appendChild(hit);

      const line = svgEl('path') as SVGPathElement;
      line.setAttribute('d', d);
      line.setAttribute('class', 'edge-line' + (def.dashed ? ' dashed' : ''));
      line.setAttribute('marker-start', markerStart);
      line.setAttribute('marker-end', markerEnd);
      g.appendChild(line);

      if (usePts) {
        const dir = (ax: number, ay: number, bx: number, by: number) => {
          const l = Math.hypot(bx - ax, by - ay) || 1;
          return { x: (bx - ax) / l, y: (by - ay) / l };
        };
        const P0 = pts![0];
        const PL = pts![pts!.length - 1];
        if (e.fromMult) {
          const u1 = dir(P0.x, P0.y, pts![1].x, pts![1].y);
          g.appendChild(edgeLabelText(P0.x + u1.x * 18, P0.y + u1.y * 18 - 4, e.fromMult, 'edge-mult'));
        }
        if (e.toMult) {
          const u2 = dir(PL.x, PL.y, pts![pts!.length - 2].x, pts![pts!.length - 2].y);
          g.appendChild(edgeLabelText(PL.x + u2.x * 18, PL.y + u2.y * 18 - 4, e.toMult, 'edge-mult'));
        }
        const mp = pts![Math.floor(pts!.length / 2)];
        labelX = mp.x;
        labelY = mp.y - 6;
      } else {
        if (e.fromMult) {
          const horiz = Math.abs(route!.e.x - route!.s.x) > Math.abs(route!.e.y - route!.s.y);
          if (horiz) {
            const dir2 = route!.e.x > route!.s.x ? 1 : -1;
            g.appendChild(edgeLabelText(route!.s.x + dir2 * 20, route!.s.y - 6, e.fromMult, 'edge-mult'));
          } else {
            const dir2 = route!.e.y > route!.s.y ? 1 : -1;
            g.appendChild(edgeLabelText(route!.s.x + 8, route!.s.y + dir2 * 18, e.fromMult, 'edge-mult'));
          }
        }
        if (e.toMult) {
          const horiz = Math.abs(route!.e.x - route!.s.x) > Math.abs(route!.e.y - route!.s.y);
          if (horiz) {
            const dir2 = route!.e.x > route!.s.x ? 1 : -1;
            g.appendChild(edgeLabelText(route!.e.x - dir2 * 20, route!.e.y - 6, e.toMult, 'edge-mult'));
          } else {
            const dir2 = route!.e.y > route!.s.y ? 1 : -1;
            g.appendChild(edgeLabelText(route!.e.x + 8, route!.e.y - dir2 * 14, e.toMult, 'edge-mult'));
          }
        }
        labelX = route!.mid.x;
        labelY = route!.mid.y - 6;
      }
    }

    if (e.label) g.appendChild(edgeLabelText(labelX, labelY, e.label, 'edge-label'));

    edgePaths.appendChild(g);
  }
}

export function renderAll(): void {
  renderNodes();
  renderEdges();
}

export function updateSelectionStyles(): void {
  nodesLayer.querySelectorAll<HTMLElement>('.node').forEach(el => {
    el.classList.toggle('selected', selNode(el.dataset.id ?? ''));
    el.classList.toggle('link-source', state.linkFrom === el.dataset.id);
  });
  edgePaths.querySelectorAll<SVGGElement>('.edge-g').forEach(g => {
    g.classList.toggle('selected', selEdge(g.dataset.id ?? ''));
  });
}
