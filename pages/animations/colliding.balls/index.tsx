
import Head from "next/head";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * Importing the UTILS
 */
import { getAnimationInfoById } from "../../../utils/commons";


const BALL_COUNT = 5000;
const BOX_SIZE = 300;
const BALL_RADIUS = 5; // in units (e.g., meters or abstract)
const INITIAL_SPEED = 2.0; // units per frame

type Ball = {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
};

const CollidingBalls: React.FC = () => {

    /**
     * Pass the Animation ID properly from this page
     */
    const animationInfo = getAnimationInfoById(4);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            60,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(60, 0, 90);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        containerRef.current.appendChild(renderer.domElement);

        // OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Box helper
        const boxHelper = new THREE.BoxHelper(
            new THREE.Mesh(new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE)),
            0x444444
        );
        scene.add(boxHelper);

        // Balls
        const balls: Ball[] = [];
        const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 16, 16);

        for (let i = 0; i < BALL_COUNT; i++) {
            const ballMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`),
            });
            const mesh = new THREE.Mesh(ballGeometry, ballMaterial);
            mesh.position.set(
                (Math.random() - 0.5) * BOX_SIZE * 0.8,
                (Math.random() - 0.5) * BOX_SIZE * 0.8,
                (Math.random() - 0.5) * BOX_SIZE * 0.8
            );

            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * INITIAL_SPEED,
                (Math.random() - 0.5) * INITIAL_SPEED,
                (Math.random() - 0.5) * INITIAL_SPEED
            );

            scene.add(mesh);
            balls.push({ mesh, velocity });
        }

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            for (const ball of balls) {
                ball.mesh.position.add(ball.velocity);

                for (let axis of ['x', 'y', 'z'] as const) {
                    if (Math.abs(ball.mesh.position[axis]) + BALL_RADIUS > BOX_SIZE / 2) {
                        ball.mesh.position[axis] = Math.sign(ball.mesh.position[axis]) * (BOX_SIZE / 2 - BALL_RADIUS);
                        ball.velocity[axis] *= -1;
                    }
                }
            }

            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            renderer.dispose();
            while (containerRef.current?.firstChild) {
                containerRef.current.removeChild(containerRef.current.firstChild);
            }
        };
    }, []);

    return <>
        <Head>
            <title>{animationInfo.name} | Random Animations</title>
        </Head>
        <div ref={containerRef} style={{ width: "100%", height: "100vh", backgroundColor: "#000" }} />

        {/* Overlay parameters in top-right corner */}
        <div style={{
            position: "absolute",
            top: "12px",
            right: "20px",
            color: "#eee",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: "10px 14px",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "14px",
            lineHeight: "1.6",
            pointerEvents: "none", // don't block mouse
        }}>
            <div><strong>Box Size:</strong> {BOX_SIZE}</div>
            <div><strong>Ball Count:</strong> {BALL_COUNT}</div>
            <div><strong>Ball Radius:</strong> {BALL_RADIUS} units</div>
            <div><strong>Ball Speed:</strong> {INITIAL_SPEED.toFixed(2)} u/f</div>
        </div>
    </>
        ;
};

export default CollidingBalls;
