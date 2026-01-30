/**
 * Environmental decorations for the Zoo stage.
 * Scattered props that add character without blocking agents.
 */

type DecorationProps = {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
};

function Mushroom({ x, y, scale = 1, flip }: DecorationProps) {
  return (
    <g
      transform={`translate(${x}, ${y}) scale(${flip ? -scale : scale}, ${scale})`}
    >
      <ellipse cx="0" cy="12" rx="4" ry="8" fill="#E8D5C4" />
      <ellipse cx="0" cy="2" rx="10" ry="7" fill="#C47A4A" />
      <ellipse cx="-3" cy="0" rx="3" ry="2" fill="#D9956A" opacity="0.7" />
      <circle cx="3" cy="3" r="1.5" fill="#E8D5C4" opacity="0.8" />
      <circle cx="-4" cy="4" r="1" fill="#E8D5C4" opacity="0.8" />
    </g>
  );
}

function Flower({
  x,
  y,
  scale = 1,
  color = "#E8944A",
}: DecorationProps & { color?: string }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <path d="M 0 15 Q 2 8 0 0" stroke="#6B8B5A" strokeWidth="2" fill="none" />
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="0"
          cy="-5"
          rx="3"
          ry="5"
          fill={color}
          opacity="0.9"
          transform={`rotate(${angle} 0 0)`}
        />
      ))}
      <circle cx="0" cy="0" r="3" fill="#E8C44A" />
    </g>
  );
}

function GrassTuft({ x, y, scale = 1 }: DecorationProps) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <path
        d="M -4 0 Q -3 -12 -1 -15"
        stroke="#5A8B4A"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M 0 0 Q 0 -14 2 -18"
        stroke="#6B9B5A"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M 4 0 Q 3 -10 5 -12"
        stroke="#5A8B4A"
        strokeWidth="2"
        fill="none"
      />
    </g>
  );
}

function Rock({ x, y, scale = 1 }: DecorationProps) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="8" ry="5" fill="#B8A898" />
      <ellipse cx="-2" cy="-1" rx="4" ry="2" fill="#C8B8A8" opacity="0.6" />
    </g>
  );
}

function GreyRockA({ x, y, scale = 1 }: DecorationProps) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="12" ry="7" fill="#9AA1A8" />
      <ellipse cx="-3" cy="-1" rx="6" ry="3.5" fill="#B6BBC1" opacity="0.7" />
      <ellipse cx="4" cy="2" rx="4" ry="2.5" fill="#8C939A" opacity="0.7" />
    </g>
  );
}

function GreyRockB({ x, y, scale = 1 }: DecorationProps) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="10" ry="8" fill="#9FA6AD" />
      <ellipse cx="-4" cy="-2" rx="5" ry="3.5" fill="#B9BEC4" opacity="0.7" />
      <ellipse cx="3" cy="3" rx="3.5" ry="2.5" fill="#8C939A" opacity="0.7" />
    </g>
  );
}

function GreyRockC({ x, y, scale = 1 }: DecorationProps) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="11" ry="6.5" fill="#989EA5" />
      <ellipse cx="-2" cy="-2" rx="4.5" ry="3" fill="#B6BBC1" opacity="0.7" />
      <ellipse cx="4" cy="1" rx="4" ry="2.5" fill="#878E95" opacity="0.7" />
    </g>
  );
}

function Bush({ x, y, scale = 1 }: DecorationProps) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="-8" cy="0" rx="12" ry="10" fill="#5A7B4A" />
      <ellipse cx="8" cy="-2" rx="14" ry="12" fill="#6B8B5A" />
      <ellipse cx="0" cy="-8" rx="10" ry="9" fill="#5A8B4A" />
      <ellipse cx="-6" cy="-6" rx="4" ry="3" fill="#7A9B6A" opacity="0.5" />
      <ellipse cx="6" cy="-8" rx="5" ry="4" fill="#7A9B6A" opacity="0.5" />
    </g>
  );
}

function TreeTop({ x, y, scale = 1 }: DecorationProps) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <circle cx="0" cy="0" r="10" fill="#4E7B3E" />
      <circle cx="-6" cy="-4" r="6" fill="#5F8B4A" />
      <circle cx="6" cy="-5" r="5" fill="#5A8446" />
      <circle cx="2" cy="6" r="5" fill="#4E7B3E" />
      <circle cx="0" cy="0" r="2.2" fill="#8B6B4A" />
    </g>
  );
}

