// pages/fourier.tsx
'use client';

import Head from "next/head";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { getAnimationInfoById } from "../../utils/commons";

const generateShape = (type: 'circle' | 'square' | 'triangle', numPoints: number) => {
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * 2 * Math.PI;
        let x = 0, y = 0;

        if (type === 'circle') {
            x = Math.cos(theta);
            y = Math.sin(theta);
        } else if (type === 'square') {
            const t = (i / numPoints);
            const side = Math.floor(t * 4);
            const pos = (t * 4) % 1;
            switch (side) {
                case 0: x = 1; y = 2 * pos - 1; break;
                case 1: x = 1 - 2 * pos; y = 1; break;
                case 2: x = -1; y = 1 - 2 * pos; break;
                case 3: x = -1 + 2 * pos; y = -1; break;
            }
        } else if (type === 'triangle') {
            const t = (i / numPoints);
            const side = Math.floor(t * 3);
            const pos = (t * 3) % 1;
            switch (side) {
                case 0: x = 1 - 2 * pos; y = -Math.sqrt(3) * pos; break;
                case 1: x = -1 + pos; y = -Math.sqrt(3) + Math.sqrt(3) * pos; break;
                case 2: x = -1 + pos; y = Math.sqrt(3) * (1 - pos); break;
            }
        }

        points.push({ x, y });
    }

    return points;
};

const dft = (points: { x: number; y: number }[]) => {
    const N = points.length;
    const out: any[] = [];

    for (let k = 0; k < N; k++) {
        let re = 0, im = 0;
        for (let n = 0; n < N; n++) {
            const phi = (2 * Math.PI * k * n) / N;
            re += points[n].x * Math.cos(phi) + points[n].y * Math.sin(phi);
            im += points[n].y * Math.cos(phi) - points[n].x * Math.sin(phi);
        }
        re /= N;
        im /= N;
        out.push({
            freq: k,
            amp: Math.sqrt(re * re + im * im),
            phase: Math.atan2(im, re),
            re,
            im
        });
    }

    return out.sort((a, b) => b.amp - a.amp);
};

const FourierEpicycles = () => {
    const animationInfo = getAnimationInfoById(3);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current!;
        const scene = new THREE.Scene();

        const camera = new THREE.OrthographicCamera(
            -10, 10, 10, -10, 0.1, 1000
        );
        camera.position.z = 50;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff);
        scene.add(ambient);

        const shape = generateShape('triangle', 300);
        const fourier = dft(shape);

        // Tracer
        const tracerPoints: THREE.Vector3[] = [];
        const maxPoints = 3000; // limit to avoid crashing browser
        const tracerGeometry = new THREE.BufferGeometry().setFromPoints(new Array(maxPoints).fill(new THREE.Vector3()));
        const tracerMaterial = new THREE.LineBasicMaterial({ color: 0xffcc00 });
        const tracerLine = new THREE.Line(tracerGeometry, tracerMaterial);
        scene.add(tracerLine);

        // Dot at tip
        const tipGeometry = new THREE.CircleGeometry(0.15, 16);
        const tipMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const tipDot = new THREE.Mesh(tipGeometry, tipMaterial);
        tipDot.position.z = 0.1;
        scene.add(tipDot);

        let time = 0;


        let drawCount = 0;

        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.01;

            let x = 0;
            let y = 0;
            let prevX = 0;
            let prevY = 0;

            // Clear previous epicycles
            while (scene.children.length > 3) scene.remove(scene.children[3]);

            const epicycleGroup = new THREE.Group();

            for (let i = 0; i < fourier.length; i++) {
                const f = fourier[i];
                const angle = f.freq * time + f.phase;
                prevX = x;
                prevY = y;
                x += f.amp * Math.cos(angle);
                y += f.amp * Math.sin(angle);

                const lineGeo = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(prevX, prevY, 0),
                    new THREE.Vector3(x, y, 0),
                ]);
                const lineMat = new THREE.LineBasicMaterial({ color: 0x3366ff });
                const line = new THREE.Line(lineGeo, lineMat);
                epicycleGroup.add(line);
            }

            tipDot.position.set(x, y, 0.1);
            scene.add(epicycleGroup);

            // Tracer logic
            if (drawCount < maxPoints) {
                tracerGeometry.attributes.position.setXYZ(drawCount, x, y, 0);
                tracerGeometry.attributes.position.needsUpdate = true;
                tracerGeometry.setDrawRange(0, drawCount + 1);
                drawCount++;
            }

            renderer.render(scene, camera);
        };


        animate();
    }, []);

    return (
        <>
            <Head>
                <title>{animationInfo.name} | Random Animations</title>
            </Head>
            <div ref={containerRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />
        </>
    );
};

export default FourierEpicycles;
