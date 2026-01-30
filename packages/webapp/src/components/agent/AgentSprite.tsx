import type { Agent } from "@agent-zoo/types";
import { cn } from "../../utils/cn";

export type AgentColor = {
  body: string;
  bodyDark: string;
  bodyLight: string;
  accent: string;
};

export type EyeStyle =
  | "default"
  | "happy"
  | "sleepy"
  | "determined"
  | "curious";
export type MouthStyle = "default" | "smile" | "open" | "cat" | "surprised";
export type AccessoryType =
  | "none"
  | "ears-cat"
  | "ears-round"
  | "fins"
  | "spikes"
  | "antenna"
  | "leaves"
  | "lightning"
  | "swirl"
  | "bubbles"
  | "tentacles";
export type TailType = "none" | "curly" | "fluffy" | "fish" | "lightning";

export type AgentAppearance = {
  color: AgentColor;
  eyes: EyeStyle;
  mouth: MouthStyle;
  accessory: AccessoryType;
  tail: TailType;
  fuzzy: boolean;
};

const colorPresets = {
  apricot: {
    body: "#E8944A",
    bodyDark: "#C67535",
    bodyLight: "#F4B072",
    accent: "#D4722E",
  },
  teal: {
    body: "#5BC4C4",
    bodyDark: "#3A9E9E",
    bodyLight: "#8ED9D9",
    accent: "#2D8B8B",
  },
  magenta: {
    body: "#D94A8C",
    bodyDark: "#B33570",
    bodyLight: "#E87AAD",
    accent: "#9E2A5F",
  },
  golden: {
    body: "#E8C44A",
    bodyDark: "#C9A035",
    bodyLight: "#F4D872",
    accent: "#D4A72E",
  },
  aqua: {
    body: "#7DD4E8",
    bodyDark: "#5ABACE",
    bodyLight: "#A8E4F2",
    accent: "#4AA8C4",
  },
  indigo: {
    body: "#4A5BD9",
    bodyDark: "#3545B3",
    bodyLight: "#7A88E8",
    accent: "#2E3AA0",
  },
  sage: {
    body: "#7BA35C",
    bodyDark: "#5D8242",
    bodyLight: "#9DBF80",
    accent: "#4A6B35",
  },
  rust: {
    body: "#C47A4A",
    bodyDark: "#A35F35",
    bodyLight: "#D9A072",
    accent: "#8B4A2E",
  },
} as const;

const defaultAppearance: AgentAppearance = {
  color: colorPresets.apricot,
  eyes: "default",
  mouth: "default",
  accessory: "none",
  tail: "curly",
  fuzzy: true,
};

const sizeClasses = {
  small: "h-16 w-16",
  medium: "h-24 w-24",
  large: "h-40 w-40",
};

function generateAppearance(agent: Agent): AgentAppearance {
  const seed = agent.appearanceSeed ?? agent.id;
  const hash = seed.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const colorKeys = Object.keys(colorPresets) as (keyof typeof colorPresets)[];
  const colorIndex = Math.abs(hash) % colorKeys.length;

  const curated: Record<string, Partial<AgentAppearance>> = {
    sage: {
      color: colorPresets.indigo,
      eyes: "curious",
      mouth: "default",
      accessory: "swirl",
      tail: "fluffy",
    },
    ember: {
      color: colorPresets.apricot,
      eyes: "determined",
      mouth: "smile",
      accessory: "lightning",
      tail: "lightning",
    },
    atlas: {
      color: colorPresets.teal,
      eyes: "default",
      mouth: "default",
      accessory: "fins",
      tail: "fish",
    },
  };

  if (seed in curated) {
    return { ...defaultAppearance, ...curated[seed] } as AgentAppearance;
  }

  const accessories: AgentAppearance["accessory"][] = [
    "none",
    "ears-cat",
    "ears-round",
    "fins",
    "spikes",
    "antenna",
    "leaves",
    "bubbles",
  ];
  const tails: AgentAppearance["tail"][] = [
    "curly",
    "fluffy",
    "fish",
    "lightning",
  ];
  const eyes: AgentAppearance["eyes"][] = [
    "default",
    "happy",
    "sleepy",
    "determined",
    "curious",
  ];
  const mouths: AgentAppearance["mouth"][] = [
    "default",
    "smile",
    "cat",
    "surprised",
  ];

  return {
    color: colorPresets[colorKeys[colorIndex]],
    eyes: eyes[Math.abs(hash >> 4) % eyes.length],
    mouth: mouths[Math.abs(hash >> 8) % mouths.length],
    accessory: accessories[Math.abs(hash >> 12) % accessories.length],
    tail: tails[Math.abs(hash >> 16) % tails.length],
    fuzzy: true,
  };
}

