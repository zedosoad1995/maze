import { Board, MAZE_VALUES } from "./board.js";
import { DIRECTIONS } from "./constants.js";
import { minMax } from "./helpers.js";

const PLAYER_SPRITE = "🤠";
const GOAL_SPRITE = "🪙";
const STAIRS_UP_SPRITE = "⬆️";
const STAIRS_DOWN_SPRITE = "⬇️";
const STAIRS_BOTH_SPRITE = "↕️";

const msPerTile = 50;
const cellSize = 20;
const wallThickness = 2;

function drawMaze({ canvas, maze, floor, doNotDraw = {} }) {
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

        if (value === MAZE_VALUES.PLAYER && !doNotDraw.player) {
          context.fillText(sprite, x + width / 2, y + height / 2);
        }
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
  const canvas = document.querySelector("#maze");
  const context2D = canvas.getContext("2d");
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
  let floor;
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

  let t0;
  const animateOneTileMovement =
    ({ initialPosition, finalPosition }) =>
    () => {
      const t = performance.now();
      if (t0 === undefined) {
        t0 = t;
      }

      const slopeX = (finalPosition.x - initialPosition.x) / msPerTile;
      const slopeY = (finalPosition.y - initialPosition.y) / msPerTile;

      const currentX = minMax(initialPosition.x + slopeX * (t - t0), [
        initialPosition.x,
        finalPosition.x,
      ]);
      const currentY = minMax(initialPosition.y + slopeY * (t - t0), [
        initialPosition.y,
        finalPosition.y,
      ]);

      drawMaze({ canvas, maze, floor, doNotDraw: { player: true } });

      context2D.fillStyle = "black";
      context2D.font = `${cellSize - 6}px sans-serif`;
      context2D.textAlign = "center";
      context2D.textBaseline = "middle";
      context2D.fillText(
        PLAYER_SPRITE,
        currentX + cellSize / 2,
        currentY + cellSize / 2,
      );

      if (currentX !== finalPosition.x || currentY !== finalPosition.y) {
        requestAnimationFrame(
          animateOneTileMovement({
            initialPosition,
            finalPosition,
            t0,
          }),
        );
      }
    };

  const move = ({ maze, direction }) => {
    let x = maze.playerX * (cellSize + wallThickness) + wallThickness;
    let y = maze.playerY * (cellSize + wallThickness) + wallThickness;

    const initialPosition = {
      x,
      y,
      z: maze.playerF,
    };

    maze.move(direction);

    x = maze.playerX * (cellSize + wallThickness) + wallThickness;
    y = maze.playerY * (cellSize + wallThickness) + wallThickness;

    const finalPosition = {
      x,
      y,
      z: maze.playerF,
    };

    t0 = undefined;
    requestAnimationFrame(
      animateOneTileMovement({
        initialPosition,
        finalPosition,
        t0,
      }),
    );
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
    z: DIRECTIONS.UP,
    x: DIRECTIONS.DOWN,
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

    floor = maze.playerF;

    event.preventDefault();
    move({ maze, direction });
    maze.draw();

    if (maze.hasReachedGoal()) {
      maze.loadMaze();
      maze.draw();
      return;
    }
  });
}

init();
