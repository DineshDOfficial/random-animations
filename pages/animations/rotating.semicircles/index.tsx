import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SemiCircles = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const speedRef = useRef(0.01);
    const [numLayers, setNumLayers] = useState(20);

    const sceneRef = useRef<THREE.Scene>();
    const circleGroupRef = useRef<THREE.Group>(new THREE.Group());

    // Sound system
    const audioCtxRef = useRef<AudioContext | null>(null);
    const lastPlayedTimeRef = useRef<number[]>([]); // per layer timestamp

    const playTone = (frequency: number, duration = 0.005, volume = 0.1) => {
        if (!audioCtxRef.current) return;
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();

        osc.type = "sine";
        osc.frequency.value = frequency;

        gain.gain.value = volume;

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        osc.start();
        osc.stop(audioCtxRef.current.currentTime + duration);
    };

    useEffect(() => {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        lastPlayedTimeRef.current = new Array(numLayers).fill(0);

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            100,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 15;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current?.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        scene.add(circleGroupRef.current);

        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const now = performance.now();

            circleGroupRef.current.children.forEach((child, i) => {
                child.rotation.z += speedRef.current * (i + 1);

                // Play sound for every 5th layer only, every 150ms at most
                if (i % 5 === 0 && now - lastPlayedTimeRef.current[i] > 150) {
                    const freq = 200 + i * 30;
                    playTone(freq, 0.05, 0.05);
                    lastPlayedTimeRef.current[i] = now;
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

        window.addEventListener("resize", handleResize);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("keydown", handleKeyDown);
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

        // Resize audio tracking array
        lastPlayedTimeRef.current = new Array(numLayers).fill(0);
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
