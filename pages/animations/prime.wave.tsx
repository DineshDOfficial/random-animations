

/**
 * This is how Prime numbers sound like
 * Visualizing Prime numbers as Waves
 * I Made prime numbers into a audio file
 */
"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const generatePrimes = (count: number): number[] => {
    const sieve = new Array(count * 20).fill(true);
    sieve[0] = sieve[1] = false;
    for (let i = 2; i * i < sieve.length; i++) {
        if (sieve[i]) {
            for (let j = i * i; j < sieve.length; j += i) {
                sieve[j] = false;
            }
        }
    }
    return sieve.reduce((acc, val, idx) => val && acc.length < count ? [...acc, idx] : acc, []);
};

export default function PrimeWaveVisualizer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [primeCount, setPrimeCount] = useState(50);
    const [speed, setSpeed] = useState(0.01);

    const rendererRef = useRef<THREE.WebGLRenderer>();
    const sceneRef = useRef<THREE.Scene>();
    const lineRef = useRef<THREE.Line>();
    const cameraRef = useRef<THREE.OrthographicCamera>();
    const requestRef = useRef<number>();
    const primesRef = useRef<number[]>([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Scene & Camera
        const scene = new THREE.Scene();
        const aspect = width / height;
        const camera = new THREE.OrthographicCamera(-2 * aspect, 2 * aspect, 1, -1, 0.1, 10);
        camera.position.z = 10;
        sceneRef.current = scene;
        cameraRef.current = camera;

        // Prime Wave Line
        const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
        const points = Array.from({ length: 1000 }, (_, i) => new THREE.Vector3((i / 1000) * 4 - 2, 0, 0));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        lineRef.current = line;

        // Axes
        const axisMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const xAxis = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-2 * aspect, 0, 0),
            new THREE.Vector3(2 * aspect, 0, 0),
        ]);
        const yAxis = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(0, 1, 0),
        ]);
        scene.add(new THREE.Line(xAxis, axisMaterial));
        scene.add(new THREE.Line(yAxis, axisMaterial));

        const handleResize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            const aspect = width / height;
            camera.left = -2 * aspect;
            camera.right = 2 * aspect;
            camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(requestRef.current!);
            container.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
        };
    }, []);

    useEffect(() => {
        primesRef.current = generatePrimes(primeCount);
    }, [primeCount]);

    useEffect(() => {
        let t = 0;
        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);
            const line = lineRef.current;
            const camera = cameraRef.current;
            const scene = sceneRef.current;
            const renderer = rendererRef.current;
            const geometry = line?.geometry as THREE.BufferGeometry;
            const positions = geometry.attributes.position.array as Float32Array;

            for (let i = 0; i < 1000; i++) {
                const x = (i / 1000) * 4 - 2;
                let y = 0;
                for (const p of primesRef.current) {
                    y += (1 / Math.sqrt(p)) * Math.sin(p * (x + t));
                }
                y *= 0.2;
                positions[i * 3 + 1] = y;
            }

            geometry.attributes.position.needsUpdate = true;
            renderer?.render(scene!, camera!);
            t += speed;
        };
        animate();
        return () => cancelAnimationFrame(requestRef.current!);
    }, [speed]);

    const generateAudio = () => {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const duration = 5;
        const sampleRate = audioCtx.sampleRate;
        const buffer = audioCtx.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        const primes = generatePrimes(primeCount);

        for (let i = 0; i < data.length; i++) {
            let sample = 0;
            const t = i / sampleRate;
            for (const p of primes) {
                sample += (1 / Math.sqrt(p)) * Math.sin(2 * Math.PI * p * 100 * t);
            }
            data[i] = sample * 0.1;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#000" }}>
            <div style={{ border: "2px solid white", position: "relative", width: "80%", height: "80%" }}>
                <div style={{
                    position: "absolute",
                    top: 10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 1,
                    color: "white",
                    textAlign: "center",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    padding: "10px 20px",
                    borderRadius: "10px"
                }}>
                    <label>
                        Prime Number Limit: {primeCount}
                        <input type="range" min={1} max={100} value={primeCount}
                            onChange={(e) => setPrimeCount(parseInt(e.target.value))} />
                    </label>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <label>
                         Speed: {speed.toFixed(3)}
                        <input type="range" min={0} max={0.05} step={0.001}
                            value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} />
                    </label>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <button onClick={generateAudio}>Play Sound</button>
                </div>
                <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
            </div>
        </div>
    );
}
