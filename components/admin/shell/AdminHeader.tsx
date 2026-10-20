"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_CONTAINER } from "@/components/admin/shell/container";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { clearAdminSession } from "@/lib/admin/session";
import type { UserProfile } from "@/types/rangers/auth";

const NAV = [
  { href: "/admin/reportes", label: "Reportes" },
  { href: "/admin/categorias", label: "Categorías" },
];

type Props = {
  /** Signed-in admin: adds the navigation, the name and "Salir". Without it, only the brand and the theme toggle. */
  user?: UserProfile;
};

/** Desktop header of the panel: same brand block and theme toggle as the landing and /rangers. */
export function AdminHeader({ user }: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-navline bg-navglass backdrop-blur-[18px]">
      <div className={`${ADMIN_CONTAINER} flex min-h-[68px] flex-wrap items-center gap-x-8 gap-y-1 py-2`}>
        <Link href="/" className="flex items-center gap-3 text-head no-underline hover:opacity-90" aria-label="Ir a la página principal de Iberá">
          <Logo className="h-7 w-[52px]" />
          <span className="flex flex-col items-start gap-1 border-l border-rule pl-3">
            <span className="title-display text-[17px] leading-[0.9]">Iberá</span>
            <span className="text-[11px] font-medium uppercase leading-none tracking-[.08em] text-mute">Panel de administración</span>
          </span>
        </Link>

        {user ? (
          // Below md the navigation wraps to its own row under the brand
          <nav aria-label="Panel" className="order-last -mx-3.5 flex w-full gap-1 md:order-none md:mx-0 md:w-auto">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : active ? "true" : undefined}
                  className={`flex h-10 items-center rounded-[10px] px-3.5 text-[15px] font-medium no-underline transition-colors ${
                    active ? "bg-mint/15 text-head hover:text-head" : "text-mute hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-[15px] font-semibold text-fg sm:block">
                {user.name} {user.lastName}
              </span>
              <button
                type="button"
                onClick={clearAdminSession}
                className="flex h-10 items-center rounded-[10px] border border-rule bg-transparent px-3.5 text-[15px] font-medium text-fg transition-colors hover:border-fg"
              >
                Salir
              </button>
            </>
          ) : null}
          <ThemeToggle color="var(--fg)" borderColor="var(--rule)" />
        </div>
      </div>
    </header>
  );
}
