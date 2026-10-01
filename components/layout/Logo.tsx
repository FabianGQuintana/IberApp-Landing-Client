// Isotype (public/iso.svg) used as a CSS mask so it can be tinted, as in Ibera Landing v6.
export function Logo({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block ${className}`}
      style={{
        background: color,
        WebkitMask: "url(/iso.svg) left center / contain no-repeat",
        mask: "url(/iso.svg) left center / contain no-repeat",
        transition: "background-color .5s",
      }}
    />
  );
}
