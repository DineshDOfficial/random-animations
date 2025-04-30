import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function PiRollingCircles() {
  const mountRef = useRef();

  // Function to get the digits of Pi
  const getPiDigits = (digits) => {
    const pi = Math.PI.toString().split(".")[1].slice(0, digits);
    return pi.split("").map(Number); // Convert to an array of digits
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Set up the camera
    camera.position.z = 50;

    // Colors and materials for the rolling circles
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xff6347, wireframe: true });

    // Get Pi digits
    const piDigits = getPiDigits(20); // Get 20 digits of Pi (you can increase this)

    const circles = [];
    let radius = 5; // Radius of the first circle
    let angleOffset = 0;

    // Create circles based on the digits of Pi
    piDigits.forEach((digit, index) => {
      const geometry = new THREE.CircleGeometry(radius, 32);
      const circle = new THREE.Mesh(geometry, circleMaterial);
      scene.add(circle);
      circles.push({ circle, digit, angleOffset, radius });
      radius += digit; // Increment radius for the next circle
      angleOffset += Math.PI / 2; // Offset for the next circle's position
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      circles.forEach((data, index) => {
        const { circle, digit, angleOffset, radius } = data;
        const angle = (Date.now() * 0.001 * digit + angleOffset) % (2 * Math.PI);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Position the circles based on the current angle
        circle.position.set(x, y, 0);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full fixed top-0 left-0 z-0" />;
}
