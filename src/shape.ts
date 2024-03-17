import type { Coord, Line } from './types';
import { getCenterOfLine, getTwoLinesIntersection } from './utils';

export const A: Coord = [7, 1];
export const B: Coord = [12, 9];
export const C: Coord = [10, 13];
export const D: Coord = [4, 13];
export const E: Coord = [2, 9];

export const AB: Line = [A, B];
export const α: Coord = getCenterOfLine(AB);
export const αD: Line = [α, D];

export const β: Coord = [6, 13];
export const AE: Line = [A, E];
export const ψ: Line = [β, getTwoLinesIntersection(AE, [β, [6, 0]])];

export const Θ: Coord = getTwoLinesIntersection(αD, ψ);

export const γ: Coord = [8, 13];
export const χ: Coord = getTwoLinesIntersection(AE, [γ, Θ]);
export const ω: Line = [γ, χ];

export const topSector = [A, α, Θ, χ];
export const rightSector = [α, B, C, β, Θ];
export const leftSector = [χ, Θ, β, D, E];
