// src/components/HeroSection.tsx
import LivePlayer from "./LivePlayer";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-indigo to-indigo-oscuro py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-white text-2xl md:text-4xl font-extrabold text-center mb-6">
          Sintonízanos <span className="text-amarillo">en vivo</span>, 24/7
        </h1>
        <LivePlayer />
      </div>
    </section>
  );
}