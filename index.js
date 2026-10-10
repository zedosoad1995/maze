import { Board, MAZE_VALUES } from "./board.js";
import { DIRECTIONS } from "./constants.js";

const PLAYER_SPRITE = "🤠";
const GOAL_SPRITE = "🪙";
const STAIRS_UP_SPRITE = "⬆️";
const STAIRS_DOWN_SPRITE = "⬇️";
const STAIRS_BOTH_SPRITE = "↕️";

function drawMaze({ canvas, maze, floor, cellSize, wallThickness }) {
  const context = canvas.getContext("2d");
  const k = floor * 2;
  const rawFloor = maze.rawBoard[k];

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "black";
  context.font = `${cellSize - 6}px sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (let row = 0; row < rawFloor.length; row++) {
    for (let column = 0; column < rawFloor[row].length; column++) {
      const isCellRow = row % 2 === 1;
      const isCellColumn = column % 2 === 1;

      const x =
        Math.floor(column / 2) * (cellSize + wallThickness) +
        (isCellColumn ? wallThickness : 0);
      const y =
        Math.floor(row / 2) * (cellSize + wallThickness) +
        (isCellRow ? wallThickness : 0);

      const width = isCellColumn ? cellSize : wallThickness;
      const height = isCellRow ? cellSize : wallThickness;

      const value = rawFloor[row][column];

      if (value === MAZE_VALUES.PLAYER || value === MAZE_VALUES.GOAL) {
        const sprite =
          value === MAZE_VALUES.PLAYER ? PLAYER_SPRITE : GOAL_SPRITE;
        context.fillText(sprite, x + width / 2, y + height / 2);
        continue;
      }

      // Draw stairs
      let stairSprite;

      if (k > 0 && maze.rawBoard[k - 1][row][column] === MAZE_VALUES.EMPTY) {
        stairSprite = STAIRS_DOWN_SPRITE;
      }

      if (
        k + 1 < maze.rawBoard.length &&
        maze.rawBoard[k + 1][row][column] === MAZE_VALUES.EMPTY
      ) {
        stairSprite =
          stairSprite === undefined ? STAIRS_UP_SPRITE : STAIRS_BOTH_SPRITE;
      }

      if (stairSprite !== undefined) {
        context.fillText(stairSprite, x + width / 2, y + height / 2);
        continue;
      }

      if (value === MAZE_VALUES.WALL) {
        context.fillRect(x, y, width, height);
      }
    }
  }
}

function init() {
  const cellSize = 20;
  const wallThickness = 2;
  const canvas = document.querySelector("#maze");
  const currentFloor = document.querySelector("#current-floor");
  const dimensionInputs = {
    floors: document.querySelector("#num-floors"),
    height: document.querySelector("#height"),
    width: document.querySelector("#width"),
  };
  const dimensions = {
    floors: 3,
    height: 15,
    width: 15,
  };
  let maze;

  const loadMaze = () => {
    canvas.width =
      dimensions.width * cellSize + (dimensions.width + 1) * wallThickness;
    canvas.height =
      dimensions.height * cellSize + (dimensions.height + 1) * wallThickness;

    maze = new Board(dimensions);
    maze.loadMaze();

    maze.draw = () => {
      currentFloor.textContent = `Floor ${maze.playerF + 1} of ${dimensions.floors}`;
      currentFloor.hidden = maze.floors === 1;

      drawMaze({
        canvas,
        maze,
        floor: maze.playerF,
        cellSize,
        wallThickness,
      });
    };

    maze.draw();
  };

  const commitDimension = (name) => {
    const input = dimensionInputs[name];
    const minimum = Number(input.min);
    const maximum = Number(input.max);
    const enteredValue = Number(input.value);

    if (input.value === "" || !Number.isFinite(enteredValue)) {
      input.value = dimensions[name];
      return;
    }

    const value = Math.min(
      maximum,
      Math.max(minimum, Math.round(enteredValue)),
    );

    input.value = value;

    if (value === dimensions[name]) {
      return;
    }

    dimensions[name] = value;
    loadMaze();
  };

  for (const [name, input] of Object.entries(dimensionInputs)) {
    input.addEventListener("change", () => commitDimension(name));
    input.addEventListener("blur", () => commitDimension(name));
  }

  loadMaze();

  const directionsByKey = {
    ArrowUp: DIRECTIONS.NORTH,
    ArrowDown: DIRECTIONS.SOUTH,
    ArrowRight: DIRECTIONS.RIGHT,
    ArrowLeft: DIRECTIONS.LEFT,
    u: DIRECTIONS.UP,
    d: DIRECTIONS.DOWN,
  };

  window.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement) {
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      maze.loadMaze();
      maze.draw();
      return;
    }

    const direction = directionsByKey[event.key];

    if (direction === undefined) {
      return;
    }

    event.preventDefault();
    maze.move(direction);
    maze.draw();

    if (maze.hasReachedGoal()) {
      maze.loadMaze();
      maze.draw();
      return;
    }
  });
}

init();
