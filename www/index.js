import { Universe, Cell } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";

const FPS = 20;
const CELL_SIZE = 15; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

// Set full window width and height
const WIDTH = Math.round((window.innerWidth - 1) / (CELL_SIZE + 1));
const HEIGHT = Math.round((window.innerHeight - 1) / (CELL_SIZE + 1));

const playPauseButton = document.getElementById("btn-play-pause");
const cleanButton = document.getElementById("btn-clean");
const rangeFPS = document.getElementById("range-fps");
const rangeFPSLabel = document.getElementById("label-range-fps");
const canvas = document.getElementById("game-of-life-canvas");

canvas.height = (CELL_SIZE + 1) * HEIGHT + 1;
canvas.width = (CELL_SIZE + 1) * WIDTH + 1;
const ctx = canvas.getContext("2d");

rangeFPS.value = FPS;
rangeFPSLabel.innerHTML = `FPS: ${rangeFPS.value}`;

const universe = Universe.new(WIDTH, HEIGHT);
let animationId = null;
let start = 0;
let fpsInterval = 1000 / rangeFPS.value;

const isPaused = () => {
    return animationId === null;
};

const play = () => {
    playPauseButton.textContent = "Stop";
    renderLoop();
};

const pause = () => {
    playPauseButton.textContent = "Start";
    cancelAnimationFrame(animationId);
    animationId = null;
};

rangeFPS.addEventListener("input", () => {
    fpsInterval = 1000 / rangeFPS.value;
    rangeFPSLabel.innerHTML = `FPS: ${rangeFPS.value}`;
});

playPauseButton.addEventListener("click", () => {
    if (isPaused()) {
        play();
    } else {
        pause();
    }
});

cleanButton.addEventListener("click", () => {
    universe.clean();
    pause();
    drawGrid();
    drawCells();
});

canvas.addEventListener("click", (event) => {
    const boundingRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;

    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), HEIGHT - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), WIDTH - 1);

    universe.toggle_cell(row, col);

    drawGrid();
    drawCells();
});

const renderLoop = (timestamp) => {
    const elapsed = timestamp - start;

    if (elapsed >= fpsInterval) {
        start = timestamp;
        universe.tick();

        drawGrid();
        drawCells();
    }
    animationId = requestAnimationFrame(renderLoop);
};

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    // Vertical lines.
    for (let i = 0; i <= WIDTH; i++) {
        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * HEIGHT + 1);
    }

    // Horizontal lines.
    for (let j = 0; j <= HEIGHT; j++) {
        ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
        ctx.lineTo((CELL_SIZE + 1) * WIDTH + 1, j * (CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
};

const getIndex = (row, column) => {
    return row * WIDTH + column;
};

const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, WIDTH * HEIGHT);

    ctx.beginPath();

    for (let row = 0; row < HEIGHT; row++) {
        for (let col = 0; col < WIDTH; col++) {
            const idx = getIndex(row, col);

            ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

            ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }

    ctx.stroke();
};

drawGrid();
drawCells();
play();
