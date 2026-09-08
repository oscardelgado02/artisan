// Diagram helpers: edges from C# metadata, layered auto-layout, PlantUML export.

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

// Layered layout (Sugiyama-lite):
// 1) layer = longest path from a root, following child→parent edges
//    (inheritance/realization parents sit ABOVE their children; associations
//    count too so used-together classes spread out).
// 2) within a layer, order by namespace then barycenter of parents (2 passes).
// 3) x by column, y by layer using estimated node heights.
// Relation-less nodes land in a loose grid at the bottom.
export function layout(diagram, only = null) {
  const nodes = diagram.nodes;
  if (!nodes.length) return;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const parents = new Map(nodes.map((n) => [n.id, new Set()]));
  const children = new Map(nodes.map((n) => [n.id, new Set()]));
  for (const e of diagram.edges) {
    // e.from depends on e.to; render e.to above e.from.
    if (byId.has(e.from) && byId.has(e.to) && e.from !== e.to) {
      parents.get(e.from).add(e.to);
      children.get(e.to).add(e.from);
    }
  }

  // Layer via cycle-guarded longest path from roots.
  const layer = new Map();
  const ROOT_LAYER = 0;
  for (const n of nodes) {
    if (layer.has(n.id)) continue;
    // treat any node with no parents as a root
    if (parents.get(n.id).size > 0) continue;
    const stack = [[n.id, ROOT_LAYER]];
    while (stack.length) {
      const [id, depth] = stack.pop();
      if ((layer.get(id) ?? -1) >= depth) continue;
      layer.set(id, depth);
      for (const c of children.get(id)) {
        // cycle guard: depth cap = node count
        if (depth < nodes.length) stack.push([c, depth + 1]);
      }
    }
  }
  // Nodes unreachable from roots (cycles): lay them at max layer + 1.
  let maxLayer = 0;
  for (const n of nodes) maxLayer = Math.max(maxLayer, layer.get(n.id) ?? 0);
  for (const n of nodes) if (!layer.has(n.id)) layer.set(n.id, maxLayer + 1);

  // Estimated node height: header + members.
  const heightOf = (n) => 62 + (n.attributes.length + n.methods.length) * 20;

  // Group by layer, order by namespace then barycenter of parents.
  const layers = new Map();
  for (const n of nodes) {
    const L = layer.get(n.id);
    if (!layers.has(L)) layers.set(L, []);
    layers.get(L).push(n);
  }
  const layerKeys = [...layers.keys()].sort((a, b) => a - b);
  for (const L of layerKeys) {
    const row = layers.get(L);
    row.sort((a, b) => (a.namespace || '').localeCompare(b.namespace || ''));
    for (let pass = 0; pass < 2; pass++) {
      const bary = new Map();
      for (const n of row) {
        const ps = [...parents.get(n.id)].filter((p) => layer.get(p) === L - 1);
        const xs = ps.map((p) => byId.get(p)._col ?? 0);
        bary.set(n.id, xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
      }
      row.sort((a, b) => {
        const ba = bary.get(a.id);
        const bb = bary.get(b.id);
        if (ba != null && bb != null && ba !== bb) return ba - bb;
        if (ba != null && bb == null) return -1;
        if (ba == null && bb != null) return 1;
        return (a.namespace || '').localeCompare(b.namespace || '');
      });
      row.forEach((n, i) => (byId.get(n.id)._col = i));
    }
  }
  // Place: per-layer rows sized by tallest node; column count by widest row.
  // `only` (optional set): on rescan, keep stored positions for existing nodes
  // and place just the new ones in layered spots (nudged right if occupied).
  const W = 300;
  const H_GAP = 70;
  let y = 60;
  const taken = new Set();
  if (only) {
    for (const n of nodes) if (!only.has(n.id)) taken.add(`${Math.round(n.x)},${Math.round(n.y)}`);
  }
  for (const L of layerKeys) {
    const row = layers.get(L);
    const rowH = Math.max(...row.map(heightOf));
    const cols = Math.max(1, Math.min(row.length, Math.ceil(1400 / W)));
    row.forEach((n, i) => {
      if (only && !only.has(n.id)) return;
      let x = 60 + (i % cols) * W + Math.floor(i / cols) * 24;
      let ny = y + Math.floor(i / cols) * (rowH + H_GAP);
      if (only) {
        while (taken.has(`${Math.round(x)},${Math.round(ny)}`)) x += W;
        taken.add(`${Math.round(x)},${Math.round(ny)}`);
      }
      n.x = x;
      n.y = ny;
    });
    const rows = Math.ceil(row.length / cols);
    y += rows * (rowH + H_GAP);
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
