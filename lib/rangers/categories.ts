// Report categories shown as big icon buttons. The ids are the FIXED ids seeded by the backend
// (ReportCategoryConfiguration.HasData), so the app works offline without downloading them first.

export type Category = {
  id: string;
  label: string;
  icon: string;
  /** Name in the backend, read aloud by screen readers */
  description: string;
};

export const CATEGORIES: Category[] = [
  { id: "8d1f2c3a-0002-4a6e-9b1a-000000000002", label: "Basura", icon: "🗑️", description: "Plásticos y residuos" },
  { id: "8d1f2c3a-0002-4a6e-9b1a-000000000001", label: "Lixiviados", icon: "🛢️", description: "Líquidos contaminantes" },
  { id: "8d1f2c3a-0002-4a6e-9b1a-000000000005", label: "Fauna herida", icon: "🦌", description: "Animal herido o muerto" },
  { id: "8d1f2c3a-0002-4a6e-9b1a-000000000006", label: "Infraestructura", icon: "🚧", description: "Senderos, carteles o pasarelas dañados" },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
