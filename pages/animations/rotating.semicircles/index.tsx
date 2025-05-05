// pages/semi-circles.tsx

import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SemiCircles = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const speedRef = useRef(0.01);
    const [numLayers, setNumLayers] = useState(20);

    const sceneRef = useRef<THREE.Scene>();
    const circleGroupRef = useRef<THREE.Group>(new THREE.Group());

    const audioCtxRef = useRef<AudioContext | null>(null);
    const rotationTrackerRef = useRef<number[]>([]);
    const lastTriggerTimeRef = useRef<number[]>([]);

    const playTrippyTone = (frequency: number, layerIndex: number) => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner();

        osc1.type = "sawtooth";
        osc1.frequency.value = frequency;

        osc2.type = "triangle";
        osc2.frequency.value = frequency * 1.01;

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

        const panValue = ((layerIndex % 10) - 5) / 5;
        panner.pan.setValueAtTime(panValue, ctx.currentTime);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.5);
        osc2.stop(ctx.currentTime + 0.5);
    };

    useEffect(() => {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current?.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        scene.add(circleGroupRef.current);

        rotationTrackerRef.current = new Array(numLayers).fill(0);
        lastTriggerTimeRef.current = new Array(numLayers).fill(0);
        const startTime = performance.now();

        // Trigger initial sound immediately
        for (let i = 0; i < numLayers; i++) {
            const freq = 200 + i * 30;
            playTrippyTone(freq, i);
        }

        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const now = performance.now();

            circleGroupRef.current.children.forEach((child, i) => {
                const rotationSpeed = speedRef.current * (i + 1);
                child.rotation.z += rotationSpeed;

                rotationTrackerRef.current[i] += rotationSpeed;

                // Trigger sound on every PI (~180°) rotation
                if (rotationTrackerRef.current[i] >= Math.PI) {
                    rotationTrackerRef.current[i] -= Math.PI;

                    const freq = 200 + i * 30;
                    playTrippyTone(freq, i);
                }
            });

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp") speedRef.current += 0.002;
            else if (e.key === "ArrowDown") speedRef.current = Math.max(0, speedRef.current - 0.002);
            else if (e.key === "+") setNumLayers((prev) => Math.min(prev + 1, 100));
            else if (e.key === "-") setNumLayers((prev) => Math.max(prev - 1, 1));
        };

        const resumeAudioContext = () => {
            if (audioCtxRef.current?.state === "suspended") {
                audioCtxRef.current.resume();
            }
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("click", resumeAudioContext);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("click", resumeAudioContext);
            mountRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
            audioCtxRef.current?.close();
        };
    }, []);

    useEffect(() => {
        const group = circleGroupRef.current;

        while (group.children.length > 0) {
            const mesh = group.children[0] as THREE.Mesh;
            mesh.geometry.dispose();
            (mesh.material as THREE.Material).dispose();
            group.remove(mesh);
        }

        const radiusStep = 0.6;
        const thickness = 0.2;
        const segments = 24;

        for (let i = 0; i < numLayers; i++) {
            const radius = 2 + i * radiusStep;
            const points: THREE.Vector3[] = [];

            for (let j = 0; j <= segments; j++) {
                const theta = Math.PI * (j / segments);
                const x = radius * Math.cos(theta);
                const y = radius * Math.sin(theta);
                points.push(new THREE.Vector3(x, y, 0));
            }

            const curve = new THREE.CatmullRomCurve3(points);
            const geometry = new THREE.TubeGeometry(curve, segments, thickness, 8, false);
            const color = new THREE.Color(`hsl(${(i * 360) / numLayers}, 100%, 60%)`);
            const material = new THREE.MeshStandardMaterial({
                color,
                emissive: color.clone().multiplyScalar(0.4),
                roughness: 0.3,
                metalness: 0.6,
            });

            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
        }

        // Reset rotation and sound tracking
        rotationTrackerRef.current = new Array(numLayers).fill(0);
        lastTriggerTimeRef.current = new Array(numLayers).fill(0);
    }, [numLayers]);

    return (
        <>
            <Head>
                <title>Rotating Semicircles | Random Animations</title>
            </Head>
            <div ref={mountRef} style={{ width: "100vw", height: "100vh", overflow: "hidden" }} />
            <div
                style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    color: "white",
                    fontSize: 16,
                    background: "rgba(0,0,0,0.6)",
                    padding: "8px 12px",
                    borderRadius: 6,
                }}
            >
                <div>Speed: {speedRef.current.toFixed(3)}</div>
                <div>Layers: {numLayers}</div>
                <div>↑/↓: Speed | + / - : Layers</div>
            </div>
        </>
    );
};

export default SemiCircles;
