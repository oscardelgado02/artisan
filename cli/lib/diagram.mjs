// Diagram helpers: edges from C# metadata, auto-layout, PlantUML export.
// ponytail: layout = namespace-grouped grid. Upgrade to layered (inheritance
// top-down) if grids feel bad on real projects.

export const ARROW = {
  inheritance: '<|--',
  realization: '<|..',
  composition: '*--',
  aggregation: 'o--',
  dependency: '..>',
  association: '-->',
};

// Build edges from parsed nodes: inheritance/realization from base lists,
// association when a field/property type refers to another scanned type.
// ponytail: heuristic — no composition/aggregation detection from code (needs
// ownership semantics). Add those by hand in the editor.
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
      let mm;
      while ((mm = typeNameRe.exec(m.type))) {
        const b = byName.get(mm[1]);
        if (b && b.id !== node.id) {
          push({
            id: 'e' + n++,
            kind: 'association',
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
  return edges;
}

// Namespace-grouped grid. Groups with more relations (inheritance roots) first.
export function layout(diagram) {
  const groups = new Map();
  for (const node of diagram.nodes) {
    const ns = node.namespace || '(global)';
    if (!groups.has(ns)) groups.set(ns, []);
    groups.get(ns).push(node);
  }
  const COLS = 5;
  const W = 300;
  const H = 260;
  let y = 60;
  for (const [, nodes] of groups) {
    nodes.forEach((n, i) => {
      n.x = 60 + (i % COLS) * W;
      n.y = y + Math.floor(i / COLS) * H;
    });
    y += Math.ceil(nodes.length / COLS) * H + 40;
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
