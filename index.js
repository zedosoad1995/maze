import { Board } from "./board.js";
import { DIRECTIONS, KEYS } from "./constants.js";

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

const floors = 5;
const height = 10;
const width = 20;

const maze = new Board({ floors, height, width });
maze.loadMaze();

process.stdin.on("data", (key) => {
  if (key === KEYS.EMPTY_SPACE) {
    maze.loadMaze();
  }

  if (key === KEYS.UP) {
    maze.move(DIRECTIONS.NORTH);
  }

  if (key === KEYS.DOWN) {
    maze.move(DIRECTIONS.SOUTH);
  }

  if (key === KEYS.RIGHT) {
    maze.move(DIRECTIONS.RIGHT);
  }

  if (key === KEYS.LEFT) {
    maze.move(DIRECTIONS.LEFT);
  }

  if (key === "u") {
    maze.move(DIRECTIONS.UP);
  }

  if (key === "d") {
    maze.move(DIRECTIONS.DOWN);
  }

  if (key === "\u0003") {
    process.exit();
  }
});
