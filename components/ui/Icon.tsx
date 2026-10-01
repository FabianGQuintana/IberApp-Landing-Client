// Custom icon set from the prototype (docs/prototipo/.../Icon.dc.html).
// 24 grid, 1.7 stroke. Solid shapes use `color`; cut-outs use `knockout` (the background color).

type Part = [kind: "f" | "fk" | "k" | "kf" | "kk" | "s", d: string, width?: number];

const circle = (x: number, y: number, r: number) =>
  `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

const ICONS = {
  check: [["f", circle(12, 12, 9)], ["k", "M8 12.3l2.8 2.8L16 9.7"]],
  alert: [["f", "M10.4 4.6a1.8 1.8 0 0 1 3.2 0l7.2 13.1a1.8 1.8 0 0 1-1.6 2.7H4.8a1.8 1.8 0 0 1-1.6-2.7Z"], ["k", "M12 9.6v4"], ["k", "M12 16.9v.1", 2.2]],
  closed: [["f", circle(12, 12, 9)], ["k", "M7.8 12h8.4", 2]],
  car4x4: [["f", "M3.5 15.5v-3.7l2-4.4a2 2 0 0 1 1.8-1.2h9.4a2 2 0 0 1 1.8 1.2l2 4.4v3.7a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1Z"], ["kf", "M6.9 11.2l1.1-2.6h8l1.1 2.6Z"], ["fk", circle(7.5, 17.4, 2.1)], ["fk", circle(16.5, 17.4, 2.1)]],
  trash: [["s", "M4 6.5h16"], ["f", "M9.5 6.5V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.7"], ["f", "M6 6.5h12l-1 13a1.5 1.5 0 0 1-1.5 1.4h-7A1.5 1.5 0 0 1 7 19.5Z"], ["k", "M10 10.5v6"], ["k", "M14 10.5v6"]],
  drop: [["f", "M12 3.2c3.4 4 6 7.4 6 10.6a6 6 0 0 1-12 0c0-3.2 2.6-6.6 6-10.6Z"], ["k", "M9.3 14.2a2.7 2.7 0 0 0 2.7 2.7"]],
  fire: [["f", "M12 3c.9 3 4.3 4.9 5.3 8.3A6.2 6.2 0 0 1 12 21a6.2 6.2 0 0 1-6.2-6.6c.3-2.4 1.8-3.8 2.9-5.4.4 1.6 1.2 2.6 2.3 3.1C11.6 9.6 10.9 6 12 3Z"], ["kf", "M12 18.2a2 2 0 0 1-2-2c0-1.2 1-2.1 2-3.4 1 1.3 2 2.2 2 3.4a2 2 0 0 1-2 2Z"]],
  inbox: [["f", "M3.5 13l2.7-7a1.6 1.6 0 0 1 1.5-1h8.6a1.6 1.6 0 0 1 1.5 1l2.7 7v5.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5Z"], ["k", "M3.6 13H8l1.5 2.5h5L16 13h4.4"]],
  forward: [["f", circle(12, 12, 9)], ["k", "M7.8 12h7.8"], ["k", "M12.6 8.8l3.2 3.2-3.2 3.2"]],
  kayak: [["f", "M2.5 13h19l-2 3.5a2 2 0 0 1-1.7 1H6.2a2 2 0 0 1-1.7-1Z"], ["kk", "M8.2 4l7.6 16"], ["s", "M8.2 4l7.6 16"], ["s", "M7.2 2.6l1.2 2.4", 3.2], ["s", "M15.6 19.2l1.2 2.4", 3.2]],
  mountain: [["f", "M2.8 19.5l6-10.2a1 1 0 0 1 1.7 0l3.1 5.2 1.8-2.8a1 1 0 0 1 1.7 0l4.6 7.8Z"], ["f", circle(17, 5.8, 2)]],
  star: [["f", "M12 3.3l2.6 5.4 5.9.9-4.3 4.1 1 5.9L12 16.8l-5.2 2.8 1-5.9-4.3-4.1 5.9-.9Z"]],
  eye: [["f", "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"], ["kf", circle(12, 12, 3.3)], ["f", circle(12, 12, 1.4)]],
  pin: [["f", "M12 21.3s-6.8-6-6.8-11.2a6.8 6.8 0 0 1 13.6 0c0 5.2-6.8 11.2-6.8 11.2Z"], ["kf", circle(12, 10.1, 2.4)]],
  camera: [["f", "M3.5 8.6A1.6 1.6 0 0 1 5.1 7h2.4L9 5h6l1.5 2h2.4a1.6 1.6 0 0 1 1.6 1.6v9.3a1.6 1.6 0 0 1-1.6 1.6H5.1a1.6 1.6 0 0 1-1.6-1.6Z"], ["kf", circle(12, 13, 3.6)], ["f", circle(12, 13, 1.8)]],
  home: [["f", "M3.5 10.6L12 3.6l8.5 7v8.4a1.5 1.5 0 0 1-1.5 1.5h-4.2v-5.6H9.2v5.6H5A1.5 1.5 0 0 1 3.5 19Z"]],
  map: [["f", "M3.5 6.3L9 4l6 2.5L20.5 4v13.7L15 20l-6-2.5-5.5 2.3Z"], ["k", "M9 4.3v13"], ["k", "M15 6.7v13"]],
  joystick: [["f", "M7.2 7.5h9.6a4.6 4.6 0 0 1 4.5 5.5l-.8 4a2.6 2.6 0 0 1-4.4 1.3L14 16.2h-4l-2.1 2.1a2.6 2.6 0 0 1-4.4-1.3l-.8-4A4.6 4.6 0 0 1 7.2 7.5Z"], ["k", "M7.6 10.6v3.2"], ["k", "M6 12.2h3.2"], ["k", "M15.6 11.2v.1", 2.2], ["k", "M17.6 13.2v.1", 2.2]],
  megaphone: [["f", "M3.5 10.2v3.6a1.2 1.2 0 0 0 1.2 1.2H7l7 4.3V4.7L7 9H4.7a1.2 1.2 0 0 0-1.2 1.2Z"], ["s", "M17.3 9a4.2 4.2 0 0 1 0 6"], ["s", "M7.5 15.2l1.1 4.3"]],
  arrow: [["s", "M9.5 6l6 6-6 6", 2]],
  back: [["s", "M14.5 6l-6 6 6 6", 2]],
  clock: [["f", circle(12, 12, 9)], ["k", "M12 7.5V12l3 2"]],
  info: [["f", circle(12, 12, 9)], ["k", "M12 11v5"], ["k", "M12 8v.1", 2.2]],
  locate: [["f", circle(12, 12, 4.6)], ["s", "M12 2.8v3"], ["s", "M12 18.2v3"], ["s", "M2.8 12h3"], ["s", "M18.2 12h3"]],
  download: [["f", circle(12, 12, 9)], ["k", "M12 7.5v7"], ["k", "M8.8 11.6L12 14.8l3.2-3.2"]],
} satisfies Record<string, Part[]>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  /** Solid shape color */
  color?: string;
  /** Cut-out color (usually the background behind the icon) */
  knockout?: string;
  size?: number;
  className?: string;
}

export function Icon({ name, color = "currentColor", knockout = "#FFFFFF", size = 24, className }: IconProps) {
  const parts: Part[] = ICONS[name] ?? ICONS.info;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className} style={{ display: "block", flex: "none" }}>
      {parts.map(([kind, d, width], i) => {
        const base = { d, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: width ?? 1.7 };
        switch (kind) {
          case "f":
            return <path key={i} {...base} fill={color} stroke={color} />;
          case "fk":
            return <path key={i} {...base} fill={color} stroke={knockout} />;
          case "k":
            return <path key={i} {...base} fill="none" stroke={knockout} />;
          case "kf":
            return <path key={i} {...base} fill={knockout} stroke={knockout} />;
          case "kk":
            return <path key={i} {...base} fill="none" stroke={knockout} strokeWidth={4.6} />;
          default:
            return <path key={i} {...base} fill="none" stroke={color} />;
        }
      })}
    </svg>
  );
}
