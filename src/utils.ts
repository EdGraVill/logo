import type { Coord, Line } from './types';

export const getCenterOfLine = ([[x1, y1], [x2, y2]]: Line): Coord => [(x1 + x2) / 2, (y1 + y2) / 2];

export const getTwoLinesIntersection = (
  [[l1x1, l1y1], [l1x2, l1y2]]: Line,
  [[l2x1, l2y1], [l2x2, l2y2]]: Line,
): Coord => {
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

export const moveRelative =
  (...cords: Coord[]) =>
  ([dx, dy]: Coord): Coord[] =>
    cords.map(([x, y]) => [x + dx, y + dy]);

export const getPerpendicularCoordOfCenter = ([[x1, y1], [x2, y2]]: Line, distance: number): Coord => {
  const m = (y2 - y1) / (x2 - x1);
  const m2 = -1 / m;

  const x = (x1 + x2) / 2;
  const y = (y1 + y2) / 2;

  const x3 = x + Math.sqrt(distance ** 2 / (1 + m2 ** 2));
  const y3 = y + m2 * (x3 - x);

  return [x3, y3];
};

export const subtractCoords = ([x1, y1]: Coord, [x2, y2]: Coord): Coord => [x1 - x2, y1 - y2];
