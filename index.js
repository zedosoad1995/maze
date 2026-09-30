import { Board } from "./board.js";
import { KEYS } from "./constants.js";

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

const height = 10;
const width = 22;

const maze = new Board({ height, width });
maze.initRandomMaze();
maze.initPlayerPosition();
maze.draw();

process.stdin.on("data", (key) => {
  if (key === KEYS.EMPTY_SPACE) {
    maze.initRandomMaze();
    maze.initPlayerPosition();
    maze.draw();
  }

  if (key === KEYS.UP) {
    maze.moveUp();
  }

  if (key === KEYS.DOWN) {
    maze.moveDown();
  }

  if (key === KEYS.RIGHT) {
    maze.moveRight();
  }

  if (key === KEYS.LEFT) {
    maze.moveLeft();
  }

  if (key === "\u0003") {
    process.exit();
  }
});
