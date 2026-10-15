import { EXTERNAL_LINKS, SECTION_IDS } from "@/lib/data/copy";
import { Logo } from "./Logo";

const linkClass =
  "text-base font-normal leading-[1.2] text-head no-underline hover:text-mute";

// The footer uses the same theme-aware surface tokens as the other page sections.
export function Footer() {
  return (
    <footer
      data-tone="surface"
      className="border-t border-rule-2 bg-page py-24 text-fg transition-colors duration-500"
      style={{ paddingInline: "clamp(24px,4vw,64px)" }}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] items-start gap-x-8 gap-y-12">
        <div className="flex flex-col gap-4">
          <Logo className="h-[34px] w-16" color="var(--head)" />
          <span className="max-w-[300px] text-[15px] leading-normal text-mute">
            Turismo, educación ambiental y participación ciudadana. Proyecto no
            oficial.
          </span>
        </div>
        <FooterNav
          title="Explorar"
          links={[
            ["Territorio", `#${SECTION_IDS.territory}`],
            ["Portales", `#${SECTION_IDS.portals}`],
            ["Accesos", `#${SECTION_IDS.roads}`],
            ["Ecosistema", `#${SECTION_IDS.ecosystem}`],
          ]}
        />
        <FooterNav
          title="Participar"
          links={[
            ["Aprender jugando", `#${SECTION_IDS.play}`],
            // v6 links "Modo historia" to the Prototipo file. Open decision (guide §13): points to the games until the story mode exists.
            ["Modo historia", `#${SECTION_IDS.play}`],
          ]}
        />
        <FooterNav
          title="Institucional"
          links={[
            ["Prensa", EXTERNAL_LINKS.park],
            ["Contacto", EXTERNAL_LINKS.park],
            ["Parque Iberá", EXTERNAL_LINKS.park],
          ]}
        />
      </div>
      <div className="mx-auto mt-16 max-w-[1440px] border-t border-rule-2 pt-6 text-[13px] leading-normal text-mute">
        Estados de camino, reclamos, teléfonos, alojamientos, combustible y
        cifras de los juegos: datos de ejemplo. Ubicaciones de portales por
        coordenadas geográficas; cartografía © OpenStreetMap, OpenMapTiles,
        OpenFreeMap. Fotos: Wikimedia Commons.
      </div>
    </footer>
  );
}

function FooterNav({
  title,
  links,
}: {
  title: string;
  links: [label: string, href: string][];
}) {
  return (
    <nav aria-label={title} className="flex flex-col gap-3.5">
      <span className="eyebrow mb-1 text-mute">{title}</span>
      {links.map(([label, href]) => {
        const external = href.startsWith("http");
        return (
          <a
            key={label}
            href={href}
            className={linkClass}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
