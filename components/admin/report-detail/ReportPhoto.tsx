"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";

type Props = { photoUrl: string | null; alt: string; caption: string };

/** The report's photo, big; a click opens it full screen. "Sin foto" when the ranger did not take one. */
export function ReportPhoto({ photoUrl, alt, caption }: Props) {
  const [open, setOpen] = useState(false);

  if (!photoUrl) {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-rule bg-page-2 text-mute">
        <span aria-hidden="true" className="text-[2rem] leading-none">
          📷
        </span>
        <span className="text-[16px] font-medium">Sin foto</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ver la foto en pantalla completa"
        className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[12px] border border-rule bg-night p-0"
      >
        {/* Synced photos are blob: URLs (demo) or the API's storage: served as they are */}
        <Image src={photoUrl} alt={alt} fill unoptimized sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.015]" />
        <span className="absolute bottom-3 right-3 rounded-full bg-night/70 px-3 py-1.5 text-[13px] font-semibold text-cloud backdrop-blur-sm">
          ⤢ Ampliar
        </span>
      </button>
      {open ? <Lightbox title="Reporte" slides={[{ src: photoUrl, alt, caption }]} index={0} onIndexChange={() => {}} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