export function AgentSprite({
  agent,
  size = "medium",
  appearance: overrides,
  className,
}: {
  agent: Agent;
  size?: "small" | "medium" | "large";
  appearance?: Partial<AgentAppearance>;
  className?: string;
}) {
  const baseAppearance = generateAppearance(agent);
  const appearance: AgentAppearance = {
    ...baseAppearance,
    ...overrides,
    color: overrides?.color
      ? { ...baseAppearance.color, ...overrides.color }
      : baseAppearance.color,
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        aria-label={agent.name}
      >
        <SpriteTail type={appearance.tail} color={appearance.color} />
        {appearance.accessory === "tentacles" && (
          <SpriteAccessory type="tentacles" color={appearance.color} />
        )}
        <SpriteBody color={appearance.color} fuzzy={appearance.fuzzy} />
        {appearance.accessory !== "tentacles" &&
          appearance.accessory !== "none" && (
            <SpriteAccessory
              type={appearance.accessory}
              color={appearance.color}
            />
          )}
        <SpriteEyes style={appearance.eyes} />
        <SpriteMouth style={appearance.mouth} />
      </svg>
    </div>
  );
}

function SpriteBody({ color, fuzzy }: { color: AgentColor; fuzzy: boolean }) {
  const filterId = `fuzzy-${Math.random().toString(36).slice(2, 9)}`;
  const gradientId = `body-gradient-${Math.random().toString(36).slice(2, 9)}`;
  const highlightId = `highlight-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <g>
      <defs>
        <radialGradient
          id={gradientId}
          cx="40%"
          cy="35%"
          r="60%"
          fx="35%"
          fy="30%"
        >
          <stop offset="0%" stopColor={color.bodyLight} />
          <stop offset="50%" stopColor={color.body} />
          <stop offset="100%" stopColor={color.bodyDark} />
        </radialGradient>
        <radialGradient id={highlightId} cx="35%" cy="25%" r="40%">
          <stop offset="0%" stopColor={color.bodyLight} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color.bodyLight} stopOpacity="0" />
        </radialGradient>
        {fuzzy && (
          <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        )}
      </defs>

      <ellipse
        cx="50"
        cy="92"
        rx="28"
        ry="6"
        fill={color.bodyDark}
        opacity="0.2"
      />
      <ellipse
        cx="50"
        cy="52"
        rx="38"
        ry="36"
        fill={`url(#${gradientId})`}
        filter={fuzzy ? `url(#${filterId})` : undefined}
      />
      <ellipse cx="42" cy="40" rx="22" ry="18" fill={`url(#${highlightId})`} />
      <ellipse cx="35" cy="85" rx="8" ry="6" fill={color.bodyDark} />
      <ellipse cx="65" cy="85" rx="8" ry="6" fill={color.bodyDark} />
    </g>
  );
}

