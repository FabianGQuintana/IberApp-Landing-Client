import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col justify-center gap-5 px-[clamp(24px,4vw,64px)]">
      <span className="eyebrow text-mute">Error 404</span>
      <h1 className="title-display m-0 text-[clamp(52px,6vw,104px)] leading-[0.9] text-head">Esta página no existe</h1>
      <Link href="/" className="link-underline self-start text-base font-medium no-underline">
        Volver al Iberá →
      </Link>
    </main>
  );
}
