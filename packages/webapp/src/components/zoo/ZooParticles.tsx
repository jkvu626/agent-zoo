/**
 * Ambient floating particles for the Zoo stage.
 * Dust motes and pollen drifting slowly through the air.
 */

import "./ZooParticles.css";

type ParticleConfig = {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
};

function generateParticles(count: number): ParticleConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 3 + (i % 3) * 2,
    x: 5 + ((i * 17) % 90),
    y: 10 + ((i * 23) % 70),
    duration: 15 + (i % 5) * 5,
    delay: (i * 2.5) % 12,
    opacity: 0.3 + (i % 4) * 0.1,
  }));
}

const particles = generateParticles(10);

export function ZooParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="zoo-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
