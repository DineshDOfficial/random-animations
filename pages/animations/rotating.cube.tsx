// pages/cube.tsx
'use client';

/**
 * Importing Next and React Packages
 */
import Head from "next/head";
import { useEffect, useRef } from 'react';

/**
 * Importing the UTILS
 */
import { getAnimationInfoById } from "../../utils/commons";

/**
 * Importing THree JS
 */
import * as THREE from 'three';

const Cube = () => {
    /**
     * Pass the Animation ID properly from this page
     */
    const animationInfo = getAnimationInfoById(1);

    const animationContainerRef = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        const animationContainer = animationContainerRef.current!;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        //camera.position.z = 5;
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);


        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        animationContainer.appendChild(renderer.domElement);

        const geometry = new THREE.BoxGeometry(3, 3, 3);

        // Array of materials for each face (6 faces)
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Right (+x, red)
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Left (-x, green)
            new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Top (+y, blue)
            new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Bottom (-y, yellow)
            new THREE.MeshBasicMaterial({ color: 0xff00ff }), // Front (+z, magenta)
            new THREE.MeshBasicMaterial({ color: 0x00ffff }), // Back (-z, cyan)
        ];

        //const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);

        const animate = () => {
            requestAnimationFrame(animate);

            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            renderer.render(scene, camera);
        };

        animate();

    }, []);

    return <>
        <Head>
            <title>{animationInfo.name} | Random Animations</title>
        </Head>
        <div ref={animationContainerRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />
    </>;
};

export default Cube;
