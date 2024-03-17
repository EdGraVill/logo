import { Position, type Coord, type Line, type Shape } from './types';
import { GRID_SIZE } from './constants';
import { A, B, C, D, E, leftSector, rightSector, topSector, α, αD, β, γ, χ, ψ, ω, Θ } from './shape';
import { getCenterOfLine } from './utils';

interface SVGStyle {
  fill: string;
  fillOpacity: number;
  fillRule: 'nonzero' | 'evenodd';
  strokeColor: string;
  strokeDasharray: string;
  strokeDashoffset: string;
  strokeLinecap: 'butt' | 'round' | 'square';
  strokeLinejoin: 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round';
  strokeMiterlimit: number;
  strokeOpacity: number;
  strokeWidth: number;
}

const mapStyleWithAttribute: Record<keyof SVGStyle, string> = {
  fill: 'fill',
  fillOpacity: 'fill-opacity',
  fillRule: 'fill-rule',
  strokeColor: 'stroke',
  strokeDasharray: 'stroke-dasharray',
  strokeDashoffset: 'stroke-dashoffset',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  strokeMiterlimit: 'stroke-miterlimit',
  strokeOpacity: 'stroke-opacity',
  strokeWidth: 'stroke-width',
};

const styleSVG = <SVGEl extends SVGElement>(svg: SVGEl, styles?: Partial<SVGStyle>) => {
  Object.entries(styles ?? {}).forEach(([key, value]) => {
    const attribute = mapStyleWithAttribute[key as keyof SVGStyle];
    svg.setAttribute(attribute, String(value));
  });

  return svg;
};

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

  const strokeStyle: Partial<SVGStyle> = {
    strokeColor: 'lightgray',
    strokeWidth: 0.015,
  };

  const linesCount = GRID_SIZE + 1;

  for (let i = 0; i < linesCount; i++) {
    styleSVG(
      drawLine(grid, [
        [0, i],
        [GRID_SIZE, i],
      ]),
      strokeStyle,
    );
    styleSVG(
      drawLine(grid, [
        [i, 0],
        [i, GRID_SIZE],
      ]),
      strokeStyle,
    );
  }

  for (let i = 0; i < linesCount ** 2; i += 1) {
    const [x, y] = [i % linesCount, Math.floor(i / linesCount)];

    styleSvgText(drawText(grid, [x, y], `${[x, y]}`, Position.bottomRight), {
      fill: 'lightgray',
      fontSize: '0.01rem',
      transform: 'translate(0.05rem, 0.05rem)',
      userSelect: 'none',
    });
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

const drawLabels = (
  svg: SVGElement,
  topSectorPolygon: SVGPolygonElement,
  rightSectorPolygon: SVGPolygonElement,
  leftSectorPolygon: SVGPolygonElement,
) => {
  drawText(svg, A, `A (${A})`, Position.top);
  drawText(svg, B, `B (${B})`, Position.right);
  drawText(svg, C, `C (${C})`, Position.bottomRight);
  drawText(svg, D, `D (${D})`, Position.bottomLeft);
  drawText(svg, E, `E (${E})`, Position.left);

  styleSVG(drawLine(svg, αD), { strokeColor: 'blue', strokeDasharray: '0.1', strokeWidth: 0.06 });
  styleSvgText(drawText(svg, α, 'α = M(AB)', Position.topRight), { fill: 'blue' });
  styleSvgText(drawText(svg, getCenterOfLine(αD), 'χ = αD', Position.bottomRight), { fill: 'blue' });

  styleSVG(drawLine(svg, ψ), { strokeColor: 'green', strokeDasharray: '0.1', strokeWidth: 0.06 });
  styleSvgText(drawText(svg, β, 'β = ⅓DC', Position.bottom), { fill: 'green' });
  styleSvgText(drawText(svg, getCenterOfLine(ψ), 'ψ = β - AE', Position.center), { fill: 'green' });

  styleSVG(drawLine(svg, ω), { strokeColor: 'red', strokeDasharray: '0.1', strokeWidth: 0.06 });
  styleSvgText(drawText(svg, γ, 'γ = ⅔DC', Position.bottom), { fill: 'red' });
  styleSvgText(drawText(svg, χ, 'χ', Position.topLeft), { fill: 'red' });
  styleSvgText(drawText(svg, getCenterOfLine([Θ, γ]), 'ω = γ - χ', Position.right), { fill: 'red' });

  styleSvgText(drawText(svg, Θ, 'Θ = (χ,ψ,ω)', Position.left), {
    fill: 'orange',
    stroke: 'white',
    strokeWidth: '0.0005rem',
  });
  styleSvgText(drawText(svg, Θ, `(${Θ[0]},${Θ[1].toFixed(2)})`, Position.right), {
    fill: 'orange',
  });

  styleSVG(topSectorPolygon, { fill: 'lightBlue' });
  styleSvgText(drawText(svg, getCenterOfLine([A, Θ]), 'Sector Top', Position.center), { fill: 'gray' });
  styleSvgText(drawText(svg, getCenterOfLine([A, Θ]), 'AαΘχ', Position.bottom), { fill: 'gray' });

  styleSVG(rightSectorPolygon, { fill: 'lightGreen' });
  styleSvgText(drawText(svg, getCenterOfLine([α, C]), 'Sector Right', Position.center), { fill: 'gray' });
  styleSvgText(drawText(svg, getCenterOfLine([α, C]), 'αBCβΘ', Position.bottom), { fill: 'gray' });

  styleSVG(leftSectorPolygon, { fill: 'lightCoral' });
  styleSvgText(drawText(svg, getCenterOfLine([E, β]), 'Sector Left', Position.center), { fill: 'gray' });
  styleSvgText(drawText(svg, getCenterOfLine([E, β]), 'χΘβDE', Position.bottomRight), { fill: 'gray' });
};

export function drawSVG() {
  const svg = document.getElementById('svg') as SVGSVGElement | null;

  if (svg) {
    svg.setAttribute('viewBox', `0 0 ${GRID_SIZE} ${GRID_SIZE}`);

    const strokeStyle: Partial<SVGStyle> = {
      fill: 'none',
      strokeColor: 'black',
      strokeWidth: 0.33,
    };

    const topSectorPolygon = styleSVG(drawPolygon(svg, ...topSector), strokeStyle);
    const leftSectorPolygon = styleSVG(drawPolygon(svg, ...leftSector), strokeStyle);
    const rightSectorPolygon = styleSVG(drawPolygon(svg, ...rightSector), strokeStyle);

    drawGrid(svg);
    drawLabels(svg, topSectorPolygon, rightSectorPolygon, leftSectorPolygon);
  }
}
