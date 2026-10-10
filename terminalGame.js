import { Board } from "./board.js";
import { DIRECTIONS, KEYS } from "./constants.js";

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

const floors = 2;
const height = 15;
const width = 20;

const maze = new Board({ floors, height, width });
maze.loadMaze();

process.stdin.on("data", (key) => {
  if (key === KEYS.EMPTY_SPACE) {
    maze.loadMaze();
  }

  if (key === KEYS.UP) {
    maze.moveUntilNextChoice(DIRECTIONS.NORTH);
  }

  if (key === KEYS.DOWN) {
    maze.moveUntilNextChoice(DIRECTIONS.SOUTH);
  }

  if (key === KEYS.RIGHT) {
    maze.moveUntilNextChoice(DIRECTIONS.RIGHT);
  }

  if (key === KEYS.LEFT) {
    maze.moveUntilNextChoice(DIRECTIONS.LEFT);
  }

  if (key === "u") {
    maze.moveUntilNextChoice(DIRECTIONS.UP);
  }

  if (key === "d") {
    maze.moveUntilNextChoice(DIRECTIONS.DOWN);
  }

  if (key === "\u0003") {
    process.exit();
  }
});
