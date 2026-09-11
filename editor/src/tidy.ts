// @ts-expect-error vendored dagre ESM, no type declarations
import { Graph, layout as dagreLayout } from './vendor/dagre.mjs';
import { movedNodes, state } from './model';
import { renderAll } from './render';
import { save } from './storage';

// Re-runs the full dagre auto-layout (same engine + knobs as `artisan scan`)
// using the editor's REAL measured box sizes. No stored polylines: edges are
// drawn live by the current style (curves dodge nearby classes at render time).
export function tidyAll(): void {
  if (!state.nodes.length) return;
  const ids = new Set(state.nodes.map((n) => n.id));
  const g = new Graph({ multigraph: true });
  g.setGraph({ rankdir: 'TB', nodesep: 110, ranksep: 120, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const n of state.nodes) g.setNode(n.id, { width: n._w ?? 220, height: n._h ?? 100 });
  for (const e of state.edges) {
    if (!ids.has(e.from) || !ids.has(e.to) || e.from === e.to) continue;
    const reversed = e.kind === 'inheritance' || e.kind === 'realization';
    const strong = e.kind === 'inheritance' || e.kind === 'realization' || e.kind === 'composition';
    g.setEdge(reversed ? e.to : e.from, reversed ? e.from : e.to, { weight: strong ? 3 : 1, minlen: 1 }, e.id);
  }
  dagreLayout(g);
  for (const n of state.nodes) {
    const p = g.node(n.id);
    n.x = Math.round(p.x - p.width / 2);
    n.y = Math.round(p.y - p.height / 2);
  }
  for (const e of state.edges) delete e.points;
  movedNodes.clear();
  renderAll();
  save();
}
