type Coord = [x: number, y: number];
type Line = [start: Coord, end: Coord];

const RATIO = 2000;
const UNIT = RATIO / 14;

const u = (num: number) => UNIT * num;

interface LineStyle {
  lineCap: CanvasLineCap;
  lineWidth: number;
  strokeStyle: string;
}

const styleLine = (ctx: CanvasRenderingContext2D, style?: Partial<LineStyle>): CanvasRenderingContext2D => {
  Object.entries(style ?? {}).forEach(([key, value]) => {
    Reflect.set(ctx, key, value);
  });

  return ctx;
};

const drawLineOverDots = (ctx: CanvasRenderingContext2D, ...coors: Coord[]) => {
  ctx.beginPath();

  const [[x, y], ...rest] = coors;

  ctx.moveTo(u(x), u(y));

  rest.forEach(([x, y]) => {
    ctx.lineTo(u(x), u(y));
  });

  ctx.stroke();
  ctx.closePath();

  return coors[coors.length - 1];
};

const getCenterOfLine = ([[x1, y1], [x2, y2]]: Line): Coord => [(x1 + x2) / 2, (y1 + y2) / 2];

const getTwoLinesIntersection = ([[l1x1, l1y1], [l1x2, l1y2]]: Line, [[l2x1, l2y1], [l2x2, l2y2]]: Line): Coord => {
  const ml1 = l1x2 - l1x1 !== 0 ? (l1y2 - l1y1) / (l1x2 - l1x1) : null;
  const ml2 = l2x2 - l2x1 !== 0 ? (l2y2 - l2y1) / (l2x2 - l2x1) : null;

  if (!ml1 && ml2) {
    return [l1x1, ml2 * l1x1 + l2y1 - ml2 * l2x1];
  }

  if (ml1 && !ml2) {
    return [l2x1, ml1 * l2x1 + l1y1 - ml1 * l1x1];
  }

  if (ml1 && ml2) {
    const bl1 = l1y1 - ml1 * l1x1;
    const bl2 = l2y1 - ml2 * l2x1;

    const x = (bl2 - bl1) / (ml1 - ml2);
    const y = ml1 * x + bl1;

    return [x, y];
  }

  throw new Error('Lines are parallel');
};

const translate =
  (...cords: Coord[]) =>
  ([dx, dy]: Coord): Coord[] =>
    cords.map(([x, y]) => [x + dx, y + dy]);

const getPerpendicularCenterCoord = ([[x1, y1], [x2, y2]]: Line, distance: number): Coord => {
  const m = (y2 - y1) / (x2 - x1);
  const m2 = -1 / m;

  const x = (x1 + x2) / 2;
  const y = (y1 + y2) / 2;

  const x3 = x + Math.sqrt(distance ** 2 / (1 + m2 ** 2));
  const y3 = y + m2 * (x3 - x);

  return [x3, y3];
};

const subtractCoords = ([x1, y1]: Coord, [x2, y2]: Coord): Coord => [x1 - x2, y1 - y2];

enum Position {
  bottom = 'bottom',
  bottomLeft = 'bottomLeft',
  bottomRight = 'bottomRight',
  left = 'left',
  right = 'right',
  top = 'top',
  topLeft = 'topLeft',
  topRight = 'topRight',
}

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

function draw(separation = 0.5) {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;

  if (canvas) {
    canvas.width = RATIO;
    canvas.height = RATIO;

    let ctx = canvas.getContext('2d');

    if (ctx) {
      ctx = styleLine(ctx, {
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

      drawLineOverDots(ctx, ...translate([7, 1], aRight, trisection, aLeft, [7, 1], aRight)([0, -separation]));

      drawLineOverDots(
        ctx,
        ...translate(
          aRight,
          [12, 9],
          [10, 13],
          [6, 13],
          trisection,
          aRight,
          [12, 9],
        )(
          subtractCoords(
            getPerpendicularCenterCoord([trisection, aRight], separation),
            getCenterOfLine([trisection, aRight]),
          ),
        ),
      );

      drawLineOverDots(
        ctx,
        ...translate(
          aLeft,
          trisection,
          [6, 13],
          [4, 13],
          [2, 9],
          aLeft,
          trisection,
        )(
          subtractCoords(
            getCenterOfLine([aLeft, trisection]),
            getPerpendicularCenterCoord([aLeft, trisection], -separation),
          ),
        ),
      );

      Array.from({ length: 15 }).forEach((_, i) => {
        if (ctx) {
          ctx = styleLine(ctx, {
            lineWidth: UNIT * 0.015,
            strokeStyle: 'gray',
          });

          drawLineOverDots(ctx, [i, 0], [i, 14]);
          drawLineOverDots(ctx, [0, i], [14, i]);

          ctx.fillStyle = 'gray';
          ctx.font = `${UNIT * 0.15}px sans-serif`;
          Array.from({ length: 15 }).forEach((_, j) => {
            ctx?.fillText(`${i}, ${j}`, u(i) + UNIT * 0.05, u(j) + UNIT * 0.15);
          });
        }
      });

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
      ctx = styleLine(ctx, {
        lineWidth: UNIT * 0.06,
        strokeStyle: 'blue',
      });

      const AB: Line = [A, B];
      const α: Coord = getCenterOfLine(AB);
      drawText(ctx, α, 'α = M(AB)', Position.topRight);

      const χ: Line = [α, D];
      drawText(ctx, getCenterOfLine(χ), 'χ = αD', Position.bottomRight);
      drawLineOverDots(ctx, ...χ);

      ctx.fillStyle = 'green';
      ctx = styleLine(ctx, {
        strokeStyle: 'green',
      });

      const β: Coord = [6, 13];
      drawText(ctx, β, 'β = ⅓DC', Position.bottom);

      const AE: Line = [A, E];
      const ψ: Line = [β, getTwoLinesIntersection(AE, [β, [6, 0]])];
      drawText(ctx, getCenterOfLine(ψ), 'ψ = β - AE', Position.top);
      drawLineOverDots(ctx, ...ψ);

      ctx.fillStyle = 'red';
      ctx = styleLine(ctx, {
        strokeStyle: 'red',
      });

      const γ: Coord = [8, 13];
      drawText(ctx, γ, 'γ = ⅔DC', Position.bottom);

      const ω: Line = [γ, getTwoLinesIntersection(χ, ψ)];
      drawText(ctx, getCenterOfLine(ω), 'ω = γ - (χ,ψ) - AE', Position.right);
      drawLineOverDots(ctx, ...ω, getTwoLinesIntersection(AE, ω));

      ctx.fillStyle = 'orange';

      const χψω: Coord = getTwoLinesIntersection(χ, ψ);
      drawText(ctx, χψω, 'Θ = (χ,ψ,ω)', Position.left);
      drawText(ctx, χψω, `(${χψω[0].toFixed(0)}, ${χψω[1].toFixed(2)})`, Position.right);
    }
  }
}

draw(0);
