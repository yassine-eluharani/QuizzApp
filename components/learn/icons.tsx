import React from 'react';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import type { IconName } from '@/lib/learn/types';

interface IconProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

// Hand-drawn 24px stroke icons, one per unit theme. Kept as data so adding a unit icon is one entry.
const PATHS: Record<IconName, string[]> = {
  box: ['M12 2.5 20.5 7v10L12 21.5 3.5 17V7z', 'M3.8 7.2 12 12l8.2-4.8', 'M12 12v9.3'],
  gate: ['M3 12h11', 'm10.5 7.5 4.5 4.5-4.5 4.5', 'M19 4.5v15'],
  key: ['M10.2 13.8 20 4', 'm16.5 7.5 3 3', 'm13.6 10.4 2.2 2.2'],
  layers: ['m12 3 9 4.8-9 4.8-9-4.8z', 'm3 12.2 9 4.8 9-4.8', 'm3 16.6 9 4.8 9-4.8'],
  disk: [
    'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3z',
    'M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6',
    'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  ],
  rocket: [
    'M12 2c3 2 5 5.5 5 9l-2.5 3h-5L7 11c0-3.5 2-7 5-9z',
    'M7 13l-3 3 3 1',
    'M17 13l3 3-3 1',
    'M10 17l2 4 2-4',
  ],
  shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'm8.5 12 2.5 2.5L16 9.5'],
  eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z'],
  grid: [],
  alert: ['M12 3 2.5 20h19z', 'M12 10v4', 'M12 17.2v.1'],
  wheel: [
    'M12 4v5M12 15v5M4 12h5M15 12h5',
    'M6.3 6.3l3.5 3.5M14.2 14.2l3.5 3.5M17.7 6.3l-3.5 3.5M9.8 14.2l-3.5 3.5',
  ],
};

export function UnitIcon({
  name,
  size = 24,
  color,
  strokeWidth = 1.8,
}: IconProps & { name: IconName }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {PATHS[name].map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {name === 'key' && (
        <Circle cx={7.8} cy={16.2} r={4} stroke={color} strokeWidth={strokeWidth} />
      )}
      {name === 'eye' && <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={strokeWidth} />}
      {name === 'wheel' && (
        <>
          <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={strokeWidth} />
          <Circle cx={12} cy={12} r={2.2} stroke={color} strokeWidth={strokeWidth} />
        </>
      )}
      {name === 'grid' &&
        [
          [3.5, 3.5],
          [13.5, 3.5],
          [3.5, 13.5],
          [13.5, 13.5],
        ].map(([x, y], i) => (
          <Rect
            key={i}
            x={x}
            y={y}
            width={7}
            height={7}
            rx={1.8}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        ))}
      {name === 'rocket' && (
        <Circle cx={12} cy={9} r={1.5} stroke={color} strokeWidth={strokeWidth} />
      )}
    </Svg>
  );
}

export function LockIcon({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={11} width={14} height={10} rx={2.4} stroke={color} strokeWidth={2.2} />
      <Path d="M7 11V8a5 5 0 0 1 10 0v3" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon({ size = 14, color, strokeWidth = 2.6 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m5 12.8 4.4 4.4L19 7.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function FlameIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2c.9 3.6 5 5.3 5 9.6a5 5 0 0 1-10 0c0-1.9.9-3.1 2-4 .3 1.4 1 2.1 2 2.1-.2-3-.9-5.2 1-7.7z"
        fill={color}
      />
    </Svg>
  );
}

export function BoltIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M13 2 4 14h7l-1 8 9-12h-7z" fill={color} />
    </Svg>
  );
}

export function HeartIcon({ size = 16, color, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MedalIcon({ size = 16, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={9} r={5.5} stroke={color} strokeWidth={1.9} />
      <Path
        d="m8.5 13.5-2 7.5 5.5-3 5.5 3-2-7.5"
        stroke={color}
        strokeWidth={1.9}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function StarIcon({ size = 12, color, filled }: IconProps & { filled: boolean }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 0.45 : 1;
    return `${12 + Math.cos(a) * 10 * r},${12.6 + Math.sin(a) * 10 * r}`;
  }).join(' ');
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points={pts}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