function SpriteEyes({ style }: { style: EyeStyle }) {
  switch (style) {
    case "happy":
      return (
        <g>
          <path
            d="M 31 50 Q 38 44, 45 50"
            fill="none"
            stroke="#3D2B1F"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 55 50 Q 62 44, 69 50"
            fill="none"
            stroke="#3D2B1F"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      );
    case "sleepy":
      return (
        <g>
          <ellipse cx="38" cy="52" rx="7" ry="5" fill="#3D2B1F" />
          <ellipse cx="36" cy="50" rx="2" ry="2" fill="white" />
          <path
            d="M 30 48 Q 38 45, 46 48"
            fill="none"
            stroke="#3D2B1F"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <ellipse cx="62" cy="52" rx="7" ry="5" fill="#3D2B1F" />
          <ellipse cx="60" cy="50" rx="2" ry="2" fill="white" />
          <path
            d="M 54 48 Q 62 45, 70 48"
            fill="none"
            stroke="#3D2B1F"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      );
    case "determined":
      return (
        <g>
          <ellipse cx="38" cy="52" rx="7" ry="7" fill="#3D2B1F" />
          <ellipse cx="36" cy="49" rx="2.5" ry="3" fill="white" />
          <path
            d="M 30 44 L 46 47"
            fill="none"
            stroke="#3D2B1F"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <ellipse cx="62" cy="52" rx="7" ry="7" fill="#3D2B1F" />
          <ellipse cx="60" cy="49" rx="2.5" ry="3" fill="white" />
          <path
            d="M 70 44 L 54 47"
            fill="none"
            stroke="#3D2B1F"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      );
    case "curious":
      return (
        <g>
          <ellipse cx="38" cy="50" rx="6" ry="7" fill="#3D2B1F" />
          <ellipse cx="36" cy="47" rx="2" ry="2.5" fill="white" />
          <ellipse cx="62" cy="49" rx="8" ry="9" fill="#3D2B1F" />
          <ellipse cx="60" cy="46" rx="3" ry="3.5" fill="white" />
        </g>
      );
    default:
      return (
        <g>
          <ellipse cx="38" cy="50" rx="7" ry="8" fill="#3D2B1F" />
          <ellipse cx="36" cy="47" rx="2.5" ry="3" fill="white" />
          <ellipse cx="62" cy="50" rx="7" ry="8" fill="#3D2B1F" />
          <ellipse cx="60" cy="47" rx="2.5" ry="3" fill="white" />
        </g>
      );
  }
}