function Pond({ x, y, scale = 1 }: DecorationProps) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="16" ry="11" fill="#5D8FB8" />
      <ellipse cx="-1" cy="-1" rx="13" ry="8" fill="#6FA0C6" opacity="0.85" />
      <ellipse cx="4" cy="3" rx="6" ry="3.5" fill="#82B2D2" opacity="0.8" />
      <ellipse cx="-6" cy="-3" rx="4" ry="2.5" fill="#82B2D2" opacity="0.7" />
      <ellipse cx="-10" cy="6" rx="4" ry="2.6" fill="#4E8B5A" opacity="0.7" />
      <ellipse cx="9" cy="6" rx="3.5" ry="2.3" fill="#4E8B5A" opacity="0.7" />
    </g>
  );
}

function PondShadow({ x, y, scale = 1 }: DecorationProps) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="22" ry="15" fill="#4E7B3E" opacity="0.3" />
      <ellipse cx="3" cy="2" rx="18" ry="12" fill="#5A8B4A" opacity="0.25" />
    </g>
  );
}

export function ZooDecorations() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <TreeTop x={12} y={14} scale={0.45} />
      <TreeTop x={50} y={12} scale={0.36} />
      <TreeTop x={88} y={18} scale={0.42} />
      <TreeTop x={18} y={70} scale={0.4} />
      <TreeTop x={82} y={68} scale={0.4} />
      <TreeTop x={54} y={86} scale={0.38} />

      <PondShadow x={52} y={54} scale={0.95} />
      <Pond x={52} y={54} scale={0.85} />

      <Bush x={20} y={36} scale={0.3} />
      <Bush x={78} y={36} scale={0.28} />
      <Bush x={10} y={88} scale={0.32} />
      <Bush x={92} y={86} scale={0.28} />

      <Mushroom x={22} y={30} scale={0.2} />
      <Mushroom x={76} y={32} scale={0.18} flip />
      <Mushroom x={42} y={52} scale={0.16} />
      <Mushroom x={64} y={56} scale={0.15} flip />
      <Mushroom x={30} y={90} scale={0.16} />

      <Flower x={32} y={24} scale={0.18} color="#E8944A" />
      <Flower x={66} y={24} scale={0.18} color="#D97A8A" />
      <Flower x={28} y={60} scale={0.16} color="#E8C44A" />
      <Flower x={72} y={60} scale={0.16} color="#E8944A" />
      <Flower x={40} y={78} scale={0.15} color="#D97A8A" />
      <Flower x={68} y={82} scale={0.15} color="#E8C44A" />
      <Flower x={12} y={52} scale={0.15} color="#E8944A" />
      <Flower x={88} y={52} scale={0.15} color="#D97A8A" />

      <GrassTuft x={36} y={40} scale={0.18} />
      <GrassTuft x={64} y={42} scale={0.18} />
      <GrassTuft x={46} y={64} scale={0.16} />
      <GrassTuft x={56} y={64} scale={0.16} />
      <GrassTuft x={24} y={78} scale={0.16} />
      <GrassTuft x={76} y={78} scale={0.16} />

      <GreyRockA x={7} y={8} scale={0.3} />
      <GreyRockB x={12} y={12} scale={0.26} />
      <GreyRockC x={4} y={14} scale={0.24} />

      <GreyRockB x={92} y={9} scale={0.28} />
      <GreyRockC x={88} y={14} scale={0.24} />
      <GreyRockA x={96} y={13} scale={0.25} />

      <GreyRockC x={8} y={92} scale={0.32} />
      <GreyRockA x={13} y={88} scale={0.26} />
      <GreyRockB x={5} y={86} scale={0.24} />

      <GreyRockA x={93} y={90} scale={0.3} />
      <GreyRockB x={88} y={86} scale={0.25} />
      <GreyRockC x={96} y={84} scale={0.23} />

      <Rock x={16} y={26} scale={0.14} />
      <Rock x={84} y={26} scale={0.14} />
      <Rock x={48} y={46} scale={0.12} />
      <Rock x={58} y={46} scale={0.12} />
      <Rock x={14} y={74} scale={0.12} />
      <Rock x={86} y={74} scale={0.12} />
    </svg>
  );
}
