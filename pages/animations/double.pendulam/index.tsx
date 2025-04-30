import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const DEFAULT_PARAMS = {
    theta1: Math.PI / 2,
    theta2: Math.PI / 2 + 0.01,
    l1: 1.2,
    l2: 1.2,
    m1: 1,
    m2: 1,
    speed: 5,
};

export default function MultiPendulumPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [numPendulums, setNumPendulums] = useState(1000);
    const [params, setParams] = useState(DEFAULT_PARAMS);

    useEffect(() => {
        if (!containerRef.current) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(80, width / height, 0.5, 300);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        canvasRef.current?.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        const pivot = new THREE.Vector3(0, 1.5, 0);
        const trailLen = 1000;
        const dt = 0.016;

        const pendulums: any[] = [];

        for (let i = 0; i < numPendulums; i++) {
            const offset = i * 0.0001; // Small offset in angle or velocity
            const p = {
                theta1: params.theta1,
                theta2: params.theta2 + offset,
                omega1: 0,
                omega2: 0,
                l1: params.l1,
                l2: params.l2,
                m1: params.m1,
                m2: params.m2,
                sphere1: new THREE.Mesh(new THREE.SphereGeometry(0.04), new THREE.MeshStandardMaterial({ color: 0xff3333 })),
                sphere2: new THREE.Mesh(new THREE.SphereGeometry(0.04), new THREE.MeshStandardMaterial({ color: 0x3333ff })),
                line1: new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff })),
                line2: new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff })),
                trail1: new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: new THREE.Color(`hsl(${i * 360 / numPendulums}, 100%, 50%)`) })),
                trail2: new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: new THREE.Color(`hsl(${(i * 360 / numPendulums + 180) % 360}, 100%, 50%)`) })),
                trail1Positions: new Float32Array(trailLen * 3),
                trail2Positions: new Float32Array(trailLen * 3),
                trailIndex: 0,
            };
            p.trail1.geometry.setAttribute('position', new THREE.BufferAttribute(p.trail1Positions, 3));
            p.trail2.geometry.setAttribute('position', new THREE.BufferAttribute(p.trail2Positions, 3));
            scene.add(p.sphere1, p.sphere2, p.line1, p.line2, p.trail1, p.trail2);
            pendulums.push(p);
        }

        const pivotDot = new THREE.Mesh(new THREE.SphereGeometry(0.03), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        pivotDot.position.copy(pivot);
        scene.add(pivotDot);

        let running = true;

        function updatePendulum(p: any) {
            const { m1, m2, l1, l2 } = p;
            const delta = p.theta2 - p.theta1;
            const den1 = (m1 + m2) * l1 - m2 * l1 * Math.cos(delta) ** 2;

            const a1 = (
                m2 * l1 * p.omega1 ** 2 * Math.sin(delta) * Math.cos(delta) +
                m2 * 9.81 * Math.sin(p.theta2) * Math.cos(delta) +
                m2 * l2 * p.omega2 ** 2 * Math.sin(delta) -
                (m1 + m2) * 9.81 * Math.sin(p.theta1)
            ) / den1;

            const den2 = (l2 / l1) * den1;
            const a2 = (
                -m2 * l2 * p.omega2 ** 2 * Math.sin(delta) * Math.cos(delta) +
                (m1 + m2) * 9.81 * Math.sin(p.theta1) * Math.cos(delta) -
                (m1 + m2) * l1 * p.omega1 ** 2 * Math.sin(delta) -
                (m1 + m2) * 9.81 * Math.sin(p.theta2)
            ) / den2;

            p.omega1 += a1 * dt * params.speed;
            p.omega2 += a2 * dt * params.speed;
            p.theta1 += p.omega1 * dt * params.speed;
            p.theta2 += p.omega2 * dt * params.speed;
        }

        function updateVisuals(p: any) {
            const x1 = pivot.x + p.l1 * Math.sin(p.theta1);
            const y1 = pivot.y - p.l1 * Math.cos(p.theta1);
            const x2 = x1 + p.l2 * Math.sin(p.theta2);
            const y2 = y1 - p.l2 * Math.cos(p.theta2);
            const p1 = new THREE.Vector3(x1, y1, 0);
            const p2 = new THREE.Vector3(x2, y2, 0);

            p.sphere1.position.copy(p1);
            p.sphere2.position.copy(p2);
            p.line1.geometry.setFromPoints([pivot, p1]);
            p.line2.geometry.setFromPoints([p1, p2]);

            if (p.trailIndex < trailLen) {
                p.trail1Positions.set([p1.x, p1.y, p1.z], p.trailIndex * 3);
                p.trail2Positions.set([p2.x, p2.y, p2.z], p.trailIndex * 3);
                p.trail1.geometry.setDrawRange(0, p.trailIndex);
                p.trail2.geometry.setDrawRange(0, p.trailIndex);
                p.trail1.geometry.attributes.position.needsUpdate = true;
                p.trail2.geometry.attributes.position.needsUpdate = true;
                p.trailIndex++;
            }
        }

        function animate() {
            if (!running) return;
            requestAnimationFrame(animate);
            for (let p of pendulums) {
                updatePendulum(p);
                updateVisuals(p);
            }
            renderer.render(scene, camera);
        }

        animate();

        return () => {
            running = false;
            renderer.dispose();
            canvasRef.current?.removeChild(renderer.domElement);
        };
    }, [params, numPendulums]);

    return (
        <>
            <Head>
                <title>Double Pendulum | Random Animations</title>
            </Head>
            <div ref={containerRef} style={{ position: 'relative', width: '100vw', height: '100vh' }}>
                <div ref={canvasRef} />
                <div style={{
                    position: 'absolute', top: 10, left: 10, background: '#111',
                    padding: '10px', color: '#fff', borderRadius: '8px', fontSize: '12px'
                }}>
                    <label>Number of Pendulums: {numPendulums}</label>
                    <input
                        type="range"
                        min="1"
                        max="1000"
                        value={numPendulums}
                        step="5"
                        onChange={(e) => setNumPendulums(parseInt(e.target.value))}
                    />
                    {Object.keys(params).map((key) => (
                        <div key={key}>
                            <label>{key}: </label>
                            <input
                                type="range"
                                min={key.includes('theta') ? "0" : "0.1"}
                                max={key === 'speed' ? "20" : key.includes('theta') ? "6.28" : "3"}
                                step="0.01"
                                value={params[key as keyof typeof params]}
                                onChange={(e) =>
                                    setParams({ ...params, [key]: parseFloat(e.target.value) })
                                }
                            />
                        </div>
                    ))}
                    <button onClick={() => window.location.reload()}>🔁 Reset</button>
                </div>
            </div>
        </>

    );
}
