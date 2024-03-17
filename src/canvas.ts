import { Position, type Coord, type Line } from './types';
import {
  getCenterOfLine,
  getPerpendicularCoordOfCenter,
  getTwoLinesIntersection,
  moveRelative,
  subtractCoords,
} from './utils';

import { RATIO, UNIT } from './constants';

const u = (num: number) => UNIT * num;

interface CtxStyle {
  lineCap: CanvasLineCap;
  lineWidth: number;
  strokeStyle: string;
}

const styleCtx = (ctx: CanvasRenderingContext2D, style?: Partial<CtxStyle>): CanvasRenderingContext2D => {
  Object.entries(style ?? {}).forEach(([key, value]) => {
    Reflect.set(ctx, key, value);
  });

  return ctx;
};

const drawLine = (ctx: CanvasRenderingContext2D, ...coors: Coord[]) => {
  ctx.beginPath();

  const [[x, y], ...rest] = coors;

  ctx.moveTo(u(x), u(y));

  rest.forEach(([x, y]) => {
    ctx.lineTo(u(x), u(y));
  });

  ctx.stroke();
  ctx.closePath();
};

const drawCloseShape = (ctx: CanvasRenderingContext2D, ...coors: Coord[]) => {
  if (coors.length < 3) {
    throw new Error('A shape must have at least 3 points');
  }

  const [first, ...rest] = coors;
  const last = coors.pop() as Coord;

  const shape = [first, ...rest, last];

  if (first[0] === last[0] && first[1] === last[1]) {
    shape.push(rest[0]);
  } else {
    shape.push(first, rest[0]);
  }

  drawLine(ctx, ...shape);
};

const drawText = (ctx: CanvasRenderingContext2D, center: Coord, text: string, position = Position.topRight) => {
  const [x, y] = center;

  ctx.font = `${UNIT * 0.75 * 0.5}px sans-serif`;
  const height = UNIT * 0.5 * 0.5;
  const width = ctx.measureText(text).width;

  const uX = u(x);
  const uY = u(y);

  switch (position) {
    case Position.top:
      ctx.fillText(text, uX - width / 2, uY - height);
      break;
    case Position.topRight:
      ctx.fillText(text, uX + height, uY - height);
      break;
    case Position.right:
      ctx.fillText(text, uX + height, uY + height / 2);
      break;
    case Position.bottomRight:
      ctx.fillText(text, uX + height, uY + height * 2);
      break;
    case Position.bottom:
      ctx.fillText(text, uX - width / 2, uY + height * 2);
      break;
    case Position.bottomLeft:
      ctx.fillText(text, uX - width - height, uY + height * 2);
      break;
    case Position.left:
      ctx.fillText(text, uX - width - height, uY + height / 2);
      break;
    case Position.topLeft:
      ctx.fillText(text, uX - width - height, uY - height);
      break;
  }
};

const drawGrid = (ctx: CanvasRenderingContext2D) => {
  Array.from({ length: 15 }).forEach((_, i) => {
    if (ctx) {
      ctx = styleCtx(ctx, {
        lineWidth: UNIT * 0.015,
        strokeStyle: 'lightgray',
      });

      drawLine(ctx, [i, 0], [i, 14]);
      drawLine(ctx, [0, i], [14, i]);

      ctx.fillStyle = 'lightgray';
      ctx.font = `${UNIT * 0.15}px sans-serif`;
      Array.from({ length: 15 }).forEach((_, j) => {
        ctx?.fillText(`${i}, ${j}`, u(i) + UNIT * 0.05, u(j) + UNIT * 0.15);
      });
    }
  });
};

export default function drawCanvas(separation = 0) {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;

  if (canvas) {
    canvas.width = RATIO;
    canvas.height = RATIO;

    let ctx = canvas.getContext('2d');

    if (ctx) {
      ctx = styleCtx(ctx, {
        lineWidth: UNIT * 0.33,
        strokeStyle: 'black',
      });

      const aRight = getCenterOfLine([
        [7, 1],
        [12, 9],
      ]);
      const trisection = getTwoLinesIntersection(
        [aRight, [4, 13]],
        [
          [6, 13],
          [6, 0],
        ],
      );
      const aLeft = getTwoLinesIntersection(
        [
          [2, 9],
          [7, 1],
        ],
        [[8, 13], trisection],
      );

      drawCloseShape(ctx, ...moveRelative([7, 1], aRight, trisection, aLeft)([0, -separation]));

      drawCloseShape(
        ctx,
        ...moveRelative(
          aRight,
          [12, 9],
          [10, 13],
          [6, 13],
          trisection,
        )(
          subtractCoords(
            getPerpendicularCoordOfCenter([trisection, aRight], separation),
            getCenterOfLine([trisection, aRight]),
          ),
        ),
      );

      drawCloseShape(
        ctx,
        ...moveRelative(
          aLeft,
          trisection,
          [6, 13],
          [4, 13],
          [2, 9],
        )(
          subtractCoords(
            getCenterOfLine([aLeft, trisection]),
            getPerpendicularCoordOfCenter([aLeft, trisection], -separation),
          ),
        ),
      );

      drawGrid(ctx);

      ctx.fillStyle = 'black';
      const A: Coord = [7, 1];
      drawText(ctx, A, 'A (7,1)', Position.top);

      const B: Coord = [12, 9];
      drawText(ctx, B, 'B (12,9)', Position.right);

      const C: Coord = [10, 13];
      drawText(ctx, C, 'C (10,13)', Position.bottomRight);

      const D: Coord = [4, 13];
      drawText(ctx, D, 'D (4,13)', Position.bottomLeft);

      const E: Coord = [2, 9];
      drawText(ctx, E, 'E (2,9)', Position.left);

      ctx.setLineDash([u(0.1)]);

      ctx.fillStyle = 'blue';
      ctx = styleCtx(ctx, {
        lineWidth: UNIT * 0.06,
        strokeStyle: 'blue',
      });

      const AB: Line = [A, B];
      const α: Coord = getCenterOfLine(AB);
      drawText(ctx, α, 'α = M(AB)', Position.topRight);

      const χ: Line = [α, D];
      drawText(ctx, getCenterOfLine(χ), 'χ = αD', Position.bottomRight);
      drawLine(ctx, ...χ);

      ctx.fillStyle = 'green';
      ctx = styleCtx(ctx, {
        strokeStyle: 'green',
      });

      const β: Coord = [6, 13];
      drawText(ctx, β, 'β = ⅓DC', Position.bottom);

      const AE: Line = [A, E];
      const ψ: Line = [β, getTwoLinesIntersection(AE, [β, [6, 0]])];
      drawText(ctx, getCenterOfLine(ψ), 'ψ = β - AE', Position.top);
      drawLine(ctx, ...ψ);

      ctx.fillStyle = 'red';
      ctx = styleCtx(ctx, {
        strokeStyle: 'red',
      });

      const γ: Coord = [8, 13];
      drawText(ctx, γ, 'γ = ⅔DC', Position.bottom);

      const ω: Line = [γ, getTwoLinesIntersection(χ, ψ)];
      drawText(ctx, getCenterOfLine(ω), 'ω = γ - (χ,ψ) - AE', Position.right);
      drawLine(ctx, ...ω, getTwoLinesIntersection(AE, ω));

      ctx.fillStyle = 'orange';

      const χψω: Coord = getTwoLinesIntersection(χ, ψ);
      drawText(ctx, χψω, 'Θ = (χ,ψ,ω)', Position.left);
      drawText(ctx, χψω, `(${χψω[0].toFixed(0)}, ${χψω[1].toFixed(2)})`, Position.right);
    }
  }
}
