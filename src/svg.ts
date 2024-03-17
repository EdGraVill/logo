import { Position, type Coord, type Line, type Shape } from './types';
import { GRID_SIZE } from './constants';
import { A, B, C, D, E, leftSector, rightSector, topSector, α, αD, β, γ, χ, ψ, ω, Θ } from './shape';
import { getCenterOfLine } from './utils';

const drawPolygon = (svg: SVGElement, ...coords: Shape) => {
  if (coords.length < 3) {
    throw new Error('A shape must have at least 3 points');
  }

  const [...rest] = coords;
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon') as SVGPolygonElement;

  const points = rest.map(([x, y]) => `${x},${y}`).join(' ');

  polygon.setAttribute('points', points);

  svg.appendChild(polygon);

  return polygon;
};

const drawLine = (svg: SVGElement, [[x1, y1], [x2, y2]]: Line) => {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line') as SVGLineElement;

  line.setAttribute('x1', String(x1));
  line.setAttribute('y1', String(y1));
  line.setAttribute('x2', String(x2));
  line.setAttribute('y2', String(y2));

  svg.appendChild(line);

  return line;
};

const drawGrid = (svg: SVGElement) => {
  const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement;
  grid.classList.add('grid');
  const style = document.createElement('style');

  style.appendChild(
    document.createTextNode(`
      .grid line {
        stroke: var(--grid);
        stroke-width: 0.015;
      }

      .grid text {
        fill: var(--grid) !important;
        font-size: 0.01rem !important;
        transform: translate(-0.01rem, -0.01rem) !important;
      }
    `),
  );
  grid.appendChild(style);

  const linesCount = GRID_SIZE + 1;

  for (let i = 0; i < linesCount; i++) {
    drawLine(grid, [
      [0, i],
      [GRID_SIZE, i],
    ]);

    drawLine(grid, [
      [i, 0],
      [i, GRID_SIZE],
    ]);
  }

  for (let i = 0; i < linesCount ** 2; i += 1) {
    const [x, y] = [i % linesCount, Math.floor(i / linesCount)];

    drawText(grid, [x, y], `${[x, y]}`, Position.bottomRight);
  }

  svg.appendChild(grid);

  return grid;
};

const styleSvgText = (text: SVGTextElement, styles?: Partial<CSSStyleDeclaration>) => {
  Object.entries(styles ?? {}).forEach(([key, value]) => {
    Reflect.set(text.style, key, String(value));
  });

  return text;
};

const drawText = (svg: SVGElement, center: Coord, text: string, position = Position.topRight) => {
  const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text') as SVGTextElement;

  const [x, y] = center;

  textElement.textContent = text;
  textElement.style.fontFamily = 'sans-serif';
  textElement.style.fontSize = '0.025rem';
  textElement.setAttribute('x', String(x));
  textElement.setAttribute('y', String(y));

  if (position === Position.top) {
    textElement.style.textAnchor = 'middle';
    textElement.style.alignmentBaseline = 'baseline';
    textElement.setAttribute('y', String(y - 0.25));
  } else if (position === Position.topRight) {
    textElement.style.textAnchor = 'start';
    textElement.style.alignmentBaseline = 'baseline';
    textElement.setAttribute('x', String(x + 0.25));
    textElement.setAttribute('y', String(y - 0.25));
  } else if (position === Position.right) {
    textElement.style.textAnchor = 'start';
    textElement.style.alignmentBaseline = 'middle';
    textElement.setAttribute('x', String(x + 0.25));
  } else if (position === Position.bottomRight) {
    textElement.style.textAnchor = 'start';
    textElement.style.alignmentBaseline = 'hanging';
    textElement.setAttribute('x', String(x + 0.25));
    textElement.setAttribute('y', String(y + 0.25));
  } else if (position === Position.bottom) {
    textElement.style.textAnchor = 'middle';
    textElement.style.alignmentBaseline = 'hanging';
    textElement.setAttribute('y', String(y + 0.25));
  } else if (position === Position.bottomLeft) {
    textElement.style.textAnchor = 'end';
    textElement.style.alignmentBaseline = 'hanging';
    textElement.setAttribute('x', String(x - 0.25));
    textElement.setAttribute('y', String(y + 0.25));
  } else if (position === Position.left) {
    textElement.style.textAnchor = 'end';
    textElement.style.alignmentBaseline = 'middle';
    textElement.setAttribute('x', String(x - 0.25));
  } else if (position === Position.topLeft) {
    textElement.style.textAnchor = 'end';
    textElement.style.alignmentBaseline = 'baseline';
    textElement.setAttribute('x', String(x - 0.25));
    textElement.setAttribute('y', String(y - 0.25));
  } else if (position === Position.center) {
    textElement.style.textAnchor = 'middle';
    textElement.style.alignmentBaseline = 'middle';
  }

  svg.appendChild(textElement);

  return textElement;
};

