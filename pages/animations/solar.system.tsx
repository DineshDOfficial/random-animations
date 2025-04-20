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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const SolarSystem = () => {
    /**
     * Pass the Animation ID properly from this page
     */
    const animationInfo = getAnimationInfoById(2);

    /** Creating a Div Elemet Container */
    const animationContainerRef = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        const animationContainer = animationContainerRef.current!;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.set(0, 70, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        animationContainer.appendChild(renderer.domElement);


        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Lighting
        const light = new THREE.PointLight(0xffffff, 2, 0);
        light.position.set(0, 0, 0);
        scene.add(light);

        const ambient = new THREE.AmbientLight(0x222222);
        scene.add(ambient);

        // Create Sun
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sun = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), sunMaterial);
        scene.add(sun);


        // Planet data (name, size, distance, color, orbitSpeed)
        const planetsData = [
            { name: 'Mercury', size: 0.4, distance: 8, color: 0xffffff , speed: 0.9 },
            { name: 'Venus', size: 0.9, distance: 12, color: 0xffffff , speed: 0.8 },
            { name: 'Earth', size: 1, distance: 16, color: 0xffffff , speed: 0.7 },
            { name: 'Mars', size: 0.6, distance: 20, color: 0xffffff , speed: 0.6 },
            { name: 'Jupiter', size: 2.5, distance: 28, color: 0xffffff , speed: 0.5 },
            { name: 'Saturn', size: 2.2, distance: 34, color: 0xffffff , speed: 0.4 },
            { name: 'Uranus', size: 1.7, distance: 40, color: 0xffffff , speed: 0.2 },
            { name: 'Neptune', size: 1.6, distance: 46, color: 0xffffff , speed: 0.1 }
        ];

        const planetMeshes: THREE.Mesh[] = [];
        const planetOrbits: THREE.Line[] = [];

        planetsData.forEach(data => {
            const geo = new THREE.SphereGeometry(data.size, 32, 32);
            const mat = new THREE.MeshBasicMaterial({ color: data.color });
            const mesh = new THREE.Mesh(geo, mat);
            scene.add(mesh);
            planetMeshes.push(mesh);

            // Orbit circle
            const orbitPoints: THREE.Vector3[] = [];
            const segments = 128;
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                orbitPoints.push(new THREE.Vector3(
                    Math.cos(angle) * data.distance,
                    0,
                    Math.sin(angle) * data.distance
                ));
            }
            const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMat = new THREE.LineBasicMaterial({ color: 0x7e7f82  });
            const orbit = new THREE.LineLoop(orbitGeo, orbitMat);
            scene.add(orbit);
            planetOrbits.push(orbit);
        });


        // Animation
        let time = 0;
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();

            time += 0.01;

            planetsData.forEach((data, i) => {
                const angle = time * data.speed;
                const x = Math.cos(angle) * data.distance;
                const z = Math.sin(angle) * data.distance;
                planetMeshes[i].position.set(x, 0, z);
            });

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

export default SolarSystem;
