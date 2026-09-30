import { KEYS } from "./constants.js";

const WALL = 1;
const EMPTY = 0;

export class Board {
  board = [];
  width;
  height;

  constructor({ height, width }) {
    this.height = height;
    this.width = width;

    this.initEmpty();
  }

  initEmpty() {
    this.board = [];

    for (let i = 0; i <= this.getLastIndex("vertical"); i++) {
      const row = [];

      const isTopOrBottom = i === 0 || i === this.getLastIndex("vertical");

      row.push(WALL);
      for (let i = 1; i <= this.getLastIndex("horizontal") - 1; i++) {
        row.push(isTopOrBottom ? WALL : Math.random() > 0.5 ? WALL : EMPTY);
      }
      row.push(WALL);

      this.board.push(row);
    }
  }

  getLastIndex(orientation) {
    if (orientation === "horizontal") {
      return this.width * 2;
    }

    if (orientation === "vertical") {
      return this.height * 2;
    }

    throw `orientation must be: "horizontal", "vertical"; but was ${orientation}`;
  }

  getCharFromIndex(i, j) {
    if (this.board[i][j] === EMPTY) {
      return KEYS.EMPTY_SPACE;
    }

    let trbl = [0, 0, 0, 0]; // [top, right, bottom, left]; 0: empty, 1: wall

    const topIdx = i - 1;
    const rightIdx = j + 1;
    const bottomIdx = i + 1;
    const leftIdx = j - 1;

    if (topIdx >= 0 && this.board[topIdx][j] === WALL) trbl[0] = 1;

    if (
      rightIdx <= this.getLastIndex("horizontal") &&
      this.board[i][rightIdx] === WALL
    )
      trbl[1] = 1;

    if (
      bottomIdx <= this.getLastIndex("vertical") &&
      this.board[bottomIdx][j] === WALL
    )
      trbl[2] = 1;

    if (leftIdx >= 0 && this.board[i][leftIdx] === WALL) trbl[3] = 1;

    const uchar = {
      "0000": KEYS.EMPTY_SPACE,
      "0001": KEYS.H_WALL,
      "0010": KEYS.V_WALL,
      "0011": KEYS.TOP_RIGHT_CORNER,
      "0100": KEYS.H_WALL,
      "0101": KEYS.H_WALL,
      "0110": KEYS.TOP_LEFT_CORNER,
      "0111": KEYS.BOTTOM_RIGHT_LEFT_WALL,
      1000: KEYS.V_WALL,
      1001: KEYS.BOTTOM_RIGHT_CORNER,
      1010: KEYS.V_WALL,
      1011: KEYS.TOP_LEFT_BOTTOM_WALL,
      1100: KEYS.BOTTOM_LEFT_CORNER,
      1101: KEYS.TOP_RIGHT_LEFT_WALL,
      1110: KEYS.TOP_RIGHT_BOTTOM_WALL,
      1111: KEYS.CROSS_WALL,
    }[trbl.join("")];

    return uchar ?? " ";
  }

  draw() {
    process.stdout.write(KEYS.CLEAR_TERMINAL);
    process.stdout.write(KEYS.CURSOR_TO_TOP_LEFT);

    for (let i = 0; i <= this.getLastIndex("vertical"); i++) {
      process.stdout.write("\n");

      for (let j = 0; j <= this.getLastIndex("horizontal"); j++) {
        process.stdout.write(this.getCharFromIndex(i, j));
      }
    }
  }
}
