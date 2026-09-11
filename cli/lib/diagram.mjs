// Diagram helpers: edges from C# metadata, dagre auto-layout, PlantUML export.
// Layout engine: vendored dagre (MIT, same engine mermaid uses) — proper
// ranking/ordering/coordinates, and edge polylines that avoid node boxes.
import { Graph, layout as dagreLayout } from './vendor/dagre.mjs';

export const ARROW = {
  inheritance: '<|--',
  realization: '<|..',
  composition: '*--',
  aggregation: 'o--',
  dependency: '..>',
  association: '-->',
};

// Build edges from parsed nodes. Relation kinds detected:
//   inheritance  — class : Base (bases list)
//   realization  — class : IFoo (base kind interface, incl. Unity IFoo→Foo)
//   composition  — field with initializer `= new Target()`
//   aggregation  — collection-typed field (List<>/array) of a scanned type
//   association  — plain field of a scanned type
//   dependency   — type used in a method's params/return (no stronger link)
// ponytail: ownership is heuristic — no real lifetime analysis. Hand-tune
// composition/aggregation in the editor when the scan guesses wrong.
export function buildEdges(entries) {
  const byName = new Map();
  for (const { node } of entries) {
    byName.set(node.name, node);
    if (node.kind === 'record' || node.kind === 'class' || node.kind === 'abstract') {
      byName.set('I' + node.name, node); // Unity convention: IFoo implemented by Foo
    }
  }
  const typeNameRe = /\b([A-Z]\w*)\b/g;
  const edges = [];
  const hasPair = new Set();
  const push = (e) => {
    const key = e.kind + '|' + e.from + '|' + e.to;
    if (e.from !== e.to && !hasPair.has(e.kind + '|' + e.from + '->' + e.to) && !hasPair.has(e.kind + '|' + e.to + '->' + e.from)) {
      hasPair.add(key);
      edges.push(e);
    }
  };
  let n = 0;
  for (const { node, meta } of entries) {
    for (const base of meta.bases) {
      const b = byName.get(base);
      if (!b) continue;
      push({
        id: 'e' + n++,
        kind: b.kind === 'interface' ? 'realization' : 'inheritance',
        from: node.id,
        to: b.id,
        label: '',
        fromMult: '',
        toMult: '',
      });
    }
  }
  for (const { node } of entries) {
    if (node.kind === 'enum') continue;
    for (const m of node.attributes) {
      typeNameRe.lastIndex = 0; // shared regex: reset per member or earlier matches eat later ones
      let mm;
      while ((mm = typeNameRe.exec(m.type))) {
        const b = byName.get(mm[1]);
        if (b && b.id !== node.id) {
          const collection = /<\s*\w|\[\s*\]$/.test(m.type);
          push({
            id: 'e' + n++,
            kind: m.init === 'new' ? 'composition' : collection ? 'aggregation' : 'association',
            from: node.id,
            to: b.id,
            label: m.name,
            fromMult: '',
            toMult: '',
          });
          break; // one association per member
        }
      }
    }
  }
  // Dependency: transient use — a type appearing in a method's params or
  // return type. Only when no stronger relation already links the pair
  // (fields/inheritance beat "passes a Weapon to Attack").
  const linked = new Set();
  for (const e of edges) {
    linked.add(e.from + '->' + e.to);
    linked.add(e.to + '->' + e.from);
  }
  for (const { node } of entries) {
    if (node.kind === 'enum') continue;
    for (const m of node.methods) {
      typeNameRe.lastIndex = 0;
      const sig = `${m.params ?? ''} ${m.type}`;
      let mm;
      while ((mm = typeNameRe.exec(sig))) {
        const b = byName.get(mm[1]);
        if (b && b.id !== node.id && !linked.has(node.id + '->' + b.id)) {
          linked.add(node.id + '->' + b.id);
          linked.add(b.id + '->' + node.id);
          push({
            id: 'e' + n++,
            kind: 'dependency',
            from: node.id,
            to: b.id,
            label: m.name,
            fromMult: '',
            toMult: '',
          });
          break;
        }
      }
    }
  }
  return edges;
}

