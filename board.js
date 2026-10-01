import { KEYS } from "./constants.js";
import { randFromArray, randInt } from "./helpers.js";

const EMPTY = 0;
const WALL = 1;
const PLAYER = 2;
const GOAL = 3;

const PLAYER_CHAR = "x";
const GOAL_CHAR = "o";

const LADDER_UP_CHAR = "u";
const LADDER_DOWN_CHAR = "d";
const LADDER_BOTH_CHAR = "b";

const MAZE_OBJECTS = Object.freeze({
  [PLAYER]: PLAYER_CHAR,
  [GOAL]: GOAL_CHAR,
});

export class Board {
  rawBoard = [];

  width;
  height;
  floors;

  playerX;
  playerY;
  playerF;

  goalX;
  goalY;
  goalF;

  constructor({ height, width, floors }) {
    this.height = height;
    this.width = width;
    this.floors = floors;
  }

  initFull() {
    this.rawBoard = [];

    for (let k = 0; k <= this.getLastIndex("floor"); k++) {
      const matrix = [];

      if (k % 2 === 1) {
        for (let i = 0; i <= this.getLastIndex("vertical"); i++) {
          const row = [];

          for (let j = 0; j <= this.getLastIndex("horizontal"); j++) {
            row.push(WALL);
          }

          matrix.push(row);
        }
      } else {
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

          matrix.push(row);
        }
      }

      this.rawBoard.push(matrix);
    }
  }

  initRandomMaze() {
    const createWalkableBoard = () => {
      const walkableBoard = [];

      for (let k = 0; k <= this.getLastIndex("floor"); k += 2) {
        const matrix = [];
        for (let i = 1; i <= this.getLastIndex("vertical"); i += 2) {
          const row = [];

          for (let j = 1; j <= this.getLastIndex("horizontal"); j += 2) {
            row.push({
              visited: false,
              z: k / 2,
              y: (i - 1) / 2,
              x: (j - 1) / 2,
            });
          }

          matrix.push(row);
        }

        walkableBoard.push(matrix);
      }

      return walkableBoard;
    };

    const getValidNeighbours = (walkableBoard, z, y, x) => {
      const upZ = z + 1;
      const downZ = z - 1;

      const topY = y - 1;
      const bottomY = y + 1;

      const rightX = x + 1;
      const leftX = x - 1;

      const validNeighbours = [];
      const validNeighboursZ = [];

      if (upZ < this.floors && !walkableBoard[upZ][y][x].visited)
        validNeighboursZ.push(walkableBoard[upZ][y][x]);

      if (downZ >= 0 && !walkableBoard[downZ][y][x].visited)
        validNeighboursZ.push(walkableBoard[downZ][y][x]);

      if (topY >= 0 && !walkableBoard[z][topY][x].visited)
        validNeighbours.push(walkableBoard[z][topY][x]);

      if (bottomY < this.height && !walkableBoard[z][bottomY][x].visited)
        validNeighbours.push(walkableBoard[z][bottomY][x]);

      if (rightX < this.width && !walkableBoard[z][y][rightX].visited)
        validNeighbours.push(walkableBoard[z][y][rightX]);

      if (leftX >= 0 && !walkableBoard[z][y][leftX].visited)
        validNeighbours.push(walkableBoard[z][y][leftX]);

      return { validNeighbours, validNeighboursZ };
    };

    const removeWallBetweenCells = (currCell, nextCell) => {
      let isUpZ = Number(nextCell.z - currCell.z === 1);
      let isDownZ = Number(nextCell.z - currCell.z === -1);
      let isUp = Number(nextCell.y - currCell.y === -1);
      let isDown = Number(nextCell.y - currCell.y === 1);
      let isRight = Number(nextCell.x - currCell.x === 1);
      let isLeft = Number(nextCell.x - currCell.x === -1);

      if (
        isUpZ + isDownZ + isUp + isDown + isLeft + isRight > 1 ||
        isUpZ + isDownZ + isUp + isDown + isLeft + isRight < 1
      ) {
        throw `Something went wrong in removeWallBetweenCell currCell (${JSON.stringify(currCell)}), nextCell (${JSON.stringify(nextCell)})`;
      }

      const { z, y, x } = currCell;

      const { k, i, j } = this.getRawPosFromXYZPos({ z, y, x });

      if (isUpZ) {
        this.rawBoard[k + 1][i][j] = EMPTY;
        return;
      }

      if (isDownZ) {
        this.rawBoard[k - 1][i][j] = EMPTY;
        return;
      }

      if (isUp) {
        this.rawBoard[k][i - 1][j] = EMPTY;
        return;
      }

      if (isDown) {
        this.rawBoard[k][i + 1][j] = EMPTY;
        return;
      }

      if (isRight) {
        this.rawBoard[k][i][j + 1] = EMPTY;
        return;
      }

      this.rawBoard[k][i][j - 1] = EMPTY;
    };

    this.initFull();

    const activeCells = [];
    const walkableBoard = createWalkableBoard();

    const randZ = randInt(0, this.floors - 1);
    const randY = randInt(0, this.height - 1);
    const randX = randInt(0, this.width - 1);

    const initCell = walkableBoard[randZ][randY][randX];
    initCell.visited = true;
    activeCells.push(initCell);

    let n_same_plane_tries;
    while (activeCells.length > 0) {
      const rand = Math.random();

      let currCell;
      let currCellIdx;

      if (n_same_plane_tries > 0) {
        currCellIdx = randInt(0, activeCells.length - 1);
      } else if (rand < 0.6) {
        currCellIdx = -1;
      } else if (rand < 0.85) {
        currCellIdx = randInt(0, activeCells.length - 1);
      } else {
        currCellIdx = 0;
      }

      currCell = activeCells.at(currCellIdx);

      const { validNeighbours, validNeighboursZ } = getValidNeighbours(
        walkableBoard,
        currCell.z,
        currCell.y,
        currCell.x,
      );

      if (!validNeighbours.length && !validNeighboursZ.length) {
        activeCells.splice(currCellIdx, 1);
        continue;
      }

      if (n_same_plane_tries < 10 && !validNeighbours.length) {
        n_same_plane_tries += 1;
        continue;
      } else {
        n_same_plane_tries = 0;
      }

      const nextCellXY = randFromArray(validNeighbours);
      const nextCellZ = randFromArray(validNeighboursZ);

      const nextCell =
        Math.random() < 0.01
          ? (nextCellZ ?? nextCellXY)
          : (nextCellXY ?? nextCellZ);

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

    if (orientation === "floor") {
      return (this.floors - 1) * 2;
    }

    throw `orientation must be: "horizontal", "vertical"; but was ${orientation}`;
  }

  getCharFromIndex(k, i, j) {
    if (this.rawBoard[k][i][j] === EMPTY) {
      return KEYS.EMPTY_SPACE;
    }

    let trbl = [0, 0, 0, 0]; // [top, right, bottom, left]; 0: empty, 1: wall

    const topIdx = i - 1;
    const rightIdx = j + 1;
    const bottomIdx = i + 1;
    const leftIdx = j - 1;

    if (topIdx >= 0 && this.rawBoard[k][topIdx][j] === WALL) trbl[0] = 1;

    if (
      rightIdx <= this.getLastIndex("horizontal") &&
      this.rawBoard[k][i][rightIdx] === WALL
    )
      trbl[1] = 1;

    if (
      bottomIdx <= this.getLastIndex("vertical") &&
      this.rawBoard[k][bottomIdx][j] === WALL
    )
      trbl[2] = 1;

    if (leftIdx >= 0 && this.rawBoard[k][i][leftIdx] === WALL) trbl[3] = 1;

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

    const { k } = this.getRawPosFromXYZPos({ z: this.playerF });

    for (let i = 0; i <= this.getLastIndex("vertical"); i++) {
      process.stdout.write("\n");

      for (let j = 0; j <= this.getLastIndex("horizontal"); j++) {
        if (
          (i % 2 === 1 || j % 2 === 1) &&
          Object.keys(MAZE_OBJECTS).includes(String(this.rawBoard[k][i][j]))
        ) {
          process.stdout.write(MAZE_OBJECTS[String(this.rawBoard[k][i][j])]);
          continue;
        }

        if (i % 2 === 1 && j % 2 === 1) {
          let ladderChar;

          if (k > 0 && this.rawBoard[k - 1][i][j] === EMPTY) {
            ladderChar = LADDER_DOWN_CHAR;
          }

          if (
            k + 1 < this.rawBoard.length &&
            this.rawBoard[k + 1][i][j] === EMPTY
          ) {
            ladderChar =
              ladderChar === undefined ? LADDER_UP_CHAR : LADDER_BOTH_CHAR;
          }

          if (ladderChar !== undefined) {
            process.stdout.write(ladderChar);
            continue;
          }

          process.stdout.write(KEYS.EMPTY_SPACE);
          continue;
        }

        process.stdout.write(this.getCharFromIndex(k, i, j));
      }
    }
  }

  getRawPosFromXYZPos({ z, y, x }) {
    return {
      k: z * 2,
      i: y * 2 + 1,
      j: x * 2 + 1,
    };
  }

  setRawPositionFromXYZ({ z, y, x, value }) {
    const { k: newK, i: newI, j: newJ } = this.getRawPosFromXYZPos({ z, y, x });

    for (let k = 0; k <= this.getLastIndex("floor"); k += 2) {
      for (let i = 1; i <= this.getLastIndex("vertical"); i += 2) {
        for (let j = 1; j <= this.getLastIndex("horizontal"); j += 2) {
          if (this.rawBoard[k][i][j] === value) {
            this.rawBoard[k][i][j] = EMPTY;
          }
        }
      }
    }

    this.rawBoard[newK][newI][newJ] = value;
  }

  initPlayerPosition() {
    this.playerF = randInt(0, this.floors - 1);
    this.playerY = randInt(0, this.height - 1);
    this.playerX = randInt(0, this.width - 1);

    this.setRawPositionFromXYZ({
      z: this.playerF,
      y: this.playerY,
      x: this.playerX,
      value: PLAYER,
    });
  }

  initGoalPosition() {
    do {
      this.goalF = randInt(0, this.floors - 1);
      this.goalY = randInt(0, this.height - 1);
      this.goalX = randInt(0, this.width - 1);
    } while (this.hasReachedGoal());

    this.setRawPositionFromXYZ({
      z: this.goalF,
      y: this.goalY,
      x: this.goalX,
      value: GOAL,
    });
  }

  moveUp() {
    const { k, i, j } = this.getRawPosFromXYZPos({
      z: this.playerF,
      x: this.playerX,
      y: this.playerY,
    });

    if (this.rawBoard[k][i - 1][j] === WALL) {
      return;
    }

    this.playerY -= 1;
    this.setRawPositionFromXYZ({
      z: this.playerF,
      y: this.playerY,
      x: this.playerX,
      value: PLAYER,
    });
    this.draw();

    if (this.hasReachedGoal()) {
      this.loadMaze();
    }
  }

  moveDown() {
    const { k, i, j } = this.getRawPosFromXYZPos({
      z: this.playerF,
      x: this.playerX,
      y: this.playerY,
    });

    if (this.rawBoard[k][i + 1][j] === WALL) {
      return;
    }

    this.playerY += 1;
    this.setRawPositionFromXYZ({
      z: this.playerF,
      y: this.playerY,
      x: this.playerX,
      value: PLAYER,
    });
    this.draw();

    if (this.hasReachedGoal()) {
      this.loadMaze();
    }
  }

  moveRight() {
    const { k, i, j } = this.getRawPosFromXYZPos({
      z: this.playerF,
      x: this.playerX,
      y: this.playerY,
    });

    if (this.rawBoard[k][i][j + 1] === WALL) {
      return;
    }

    this.playerX += 1;
    this.setRawPositionFromXYZ({
      z: this.playerF,
      y: this.playerY,
      x: this.playerX,
      value: PLAYER,
    });
    this.draw();

    if (this.hasReachedGoal()) {
      this.loadMaze();
    }
  }

  moveLeft() {
    const { k, i, j } = this.getRawPosFromXYZPos({
      z: this.playerF,
      x: this.playerX,
      y: this.playerY,
    });

    if (this.rawBoard[k][i][j - 1] === WALL) {
      return;
    }

    this.playerX -= 1;
    this.setRawPositionFromXYZ({
      z: this.playerF,
      y: this.playerY,
      x: this.playerX,
      value: PLAYER,
    });
    this.draw();

    if (this.hasReachedGoal()) {
      this.loadMaze();
    }
  }

  goUpperFloor() {
    const { k, i, j } = this.getRawPosFromXYZPos({
      z: this.playerF,
      x: this.playerX,
      y: this.playerY,
    });

    if (k + 1 >= this.rawBoard.length || this.rawBoard[k + 1][i][j] === WALL) {
      return;
    }

    this.playerF += 1;
    this.setRawPositionFromXYZ({
      z: this.playerF,
      y: this.playerY,
      x: this.playerX,
      value: PLAYER,
    });
    this.draw();

    if (this.hasReachedGoal()) {
      this.loadMaze();
    }
  }

  goLowerFloor() {
    const { k, i, j } = this.getRawPosFromXYZPos({
      z: this.playerF,
      x: this.playerX,
      y: this.playerY,
    });

    if (k < 0 || this.rawBoard[k - 1][i][j] === WALL) {
      return;
    }

    this.playerF -= 1;
    this.setRawPositionFromXYZ({
      z: this.playerF,
      y: this.playerY,
      x: this.playerX,
      value: PLAYER,
    });
    this.draw();

    if (this.hasReachedGoal()) {
      this.loadMaze();
    }
  }

  hasReachedGoal() {
    return (
      this.goalY === this.playerY &&
      this.goalX === this.playerX &&
      this.goalF === this.playerF
    );
  }

  loadMaze() {
    this.initRandomMaze();
    this.initPlayerPosition();
    this.initGoalPosition();
    this.draw();
  }
}
