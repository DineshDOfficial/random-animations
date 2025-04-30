'use client';

import Head from "next/head";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Importing the UTILS
 */
import { getAnimationInfoById } from "../../../utils/commons";


const G = 0.05;

interface Body {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    mass: number;
}

class Trail {
    private positions: Float32Array;
    private index = 0;
    private maxPoints: number;
    private geometry: THREE.BufferGeometry;
    public line: THREE.Line;
    private points: THREE.Vector3[] = [];

    constructor(color: number, maxPoints = 300) {
        this.maxPoints = maxPoints;
        this.positions = new Float32Array(maxPoints * 3);
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        const material = new THREE.LineBasicMaterial({ color });
        this.line = new THREE.Line(this.geometry, material);
    }

    update(position: THREE.Vector3) {
        if (this.points.length < this.maxPoints) {
            this.points.push(position.clone());
        } else {
            this.points.shift();
            this.points.push(position.clone());
        }

        for (let i = 0; i < this.points.length; i++) {
            this.positions[i * 3] = this.points[i].x;
            this.positions[i * 3 + 1] = this.points[i].y;
            this.positions[i * 3 + 2] = this.points[i].z;
        }

        this.geometry.setDrawRange(0, this.points.length);
        this.geometry.attributes.position.needsUpdate = true;
    }
}
const BinaryStars = () => {
        /**
         * Pass the Animation ID properly from this page
         */
        const animationInfo = getAnimationInfoById(3);

    const animationContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = animationContainerRef.current!;
        const scene = new THREE.Scene();

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 90, 0);  // Top-down view
        camera.lookAt(0, 0, 0);

        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);

        // Grid on XZ plane
        const grid = new THREE.GridHelper(200, 10, 0x444444, 0x888888);
        scene.add(grid);

        // Binary stars
        const star1 = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffdd33 }));
        const star2 = new THREE.Mesh(new THREE.SphereGeometry(2.5, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff5500 }));
        scene.add(star1, star2);

        star1.position.set(-10, 0, 0);
        star2.position.set(10, 0, 0);

        const star1Mass = 1500;
        const star2Mass = 800;

        const bodies: Body[] = [
            { mesh: star1, velocity: new THREE.Vector3(0, 0, 0.6), mass: star1Mass },
            { mesh: star2, velocity: new THREE.Vector3(0, 0, -0.75), mass: star2Mass }
        ];

        const planetColors = [0x9999ff, 0xffcc99, 0x66ccff, 0xff3300, 0xffaa00, 0xccddff, 0x00ffff, 0x0000ff];
        const planetDistances = [18, 25, 36, 43, 58, 66, 76, 87];
        const planetSizes = [1.5, 2.3, 1.9, 0.6, 2.9, 2.0, 1.3, 1.2];
        const planetSpeeds = [0.07, 0.06, 0.05, 0.045, 0.035, 0.03, 0.025, 0.02];

        const planets: THREE.Mesh[] = [];
        const trails: Trail[] = [];

        planetDistances.forEach((dist, i) => {
            const geometry = new THREE.SphereGeometry(planetSizes[i], 16, 16);
            const material = new THREE.MeshBasicMaterial({ color: planetColors[i] });
            const planet = new THREE.Mesh(geometry, material);
            scene.add(planet);
            planets.push(planet);

            const trail = new Trail(planetColors[i]);
            scene.add(trail.line);
            trails.push(trail);
        });

        let time = 0;
        const dt = 0.2;

        const computeForces = () => {
            const diff = new THREE.Vector3().subVectors(bodies[1].mesh.position, bodies[0].mesh.position);
            const distSq = diff.lengthSq() + 0.1;
            const forceMag = (G * bodies[0].mass * bodies[1].mass) / distSq;
            const force = diff.normalize().multiplyScalar(forceMag);

            const accel1 = force.clone().divideScalar(bodies[0].mass);
            const accel2 = force.clone().negate().divideScalar(bodies[1].mass);

            bodies[0].velocity.add(accel1.multiplyScalar(dt));
            bodies[1].velocity.add(accel2.multiplyScalar(dt));
        };

        const updatePositions = () => {
            bodies.forEach(body => {
                body.mesh.position.addScaledVector(body.velocity, dt);
            });
        };

        const updatePlanets = () => {
            planets.forEach((planet, i) => {
                const barycenter = new THREE.Vector3()
                    .addScaledVector(bodies[0].mesh.position, bodies[0].mass)
                    .addScaledVector(bodies[1].mesh.position, bodies[1].mass)
                    .divideScalar(bodies[0].mass + bodies[1].mass);

                const angle = time * planetSpeeds[i];
                const x = Math.cos(angle) * planetDistances[i];
                const z = Math.sin(angle) * planetDistances[i];
                planet.position.set(barycenter.x + x, 0, barycenter.z + z);

                trails[i].update(planet.position);
            });
        };

        const animate = () => {
            requestAnimationFrame(animate);
            computeForces();
            updatePositions();
            updatePlanets();
            time += dt;

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <Head>
                <title>{animationInfo.name} | Random Animations</title>
            </Head>
            <div ref={animationContainerRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />
        </>
    );
};

export default BinaryStars;