function SpriteMouth({ style }: { style: MouthStyle }) {
  switch (style) {
    case "smile":
      return (
        <path
          d="M 42 63 Q 50 70, 58 63"
          fill="none"
          stroke="#3D2B1F"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      );
    case "open":
      return (
        <g>
          <ellipse cx="50" cy="65" rx="6" ry="5" fill="#3D2B1F" />
          <ellipse cx="50" cy="63" rx="4" ry="2" fill="#5D4037" />
        </g>
      );
    case "cat":
      return (
        <g>
          <circle cx="50" cy="65" r="1" fill="#3D2B1F" />
          <path
            d="M 50 65 Q 44 62, 40 66"
            fill="none"
            stroke="#3D2B1F"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 50 65 Q 56 62, 60 66"
            fill="none"
            stroke="#3D2B1F"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      );
    case "surprised":
      return <ellipse cx="50" cy="66" rx="4" ry="5" fill="#3D2B1F" />;
    default:
      return (
        <path
          d="M 45 64 Q 50 67, 55 64"
          fill="none"
          stroke="#3D2B1F"
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
  }
}

function SpriteAccessory({
  type,
  color,
}: {
  type: AccessoryType;
  color: AgentColor;
}) {
  switch (type) {
    case "ears-cat":
      return (
        <g>
          <path
            d="M 22 35 L 30 15 L 40 30 Z"
            fill={color.body}
            stroke={color.bodyDark}
            strokeWidth="1"
          />
          <path
            d="M 26 32 L 30 20 L 36 30 Z"
            fill={color.bodyLight}
            opacity="0.5"
          />
          <path
            d="M 78 35 L 70 15 L 60 30 Z"
            fill={color.body}
            stroke={color.bodyDark}
            strokeWidth="1"
          />
          <path
            d="M 74 32 L 70 20 L 64 30 Z"
            fill={color.bodyLight}
            opacity="0.5"
          />
        </g>
      );
    case "ears-round":
      return (
        <g>
          <circle cx="22" cy="28" r="12" fill={color.body} />
          <circle cx="22" cy="28" r="6" fill={color.bodyDark} opacity="0.3" />
          <circle cx="78" cy="28" r="12" fill={color.body} />
          <circle cx="78" cy="28" r="6" fill={color.bodyDark} opacity="0.3" />
        </g>
      );
    case "fins":
      return (
        <g>
          <path
            d="M 40 18 Q 50 5, 60 18 Q 55 22, 50 20 Q 45 22, 40 18"
            fill={color.accent}
            opacity="0.9"
          />
          <path
            d="M 15 45 Q 5 35, 10 55 Q 15 50, 18 52"
            fill={color.accent}
            opacity="0.8"
          />
          <path
            d="M 85 45 Q 95 35, 90 55 Q 85 50, 82 52"
            fill={color.accent}
            opacity="0.8"
          />
        </g>
      );
    case "spikes":
      return (
        <g>
          {[
            { x: 35, y: 18, r: -20 },
            { x: 50, y: 14, r: 0 },
            { x: 65, y: 18, r: 20 },
            { x: 78, y: 32, r: 50 },
            { x: 82, y: 50, r: 80 },
            { x: 22, y: 32, r: -50 },
            { x: 18, y: 50, r: -80 },
          ].map((pos, i) => (
            <g
              key={i}
              transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r})`}
            >
              <ellipse cx="0" cy="-8" rx="4" ry="8" fill={color.accent} />
            </g>
          ))}
        </g>
      );
    case "antenna":
      return <Antenna color={color} />;
    case "leaves":
      return (
        <g>
          <path
            d="M 75 30 Q 85 20, 90 25 Q 85 30, 80 35"
            fill="#6B8E4E"
            stroke="#4A6B35"
            strokeWidth="1"
          />
          <path
            d="M 80 35 Q 92 28, 95 35 Q 88 38, 82 40"
            fill="#7BA35C"
            stroke="#5D8242"
            strokeWidth="1"
          />
        </g>
      );
    case "lightning":
      return (
        <g>
          <path
            d="M 15 40 L 20 45 L 16 48 L 22 58"
            fill="none"
            stroke="#FFD700"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 85 40 L 80 45 L 84 48 L 78 58"
            fill="none"
            stroke="#FFD700"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    case "swirl":
      return (
        <g>
          <path
            d="M 50 45 Q 55 45, 55 50 Q 55 58, 45 58 Q 35 58, 35 48 Q 35 35, 55 35 Q 68 35, 68 52"
            fill="none"
            stroke={color.bodyLight}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      );
    case "bubbles":
      return (
        <g opacity="0.6">
          <circle
            cx="80"
            cy="20"
            r="6"
            fill="none"
            stroke="#87CEEB"
            strokeWidth="1.5"
          />
          <circle cx="78" cy="18" r="1.5" fill="white" />
          <circle
            cx="88"
            cy="35"
            r="4"
            fill="none"
            stroke="#87CEEB"
            strokeWidth="1"
          />
          <circle cx="87" cy="34" r="1" fill="white" />
          <circle
            cx="85"
            cy="10"
            r="3"
            fill="none"
            stroke="#87CEEB"
            strokeWidth="1"
          />
        </g>
      );
    case "tentacles":
      return (
        <g>
          <ellipse cx="25" cy="82" rx="6" ry="8" fill={color.bodyDark} />
          <ellipse cx="42" cy="86" rx="5" ry="6" fill={color.bodyDark} />
          <ellipse cx="58" cy="86" rx="5" ry="6" fill={color.bodyDark} />
          <ellipse cx="75" cy="82" rx="6" ry="8" fill={color.bodyDark} />
        </g>
      );
    default:
      return null;
  }
}

function Antenna({ color }: { color: AgentColor }) {
  const glowId = `antenna-glow-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <g>
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor="#FFE4B5" />
          <stop offset="50%" stopColor={color.accent} />
          <stop offset="100%" stopColor={color.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M 50 20 Q 55 10, 60 5"
        fill="none"
        stroke={color.bodyDark}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="62" cy="3" r="8" fill={`url(#${glowId})`} opacity="0.8" />
      <circle cx="62" cy="3" r="5" fill={color.accent} />
      <circle cx="60" cy="1" r="2" fill="white" opacity="0.6" />
    </g>
  );
}

function SpriteTail({ type, color }: { type: TailType; color: AgentColor }) {
  switch (type) {
    case "curly":
      return (
        <g>
          <path
            d="M 82 60 Q 92 55, 95 62 Q 98 70, 90 72 Q 85 74, 88 68"
            fill="none"
            stroke={color.body}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 84 58 Q 90 55, 92 60"
            fill="none"
            stroke={color.bodyLight}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      );
    case "fluffy":
      return (
        <g>
          <circle cx="90" cy="65" r="10" fill={color.body} />
          <circle cx="88" cy="62" r="4" fill={color.bodyLight} opacity="0.4" />
        </g>
      );
    case "fish":
      return (
        <path
          d="M 82 55 Q 88 50, 95 45 Q 92 55, 95 65 Q 88 60, 82 65"
          fill={color.accent}
          opacity="0.85"
        />
      );
    case "lightning":
      return (
        <path
          d="M 82 58 L 90 52 L 86 60 L 95 55 L 88 65 L 92 62"
          fill="none"
          stroke={color.accent}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    default:
      return null;
  }
}
