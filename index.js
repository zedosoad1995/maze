import { Board, MAZE_VALUES } from "./board.js";
import { DIRECTIONS } from "./constants.js";
import { minMax } from "./helpers.js";

const PLAYER_SPRITE = "🤠";
const GOAL_SPRITE = "🪙";
const STAIRS_UP_SPRITE = "⬆️";
const STAIRS_DOWN_SPRITE = "⬇️";
const STAIRS_BOTH_SPRITE = "↕️";

const msPerTile = 20;
const cellSize = 20;
const wallThickness = 2;

let isPlayerMoving = false;

const drawSprite = ({ row, col, sprite, context2D }) => {
  const x = col * (cellSize + wallThickness) + wallThickness;
  const y = row * (cellSize + wallThickness) + wallThickness;
  context2D.fillText(sprite, x + cellSize / 2, y + cellSize / 2);
};

function drawMaze({ canvas, maze, doNotDraw = {} }) {
  const context = canvas.getContext("2d");
  const k = maze.playerF * 2;
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
      }

      if (value === MAZE_VALUES.WALL) {
        context.fillRect(x, y, width, height);
      }
    }
  }

  // Draw Player
  if (!doNotDraw.player) {
    drawSprite({
      row: maze.playerY,
      col: maze.playerX,
      sprite: PLAYER_SPRITE,
      context2D: context,
    });
  }

  if (maze.goalF === maze.playerF) {
    drawSprite({
      row: maze.goalY,
      col: maze.goalX,
      sprite: GOAL_SPRITE,
      context2D: context,
    });
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
  const touchControlButtons = document.querySelectorAll(
    ".touch-controls [data-direction]",
  );
  const directionsByName = {
    north: DIRECTIONS.NORTH,
    south: DIRECTIONS.SOUTH,
    right: DIRECTIONS.RIGHT,
    left: DIRECTIONS.LEFT,
    up: DIRECTIONS.UP,
    down: DIRECTIONS.DOWN,
  };

  const dimensions = {
    floors: 3,
    height: 15,
    width: 15,
  };
  let maze;

  const updateTouchControls = () => {
    for (const button of touchControlButtons) {
      const direction = directionsByName[button.dataset.direction];
      button.disabled =
        isPlayerMoving ||
        !maze?.canMove({
          z: maze.playerF,
          x: maze.playerX,
          y: maze.playerY,
          direction,
        });
    }
  };

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
      });
      updateTouchControls();
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
  const animateUntilNextChoice =
    ({ path }) =>
    () => {
      const t = performance.now();
      if (t0 === undefined) {
        t0 = t;

        for (let i = 0; i < path.length; i++) {
          path[i].x = path[i].x * (cellSize + wallThickness) + wallThickness;
          path[i].y = path[i].y * (cellSize + wallThickness) + wallThickness;
          path[i].t = t0 + i * msPerTile;
        }
      }

      let targetPathIdx = path.findIndex((tile) => t < tile.t);
      targetPathIdx = targetPathIdx === -1 ? path.length - 1 : targetPathIdx;

      const finalPositionX = path[targetPathIdx].x;
      const finalPositionY = path[targetPathIdx].y;

      const initialPositionX = path[Math.max(targetPathIdx - 1, 0)].x;
      const initialPositionY = path[Math.max(targetPathIdx - 1, 0)].y;
      const initialTime = path[Math.max(targetPathIdx - 1, 0)].t;

      const slopeX = (finalPositionX - initialPositionX) / msPerTile;
      const slopeY = (finalPositionY - initialPositionY) / msPerTile;

      const currentX = minMax(initialPositionX + slopeX * (t - initialTime), [
        initialPositionX,
        finalPositionX,
      ]);
      const currentY = minMax(initialPositionY + slopeY * (t - initialTime), [
        initialPositionY,
        finalPositionY,
      ]);

      drawMaze({ canvas, maze, doNotDraw: { player: true } });

      context2D.fillStyle = "black";
      context2D.font = `${cellSize - 6}px sans-serif`;
      context2D.textAlign = "center";
      context2D.textBaseline = "middle";
      context2D.fillText(
        PLAYER_SPRITE,
        currentX + cellSize / 2,
        currentY + cellSize / 2,
      );

      if (t < path.at(-1).t) {
        requestAnimationFrame(
          animateUntilNextChoice({
            path,
          }),
        );
      } else {
        isPlayerMoving = false;
        if (maze.hasReachedGoal()) {
          maze.loadMaze();
          maze.draw();
        } else {
          updateTouchControls();
        }
      }
    };

  const moveUntilNextChoice = ({ maze, direction }) => {
    const path = maze.moveUntilNextChoice(direction);

    if (!path?.length) {
      isPlayerMoving = false;
      updateTouchControls();
      return;
    }

    if (path[0].z !== path[1].z) {
      drawMaze({ canvas, maze });
      isPlayerMoving = false;
      updateTouchControls();
      return;
    }

    t0 = undefined;
    requestAnimationFrame(
      animateUntilNextChoice({
        path,
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

  const movePlayer = (direction) => {
    if (isPlayerMoving) {
      return;
    }

    isPlayerMoving = true;
    updateTouchControls();
    moveUntilNextChoice({ maze, direction });
  };

  for (const button of touchControlButtons) {
    button.addEventListener("click", () => {
      movePlayer(directionsByName[button.dataset.direction]);
    });
  }

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

    movePlayer(direction);
  });
}

init();
