import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function DoublePendulumPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [params, setParams] = useState({
        theta1: Math.PI / 2,
        theta2: Math.PI / 2 + 0.01,
        l1: 1.2,
        l2: 1.2,
        m1: 1,
        m2: 1,
        speed: 1,
    });

    useEffect(() => {
        if (!containerRef.current) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        canvasRef.current?.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        // State
        let { theta1, theta2, l1, l2, m1, m2, speed } = params;
        let omega1 = 0;
        let omega2 = 0;

        const pivot = new THREE.Vector3(0, 1.5, 0);
        const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.07), new THREE.MeshStandardMaterial({ color: 0xff3333 }));
        const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.07), new THREE.MeshStandardMaterial({ color: 0x3333ff }));
        const pivotDot = new THREE.Mesh(new THREE.SphereGeometry(0.03), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        pivotDot.position.copy(pivot);

        // Lines to connect
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const line1Geo = new THREE.BufferGeometry().setFromPoints([pivot, new THREE.Vector3()]);
        const line2Geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        const line1 = new THREE.Line(line1Geo, lineMaterial);
        const line2 = new THREE.Line(line2Geo, lineMaterial);

        // Trails
        const trailLen = 3000;
        const trail1Geo = new THREE.BufferGeometry();
        const trail2Geo = new THREE.BufferGeometry();
        const trail1Positions = new Float32Array(trailLen * 3);
        const trail2Positions = new Float32Array(trailLen * 3);
        trail1Geo.setAttribute('position', new THREE.BufferAttribute(trail1Positions, 3));
        trail2Geo.setAttribute('position', new THREE.BufferAttribute(trail2Positions, 3));
        const trail1 = new THREE.Line(trail1Geo, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
        const trail2 = new THREE.Line(trail2Geo, new THREE.LineBasicMaterial({ color: 0xffff00 }));

        scene.add(sphere1, sphere2, line1, line2, trail1, trail2, pivotDot);

        let trailIndex = 0;
        const dt = 0.016;

        function updatePhysics() {
            const delta = theta2 - theta1;
            const den1 = (m1 + m2) * l1 - m2 * l1 * Math.cos(delta) ** 2;

            const a1 = (
                m2 * l1 * omega1 ** 2 * Math.sin(delta) * Math.cos(delta) +
                m2 * 9.81 * Math.sin(theta2) * Math.cos(delta) +
                m2 * l2 * omega2 ** 2 * Math.sin(delta) -
                (m1 + m2) * 9.81 * Math.sin(theta1)
            ) / den1;

            const den2 = (l2 / l1) * den1;
            const a2 = (
                -m2 * l2 * omega2 ** 2 * Math.sin(delta) * Math.cos(delta) +
                (m1 + m2) * 9.81 * Math.sin(theta1) * Math.cos(delta) -
                (m1 + m2) * l1 * omega1 ** 2 * Math.sin(delta) -
                (m1 + m2) * 9.81 * Math.sin(theta2)
            ) / den2;

            omega1 += a1 * dt * speed;
            omega2 += a2 * dt * speed;
            theta1 += omega1 * dt * speed;
            theta2 += omega2 * dt * speed;
        }

        function updatePositions() {
            const x1 = pivot.x + l1 * Math.sin(theta1);
            const y1 = pivot.y - l1 * Math.cos(theta1);
            const x2 = x1 + l2 * Math.sin(theta2);
            const y2 = y1 - l2 * Math.cos(theta2);

            const p1 = new THREE.Vector3(x1, y1, 0);
            const p2 = new THREE.Vector3(x2, y2, 0);

            sphere1.position.copy(p1);
            sphere2.position.copy(p2);

            // Update lines
            line1.geometry.setFromPoints([pivot, p1]);
            line2.geometry.setFromPoints([p1, p2]);

            // Trails
            if (trailIndex < trailLen) {
                trail1Positions.set([p1.x, p1.y, p1.z], trailIndex * 3);
                trail2Positions.set([p2.x, p2.y, p2.z], trailIndex * 3);
                trail1.geometry.setDrawRange(0, trailIndex);
                trail2.geometry.setDrawRange(0, trailIndex);
                trail1.geometry.attributes.position.needsUpdate = true;
                trail2.geometry.attributes.position.needsUpdate = true;
                trailIndex++;
            }
        }

        let running = true;
        function animate() {
            if (!running) return;
            requestAnimationFrame(animate);
            updatePhysics();
            updatePositions();
            renderer.render(scene, camera);
        }

        animate();

        return () => {
            running = false;
            renderer.dispose();
            canvasRef.current?.removeChild(renderer.domElement);
        };
    }, [params]);

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <div ref={canvasRef} />
            <div style={{
                position: 'absolute', top: 10, left: 10, background: '#111',
                padding: '10px', color: '#fff', borderRadius: '8px', fontSize: '12px'
            }}>
                {['theta1', 'theta2', 'l1', 'l2', 'm1', 'm2', 'speed'].map((key) => (
                    <div key={key}>
                        <label>{key}: </label>
                        <input
                            type="range"
                            min={key.includes('theta') ? "0" : "0.1"}
                            max={key.includes('theta') ? "6.28" : key === "speed" ? "5" : "3"}
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
    );
}
