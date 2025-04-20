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
import {getAnimationInfoById} from "../../utils/commons";

/**
 * Importing THree JS
 */
import * as THREE from 'three';

const CubePage = () => {
    /**
     * Pass the Animation ID properly from this page
     */
    const animationInfo = getAnimationInfoById(1);
    const containerRef = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        const animate = () => {
            requestAnimationFrame(animate);

            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return <>
        <Head>
            <title>{animationInfo.name} | Random Animations</title>
            <link rel="icon" href="/images/@cover.image.jpg" type="image/jpg" />
        </Head>
        <div ref={containerRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />
    </>;
};

export default CubePage;
