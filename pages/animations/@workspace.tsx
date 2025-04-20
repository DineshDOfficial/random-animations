'use client';

import Head from "next/head";

import React from 'react';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * Importing the UTILS
 */
import { getAnimationInfoById } from "../../utils/commons";

export default function Trial() {

    /**
     * Pass the Animation ID properly from this page
     */
    const animationInfo = getAnimationInfoById(0);

    const animationContainerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {

        const animationContainer = animationContainerRef.current!;

        const width = window.innerWidth
        const height = window.innerHeight

        /**
         * Creating a Scene
         */
        const scene = new THREE.Scene();

        /**
         * Creating Camera
         */
        const fieldOfView = 45 ; const aspectRatio = width/height ; const nearClippingPlane = 0.1 ; const farClippingPlane = 1000
        const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearClippingPlane, farClippingPlane);

        camera.position.set(10,10, 10);
        camera.lookAt(0, 0, 0);

        /**
         * Renderer
         */
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        /**
         * Creating a Cube
         */
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial();
        const cube = new THREE.Mesh(geometry, material);

        scene.add(cube);


        animationContainer.appendChild(renderer.domElement);


        /**
         * Render the scene and camera
         */
        renderer.render(scene, camera)

    }, []);

    return (
        <>
            <Head>
                <title>{animationInfo.name} | Random Animations</title>
            </Head>

            <div ref={animationContainerRef} className="w-screen h-screen bg-black relative">

            </div>
        </>

    );
}
