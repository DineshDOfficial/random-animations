import AnimationCard from "../components/AnimationCard";
import { animations } from "../../animations.config";


export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center tracking-tight">Random Animations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {animations.map((anim) => (
          <AnimationCard key={anim.id} {...anim} />
        ))}
      </div>
    </div>
  );
}
