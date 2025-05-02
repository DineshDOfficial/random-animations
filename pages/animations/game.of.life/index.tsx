import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type CellState = 0 | 1;
const CELL_SIZE = 0.2;
const ROWS = 100;
const COLS = 100;

function createGrid(rows: number, cols: number): CellState[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() > 0.8 ? 1 : 0))
  );
}

function nextGeneration(grid: CellState[][]): CellState[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = grid.map((row) => [...row]);

  const get = (r: number, c: number) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return 0;
    return grid[r][c];
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const neighbors =
        get(r - 1, c - 1) + get(r - 1, c) + get(r - 1, c + 1) +
        get(r, c - 1) + get(r, c + 1) +
        get(r + 1, c - 1) + get(r + 1, c) + get(r + 1, c + 1);

      if (grid[r][c] === 1) {
        newGrid[r][c] = neighbors < 2 || neighbors > 3 ? 0 : 1;
      } else {
        newGrid[r][c] = neighbors === 3 ? 1 : 0;
      }
    }
  }

  return newGrid;
}

function Grid({ running, speed, reset }: { running: boolean; speed: number; reset: boolean }) {
  const [grid, setGrid] = useState<CellState[][]>(() => createGrid(ROWS, COLS));
  const lastUpdate = useRef(0);

  useEffect(() => {
    if (reset) {
      setGrid(createGrid(ROWS, COLS));
    }
  }, [reset]);

  useFrame((state) => {
    const now = state.clock.getElapsedTime();
    if (!running) return;
    if (now - lastUpdate.current >= 1 / speed) {
      setGrid((prev) => nextGeneration(prev));
      lastUpdate.current = now;
    }
  });

  return (
    <>
      {grid.map((row, i) =>
        row.map((cell, j) =>
          cell === 1 ? (
            <mesh
              key={`${i}-${j}`}
              position={[
                (i - ROWS / 2) * CELL_SIZE,
                0,
                (j - COLS / 2) * CELL_SIZE,
              ]}
            >
              <boxGeometry args={[CELL_SIZE, 0.01, CELL_SIZE]} />
              <meshStandardMaterial color="cyan" />
            </mesh>
          ) : null
        )
      )}
    </>
  );
}

function FixedTopDownCamera() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 20, 0); // Y axis up
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, -1); // align Z to down
  }, [camera]);

  return null;
}

export default function Home() {
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [resetTrigger, setResetTrigger] = useState(false);

  const handleReset = () => {
    setResetTrigger(true);
    setTimeout(() => setResetTrigger(false), 50);
  };

  return (
    <div>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.6)',
          padding: '10px',
          color: 'white',
          borderRadius: '8px',
          zIndex: 100,
        }}
      >
        <button onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Play'}
        </button>
        <button onClick={handleReset} style={{ marginLeft: '10px' }}>
          Reset
        </button>
        <label style={{ marginLeft: '10px' }}>
          Speed: {speed}
          <input
            type="range"
            min={1}
            max={20}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
      </div>

      <Canvas
        orthographic
        camera={{ zoom: 50 }}
        style={{ width: '100vw', height: '100vh', background: 'black' }}
      >
        <ambientLight intensity={0.8} />
        <FixedTopDownCamera />
        <Grid running={running} speed={speed} reset={resetTrigger} />
      </Canvas>
    </div>
  );
}