const drawLabels = (svg: SVGElement) => {
  const labels = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement;
  labels.classList.add('labels');
  const style = document.createElement('style');

  style.appendChild(
    document.createTextNode(`
      .labels .dottedLine {
        stroke-dasharray: 0.1;
        stroke-width: 0.06 !important;
      }

      .labels text {
        fill: var(--content);
      }

      .labels .sector {
        fill: var(--gray);
      }

      .labels .blue {
        fill: var(--blue);
        stroke: var(--blue);
        stroke-width: 0;
      }

      .labels .green {
        fill: var(--green);
        stroke: var(--green);
        stroke-width: 0;
      }

      .labels .red {
        fill: var(--red);
        stroke: var(--red);
        stroke-width: 0;
      }
  `),
  );
  labels.appendChild(style);

  drawText(labels, A, `A (${A})`, Position.top);
  drawText(labels, B, `B (${B})`, Position.right);
  drawText(labels, C, `C (${C})`, Position.bottomRight);
  drawText(labels, D, `D (${D})`, Position.bottomLeft);
  drawText(labels, E, `E (${E})`, Position.left);

  drawLine(labels, αD).classList.add('blue', 'dottedLine');
  drawText(labels, α, 'α = M(AB)', Position.topRight).classList.add('blue');
  drawText(labels, getCenterOfLine(αD), 'χ = αD', Position.bottomRight).classList.add('blue');

  drawLine(labels, ψ).classList.add('green', 'dottedLine');
  drawText(labels, β, 'β = ⅓DC', Position.bottom).classList.add('green');
  drawText(labels, getCenterOfLine(ψ), 'ψ = β - AE', Position.center).classList.add('green');

  drawLine(labels, ω).classList.add('red', 'dottedLine');
  drawText(labels, γ, 'γ = ⅔DC', Position.bottom).classList.add('red');
  drawText(labels, χ, 'χ', Position.topLeft).classList.add('red');
  drawText(labels, getCenterOfLine([Θ, γ]), 'ω = γ - χ', Position.right).classList.add('red');

  styleSvgText(drawText(labels, Θ, 'Θ = (χ,ψ,ω)', Position.left), {
    fill: 'orange',
  });
  styleSvgText(drawText(labels, Θ, `(${Θ[0]},${Θ[1].toFixed(2)})`, Position.right), {
    fill: 'orange',
  });

  drawText(labels, getCenterOfLine([A, Θ]), 'Sector Top', Position.center).classList.add('sector');
  drawText(labels, getCenterOfLine([A, Θ]), 'AαΘχ', Position.bottom).classList.add('sector');

  drawText(labels, getCenterOfLine([α, C]), 'Sector Right', Position.center).classList.add('sector');
  drawText(labels, getCenterOfLine([α, C]), 'αBCβΘ', Position.bottom).classList.add('sector');

  styleSvgText(drawText(labels, getCenterOfLine([E, β]), 'Sector Left', Position.center), {
    transform: 'translate(0.05rem)',
  }).classList.add('sector');
  drawText(labels, getCenterOfLine([E, β]), 'χΘβDE', Position.bottomRight).classList.add('sector');

  svg.appendChild(labels);

  return labels;
};

export function drawSVG() {
  const svg = document.getElementById('svg') as SVGSVGElement | null;
  const showGridInput = document.getElementById('showGrid') as HTMLInputElement | null;
  const showLabelsInput = document.getElementById('showLabels') as HTMLInputElement | null;

  if (svg) {
    svg.setAttribute('viewBox', `0 0 ${GRID_SIZE} ${GRID_SIZE}`);
    const style = document.createElement('style');

    style.appendChild(
      document.createTextNode(`
        .sectorShape {
          stroke: var(--content);
          fill: none;
          stroke-width: 0.33;
        }
      `),
    );
    svg.appendChild(style);

    drawPolygon(svg, ...topSector).classList.add('sectorShape');
    drawPolygon(svg, ...leftSector).classList.add('sectorShape');
    drawPolygon(svg, ...rightSector).classList.add('sectorShape');

    const grid = drawGrid(svg);
    showGridInput?.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      grid.style.display = target.checked ? 'block' : 'none';
    });

    const labels = drawLabels(svg);
    showLabelsInput?.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      labels.style.display = target.checked ? 'block' : 'none';
    });
  }
}
