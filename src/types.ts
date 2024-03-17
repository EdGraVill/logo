export type Coord = [x: number, y: number];

export type Line = [start: Coord, end: Coord];

export type Shape = Coord[];

export enum Position {
  bottom = 'bottom',
  bottomLeft = 'bottomLeft',
  bottomRight = 'bottomRight',
  center = 'center',
  left = 'left',
  right = 'right',
  top = 'top',
  topLeft = 'topLeft',
  topRight = 'topRight',
}
