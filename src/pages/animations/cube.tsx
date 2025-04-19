import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Cube() {
  return (
    <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
      <boxGeometry />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
}

export default function CubePage() {
  return (
    <Canvas>
      <ambientLight />
      <directionalLight position={[3, 2, 1]} />
      <Cube />
      <OrbitControls />
    </Canvas>
  );
}
