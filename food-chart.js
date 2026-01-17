const SVG_NS = "http://www.w3.org/2000/svg";
const SIZE = 120;
const CENTER = SIZE / 2;
const RADIUS = 52;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ensureDonut(container) {
  if (container._donut) return container._donut;
  let svg = container.querySelector("svg");
  if (!svg) {
    svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
    svg.setAttribute("aria-hidden", "true");
    container.prepend(svg);
  } else {
    svg.innerHTML = "";
  }

  const track = document.createElementNS(SVG_NS, "circle");
  track.setAttribute("class", "donut-track");
  track.setAttribute("cx", CENTER);
  track.setAttribute("cy", CENTER);
  track.setAttribute("r", RADIUS);
  track.setAttribute("stroke-width", STROKE);

  const progress = document.createElementNS(SVG_NS, "circle");
  progress.setAttribute("class", "donut-progress");
  progress.setAttribute("cx", CENTER);
  progress.setAttribute("cy", CENTER);
  progress.setAttribute("r", RADIUS);
  progress.setAttribute("stroke-width", STROKE);
  progress.setAttribute("transform", `rotate(-90 ${CENTER} ${CENTER})`);
  progress.setAttribute("stroke-dasharray", `${CIRCUMFERENCE} ${CIRCUMFERENCE}`);
  progress.setAttribute("stroke-dashoffset", `${CIRCUMFERENCE}`);

  svg.append(track, progress);

  container._donut = { progress, circumference: CIRCUMFERENCE };
  return container._donut;
}

export function renderDonutChart(container, { consumed, target }) {
  if (!container) return;
  const { progress, circumference } = ensureDonut(container);
  const safeTarget = Number(target) || 0;
  const safeConsumed = Math.max(0, Number(consumed) || 0);
  const ratio = safeTarget > 0 ? Math.min(safeConsumed / safeTarget, 1) : 0;
  const offset = circumference - ratio * circumference;
  progress.style.strokeDashoffset = `${offset}`;
}