// dagre layout (fresh scans): parents rank above children (inheritance edges
// are reversed for ranking, then points un-reversed), strong relations get
// extra weight so they stay straight. Edge polylines are stored on `e.points`
// and the editor renders exactly those routes.
// Rescan mode (`only`): existing nodes keep their positions; fresh ones are
// anchored near their placed neighbours and spiral out to a free spot.
// Mirror the editor's CSS: JetBrains Mono 12px ≈ 7.4px/char; node cap 640px.
// Per row, the NAME and (for methods) the PARAMS may wrap into lines; they
// share the space left by the locked parts (mods/vis/type). Name takes the
// leftover first (240px cap, 120px floor), params get the rest (240 cap,
// 80 floor). Must stay in sync with rowBudgets() in editor/src/render.ts.
const CHAR = 7.4;
const NODE_MAX = 640;
export function rowParts(m, isMethod, isEnum, hasNote) {
  let locked = isEnum
    ? m.type
      ? ' = ' + m.type
      : ''
    : (m.mods.length ? m.mods.join(' ') + ' ' : '') +
      (m.vis ? m.vis + ' ' : '') +
      ' ' +
      (m.type ? ': ' + m.type : '');
  const lockedPx = locked.length * CHAR;
  const remaining = NODE_MAX - 48 - (hasNote ? 14 : 0) - lockedPx;
  const nameBudget = Math.min(240, Math.max(120, remaining));
  const namePx = m.name.length * CHAR;
  const used = Math.min(namePx, nameBudget);
  const paramsStr = isMethod ? '(' + (m.params ?? '') + ')' : '';
  const paramsPx = paramsStr.length * CHAR;
  const paramsBudget = isMethod ? Math.min(240, Math.max(80, remaining - used)) : 240;
  return { lockedPx, nameBudget, paramsBudget, namePx, paramsPx };
}
export function nameLines(m, budgetPx = 240) {
  return Math.max(1, Math.ceil((m.name.length * CHAR) / budgetPx));
}
export function paramsLines(m, budgetPx = 240) {
  const px = ((m.params ?? '').length + 2) * CHAR;
  return Math.max(1, Math.ceil(px / budgetPx));
}
export function widthOf(n) {
  const isEnum = n.kind === 'enum';
  const members = [...n.attributes, ...n.methods];
  let w = 0;
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    const isMethod = i >= n.attributes.length;
    const p = rowParts(m, isMethod, isEnum, !!m.note);
    w = Math.max(w, 48 + p.lockedPx + Math.min(p.namePx, p.nameBudget) + Math.min(p.paramsPx, p.paramsBudget));
  }
  return Math.min(NODE_MAX, Math.max(220, w));
}
export function heightOf(n) {
  const isEnum = n.kind === 'enum';
  const members = [...n.attributes, ...n.methods];
  const extra = members.reduce((s, m, i) => {
    const isMethod = i >= n.attributes.length;
    const p = rowParts(m, isMethod, isEnum, !!m.note);
    return s + (nameLines(m, p.nameBudget) - 1) + (isMethod ? paramsLines(m, p.paramsBudget) - 1 : 0);
  }, 0);
  return 62 + members.length * 20 + 19 * extra;
}

