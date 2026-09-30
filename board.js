import { KEYS } from "./constants.js";
import { randFromArray, randInt } from "./helpers.js";

const WALL = 1;
const EMPTY = 0;

export class Board {
  rawBoard = [];
  width;
  height;

  constructor({ height, width }) {
    this.height = height;
    this.width = width;

    this.initRandomMaze();
  }

  initEmpty() {
    this.rawBoard = [];

    for (let i = 0; i <= this.getLastIndex("vertical"); i++) {
      const row = [];

      const isTopOrBottom = i === 0 || i === this.getLastIndex("vertical");

      row.push(WALL);
      for (let j = 1; j <= this.getLastIndex("horizontal") - 1; j++) {
        row.push(isTopOrBottom ? WALL : EMPTY);
      }
      row.push(WALL);

      this.rawBoard.push(row);
    }
  }

  initRandom() {
    this.rawBoard = [];

    for (let i = 0; i <= this.getLastIndex("vertical"); i++) {
      const row = [];

      const isTopOrBottom = i === 0 || i === this.getLastIndex("vertical");

      row.push(WALL);
      for (let j = 1; j <= this.getLastIndex("horizontal") - 1; j++) {
        if (isTopOrBottom) {
          row.push(WALL);
          continue;
        }

        if (i % 2 === 0 && j % 2 === 0) {
          row.push(WALL);
        } else if (i % 2 === 0 || j % 2 === 0) {
          row.push(Math.random() > 0.5 ? WALL : EMPTY);
        } else {
          row.push(EMPTY);
        }
      }
      row.push(WALL);

      this.rawBoard.push(row);
    }
  }

  initFull() {
    this.rawBoard = [];

    for (let i = 0; i <= this.getLastIndex("vertical"); i++) {
      const row = [];

      const isTopOrBottom = i === 0 || i === this.getLastIndex("vertical");

      row.push(WALL);
      for (let j = 1; j <= this.getLastIndex("horizontal") - 1; j++) {
        if (isTopOrBottom) {
          row.push(WALL);
          continue;
        }

        if (i % 2 === 0 || j % 2 === 0) {
          row.push(WALL);
        } else {
          row.push(EMPTY);
        }
      }
      row.push(WALL);

      this.rawBoard.push(row);
    }
  }

  initRandomMaze() {
    const createWalkableBoard = () => {
      const walkableBoard = [];

      for (let i = 1; i <= this.getLastIndex("vertical"); i += 2) {
        const row = [];

        for (let j = 1; j <= this.getLastIndex("horizontal"); j += 2) {
          row.push({ visited: false, y: (i - 1) / 2, x: (j - 1) / 2 });
        }

        walkableBoard.push(row);
      }

      return walkableBoard;
    };

    const getValidNeighbours = (walkableBoard, y, x) => {
      const topY = y - 1;
      const bottomY = y + 1;

      const rightX = x + 1;
      const leftX = x - 1;

      const validNeighbours = [];

      if (topY >= 0 && !walkableBoard[topY][x].visited)
        validNeighbours.push(walkableBoard[topY][x]);

      if (bottomY < this.height && !walkableBoard[bottomY][x].visited)
        validNeighbours.push(walkableBoard[bottomY][x]);

      if (rightX < this.width && !walkableBoard[y][rightX].visited)
        validNeighbours.push(walkableBoard[y][rightX]);

      if (leftX >= 0 && !walkableBoard[y][leftX].visited)
        validNeighbours.push(walkableBoard[y][leftX]);

      return validNeighbours;
    };

    const removeWallBetweenCells = (currCell, nextCell) => {
      let isUp = Number(nextCell.y - currCell.y === -1);
      let isDown = Number(nextCell.y - currCell.y === 1);
      let isRight = Number(nextCell.x - currCell.x === 1);
      let isLeft = Number(nextCell.x - currCell.x === -1);

      if (
        isUp + isDown + isLeft + isRight > 1 ||
        isUp + isDown + isLeft + isRight < 1
      ) {
        throw `Something went wrong in removeWallBetweenCell currCell (${JSON.stringify(currCell)}), nextCell (${JSON.stringify(nextCell)})`;
      }

      if (isUp) {
        this.rawBoard[currCell.y * 2][currCell.x * 2 + 1] = EMPTY;
        return;
      }

      if (isDown) {
        this.rawBoard[currCell.y * 2 + 2][currCell.x * 2 + 1] = EMPTY;
        return;
      }

      if (isRight) {
        this.rawBoard[currCell.y * 2 + 1][currCell.x * 2 + 2] = EMPTY;
        return;
      }

      this.rawBoard[currCell.y * 2 + 1][currCell.x * 2] = EMPTY;
    };

    this.initFull();

    const activeCells = [];
    const walkableBoard = createWalkableBoard();

    const randY = randInt(0, this.height - 1);
    const randX = randInt(0, this.width - 1);

    const initCell = walkableBoard[randY][randX];
    initCell.visited = true;
    activeCells.push(initCell);

    while (activeCells.length > 0) {
      const rand = Math.random();

      let currCell;
      let currCellIdx;

      if (rand < 0.6) {
        currCellIdx = -1;
      } else if (rand < 0.85) {
        currCellIdx = randInt(0, activeCells.length - 1);
      } else {
        currCellIdx = 0;
      }

      currCell = activeCells.at(currCellIdx);

      const validNeighbours = getValidNeighbours(
        walkableBoard,
        currCell.y,
        currCell.x,
      );

      if (!validNeighbours.length) {
        activeCells.splice(currCellIdx, 1);
        continue;
      }

      const nextCell = randFromArray(validNeighbours);

      removeWallBetweenCells(currCell, nextCell);

      nextCell.visited = true;
      activeCells.push(nextCell);
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
    if (this.rawBoard[i][j] === EMPTY) {
      return KEYS.EMPTY_SPACE;
    }

    let trbl = [0, 0, 0, 0]; // [top, right, bottom, left]; 0: empty, 1: wall

    const topIdx = i - 1;
    const rightIdx = j + 1;
    const bottomIdx = i + 1;
    const leftIdx = j - 1;

    if (topIdx >= 0 && this.rawBoard[topIdx][j] === WALL) trbl[0] = 1;

    if (
      rightIdx <= this.getLastIndex("horizontal") &&
      this.rawBoard[i][rightIdx] === WALL
    )
      trbl[1] = 1;

    if (
      bottomIdx <= this.getLastIndex("vertical") &&
      this.rawBoard[bottomIdx][j] === WALL
    )
      trbl[2] = 1;

    if (leftIdx >= 0 && this.rawBoard[i][leftIdx] === WALL) trbl[3] = 1;

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
        if (i % 2 === 1 && j % 2 === 1) {
          process.stdout.write(KEYS.EMPTY_SPACE);
          continue;
        }

        process.stdout.write(this.getCharFromIndex(i, j));
      }
    }
  }
}