export function layout(diagram, only = null) {
  const nodes = diagram.nodes;
  if (!nodes.length) return;
  const keep = only instanceof Set ? only : null;
  if (keep && keep.size === 0) return;

  const ids = new Set(nodes.map((n) => n.id));
  const neighbors = new Map(nodes.map((n) => [n.id, new Set()]));
  for (const e of diagram.edges) {
    if (!ids.has(e.from) || !ids.has(e.to) || e.from === e.to) continue;
    neighbors.get(e.from).add(e.to);
    neighbors.get(e.to).add(e.from);
  }

  // Mirror the editor's CSS: JetBrains Mono 12px ≈ 7.4px/char; member name
  // wraps at 240px (locked parts — vis/mods/type/params — never wrap), so
  // width uses min(name, 33 chars) and wrapped names add line height.
  // (widthOf/heightOf live at module scope so tests can use the same math.)

  if (!keep) {
    const g = new Graph({ multigraph: true });
    g.setGraph({ rankdir: 'TB', nodesep: 110, ranksep: 120, marginx: 40, marginy: 40 });
    g.setDefaultEdgeLabel(() => ({}));
    for (const n of nodes) g.setNode(n.id, { width: widthOf(n), height: heightOf(n) });
    for (const e of diagram.edges) {
      if (!ids.has(e.from) || !ids.has(e.to) || e.from === e.to) continue;
      const reversed = e.kind === 'inheritance' || e.kind === 'realization';
      const strong = e.kind === 'inheritance' || e.kind === 'realization' || e.kind === 'composition';
      g.setEdge(reversed ? e.to : e.from, reversed ? e.from : e.to, { weight: strong ? 3 : 1, minlen: 1 }, e.id);
    }
    dagreLayout(g);
    for (const n of nodes) {
      const p = g.node(n.id);
      n.x = Math.round(p.x - p.width / 2);
      n.y = Math.round(p.y - p.height / 2);
    }
    // No stored polylines: the editor draws edges live from box positions,
    // dodging whatever is nearby, so lines always adapt.
    return;
  }

  // Rescan: place only fresh ids. Each new node is anchored to the average
  // position of its already-placed neighbours, then spirals out to the first
  // free spot — new classes appear next to what they belong to. Nodes with
  // no placed neighbours are appended right of everything.
  const taken = new Set();
  const placed = new Map();
  for (const n of nodes) {
    if (!keep.has(n.id) && n.x != null && n.y != null) {
      taken.add(`${Math.round(n.x)},${Math.round(n.y)}`);
      placed.set(n.id, { x: n.x, y: n.y });
    }
  }
  const fresh = nodes.filter((n) => keep.has(n.id));
  fresh.sort((a, b) => neighbors.get(b.id).size - neighbors.get(a.id).size);
  const GRID = 40;
  for (const n of fresh) {
    const anchors = [...neighbors.get(n.id)].map((id) => placed.get(id)).filter(Boolean);
    let best;
    if (anchors.length) {
      best = {
        x: anchors.reduce((s, p) => s + p.x, 0) / anchors.length,
        y: anchors.reduce((s, p) => s + p.y, 0) / anchors.length,
      };
    } else {
      let maxX = 60;
      let maxY = 60;
      for (const p of placed.values()) {
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
      best = { x: maxX + 380, y: maxY };
    }
    const w = widthOf(n);
    let done = false;
    for (let ring = 0; ring < 24 && !done; ring++) {
      for (let dy = -ring; dy <= ring && !done; dy++) {
        for (let dx = -ring; dx <= ring && !done; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
          const cx = Math.round((best.x + dx * w) / GRID) * GRID;
          const cy = Math.round((best.y + dy * 90) / GRID) * GRID;
          if (taken.has(`${cx},${cy}`)) continue;
          n.x = cx;
          n.y = cy;
          taken.add(`${cx},${cy}`);
          placed.set(n.id, { x: cx, y: cy });
          done = true;
        }
      }
    }
    if (!done) {
      n.x = Math.round(best.x);
      n.y = Math.round(best.y);
    }
  }
}

export function toPlantUML(diagram) {
  const L = ['@startuml', ''];
  const nameOf = (id) => diagram.nodes.find((n) => n.id === id)?.name || 'Unnamed';
  for (const n of diagram.nodes) {
    const kw = n.kind === 'abstract' ? 'abstract class' : n.kind;
    L.push(`${kw} "${n.name || 'Unnamed'}" {`);
    for (const m of n.attributes) {
      if (n.kind === 'enum') {
        L.push(`  ${m.name || 'unnamed'}${m.type ? ' = ' + m.type : ''}`);
        if (m.note) L.push(`  .. note: ${m.note}`);
        continue;
      }
      const mods = m.mods.length ? ' ' + m.mods.join(' ') : '';
      L.push(`  ${m.vis}${mods} ${m.name || 'unnamed'}${m.type ? ' : ' + m.type : ''}`);
      if (m.note) L.push(`  .. note: ${m.note}`);
    }
    for (const m of n.methods) {
      const mods = m.mods.length ? ' ' + m.mods.join(' ') : '';
      L.push(`  ${m.vis}${mods} ${m.name || 'unnamed'}(${m.params ?? ''})${m.type ? ' : ' + m.type : ''}`);
      if (m.note) L.push(`  .. note: ${m.note}`);
    }
    L.push('}');
    if (n.note) L.push(`note on ${n.name || 'Unnamed'}: ${n.note}`);
    L.push('');
  }
  for (const e of diagram.edges) {
    const a = nameOf(e.from);
    const b = nameOf(e.to);
    const arrow = ARROW[e.kind] ?? '-->';
    const fm = e.fromMult ? ` "${e.fromMult}"` : '';
    const tm = e.toMult ? ` "${e.toMult}"` : '';
    const lbl = e.label ? ` : ${e.label}` : '';
    L.push(`${a}${fm} ${arrow}${tm} ${b}${lbl}`);
    if (e.note) L.push(`note on link: ${e.note}`);
  }
  if ((diagram.projectNotes || '').trim()) {
    L.push('');
    L.push('note as projectNotes');
    for (const line of diagram.projectNotes.trim().split('\n')) L.push(`  ${line}`);
    L.push('end note');
  }
  L.push('');
  L.push('@enduml');
  return L.join('\n');
}
