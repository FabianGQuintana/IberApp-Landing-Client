import { getPortal } from "@/lib/data/portals";
import type { ReportStatus } from "@/types/admin/report";
import type { StoredCategory, StoredReport, StoredUser } from "./db";

// Initial data of the demo server. Categories are the backend's (ReportCategoryConfiguration.HasData,
// same ids and severities); users and reports are SAMPLE DATA spread over the 8 portals.

const CATEGORY = {
  leachate: "8d1f2c3a-0002-4a6e-9b1a-000000000001",
  waste: "8d1f2c3a-0002-4a6e-9b1a-000000000002",
  fire: "8d1f2c3a-0002-4a6e-9b1a-000000000003",
  poaching: "8d1f2c3a-0002-4a6e-9b1a-000000000004",
  wildlife: "8d1f2c3a-0002-4a6e-9b1a-000000000005",
  infrastructure: "8d1f2c3a-0002-4a6e-9b1a-000000000006",
  other: "8d1f2c3a-0002-4a6e-9b1a-000000000007",
};

export const SEED_CATEGORIES: StoredCategory[] = [
  { id: CATEGORY.leachate, name: "Lixiviados", description: "Líquidos contaminantes que escurren de residuos.", severityLevel: "High" },
  { id: CATEGORY.waste, name: "Plásticos y residuos", description: "Basura o plásticos abandonados en el área protegida.", severityLevel: "Moderate" },
  { id: CATEGORY.fire, name: "Incendio", description: "Foco de incendio o quema activa.", severityLevel: "Emergency" },
  { id: CATEGORY.poaching, name: "Caza o pesca furtiva", description: "Indicios o presencia de caza/pesca ilegal.", severityLevel: "Critical" },
  { id: CATEGORY.wildlife, name: "Fauna herida o muerta", description: "Animal herido, enfermo o muerto.", severityLevel: "High" },
  { id: CATEGORY.infrastructure, name: "Infraestructura dañada", description: "Senderos, carteles o pasarelas en mal estado.", severityLevel: "Low" },
  { id: CATEGORY.other, name: "Otro", description: "Incidente que no encaja en las demás categorías.", severityLevel: "Low" },
];

const USER = {
  juan: "00000000-0000-4000-8000-000000000001", // same id as DEMO_USER (lib/rangers/demo.ts)
  admin: "00000000-0000-4000-8000-000000000002",
  maria: "00000000-0000-4000-8000-000000000003",
  diego: "00000000-0000-4000-8000-000000000004",
  lucia: "00000000-0000-4000-8000-000000000005",
};

export const SEED_USERS: StoredUser[] = [
  { id: USER.admin, name: "Ana", lastName: "Gómez", email: "admin@ibera.demo", portal: "CarlosPellegrini", role: "Admin", isActive: true },
  { id: USER.juan, name: "Juan", lastName: "Pérez", email: "guardaparque@ibera.demo", portal: "CarlosPellegrini", role: "Ranger", isActive: true },
  { id: USER.maria, name: "María", lastName: "Benítez", email: "maria.benitez@ibera.demo", portal: "Cambyreta", role: "Ranger", isActive: true },
  { id: USER.diego, name: "Diego", lastName: "Ramírez", email: "diego.ramirez@ibera.demo", portal: "Galarza", role: "Ranger", isActive: true },
  { id: USER.lucia, name: "Lucía", lastName: "Fernández", email: "lucia.fernandez@ibera.demo", portal: "SanNicolas", role: "Ranger", isActive: true },
];

type SeedRow = {
  /** Portal id in lib/data/portals.ts, plus an offset in degrees (~1 km = 0.009) */
  near: [portal: string, dLat: number, dLng: number];
  category: keyof typeof CATEGORY;
  status: ReportStatus;
  /** How long before the seed was written it was captured */
  ago: [days: number, hours: number];
  by: keyof typeof USER;
  photo: string | null;
  notes: string | null;
};

const REPORTS: SeedRow[] = [
  { near: ["laguna", 0.004, 0.012], category: "waste", status: "Pending", ago: [0, 1.5], by: "juan", photo: "plastic-pollution", notes: "Bolsas y botellas acumuladas en la costanera, cerca del muelle." },
  { near: ["laguna", -0.011, 0.021], category: "wildlife", status: "Pending", ago: [1, 3], by: "juan", photo: "marsh-deer", notes: "Ciervo de los pantanos rengueando cerca del sendero de los monos. No se deja acercar." },
  { near: ["laguna", 0.007, -0.006], category: "infrastructure", status: "Done", ago: [12, 5], by: "juan", photo: null, notes: "Pasarela del centro de interpretación con dos tablas sueltas." },
  { near: ["laguna", -0.018, -0.014], category: "leachate", status: "Canceled", ago: [30, 2], by: "juan", photo: "water-pollution", notes: "Mancha oscura en el canal. Era barro que levantó una lancha." },
  { near: ["cambyreta", 0.015, -0.009], category: "fire", status: "Pending", ago: [0, 4], by: "maria", photo: "grass-fire", notes: "Humo en el palmar, al norte del mirador. Avanza con el viento." },
  { near: ["cambyreta", -0.022, 0.013], category: "fire", status: "Done", ago: [9, 6], by: "maria", photo: "grass-fire", notes: "Quema de pastizal junto al camino. La apagaron los brigadistas." },
  { near: ["cambyreta", 0.006, 0.018], category: "other", status: "Pending", ago: [3, 2], by: "maria", photo: null, notes: "Tranquera del acceso abierta y sin candado." },
  { near: ["cambyreta", -0.009, -0.024], category: "poaching", status: "Done", ago: [20, 9], by: "maria", photo: null, notes: "Redes de pesca abandonadas en el estero." },
  { near: ["sannicolas", 0.012, 0.008], category: "leachate", status: "Pending", ago: [2, 7], by: "lucia", photo: "water-pollution", notes: "Líquido aceitoso que baja del basural hacia la laguna." },
  { near: ["sannicolas", -0.014, -0.011], category: "wildlife", status: "Canceled", ago: [15, 4], by: "lucia", photo: null, notes: "Yacaré quieto en la orilla. Al volver se había ido: estaba tomando sol." },
  { near: ["sannicolas", 0.019, -0.017], category: "infrastructure", status: "Done", ago: [34, 3], by: "lucia", photo: null, notes: "Cartel del sendero interpretativo caído." },
  { near: ["uguay", 0.008, 0.016], category: "waste", status: "Pending", ago: [1, 8], by: "juan", photo: "plastic-pollution", notes: "Restos de camping y anzuelos en la costa." },
  { near: ["uguay", -0.013, 0.005], category: "poaching", status: "Pending", ago: [4, 10], by: "juan", photo: null, notes: "Disparos al amanecer del lado del bañado." },
  { near: ["uguay", 0.017, -0.012], category: "waste", status: "Done", ago: [25, 1], by: "juan", photo: "plastic-pollution", notes: null },
  { near: ["galarza", -0.016, -0.019], category: "fire", status: "Done", ago: [38, 5], by: "diego", photo: "grass-fire", notes: "Rebrote del incendio en la zona en recuperación." },
  { near: ["galarza", 0.011, 0.014], category: "wildlife", status: "Pending", ago: [6, 2], by: "diego", photo: "marsh-deer", notes: "Ciervo atropellado sobre la RP 41." },
  { near: ["galarza", 0.021, -0.007], category: "infrastructure", status: "Pending", ago: [10, 6], by: "diego", photo: null, notes: "El barro cortó el camino al mirador del monte." },
  { near: ["galarza", -0.005, 0.023], category: "other", status: "Canceled", ago: [18, 3], by: "diego", photo: null, notes: "Vecinos avisaron de ruidos de motor de noche. No se encontró nada." },
  { near: ["carambola", 0.009, 0.011], category: "other", status: "Pending", ago: [2, 1], by: "lucia", photo: "light-pollution", notes: "Reflector nuevo en una estancia vecina: ilumina el mirador nocturno." },
  { near: ["carambola", -0.017, 0.006], category: "waste", status: "Done", ago: [28, 4], by: "lucia", photo: "plastic-pollution", notes: null },
  { near: ["carambola", 0.014, -0.02], category: "poaching", status: "Canceled", ago: [41, 7], by: "lucia", photo: null, notes: "Huellas de vehículo en el monte. Eran del equipo de investigación." },
  { near: ["sanantonio", 0.01, -0.013], category: "leachate", status: "Pending", ago: [5, 3], by: "maria", photo: "water-pollution", notes: "Basural a cielo abierto a metros del arroyo." },
  { near: ["sanantonio", -0.012, 0.009], category: "waste", status: "Done", ago: [14, 8], by: "maria", photo: null, notes: "Botellas en la laguna. Las juntamos con los vecinos." },
  { near: ["mburucuya", 0.013, 0.017], category: "wildlife", status: "Pending", ago: [0, 6], by: "diego", photo: "capybara", notes: "Carpincho herido en el estero Santa Lucía." },
  { near: ["mburucuya", -0.018, 0.008], category: "fire", status: "Canceled", ago: [22, 2], by: "diego", photo: null, notes: "Columna de humo: era una quema autorizada fuera del parque." },
  { near: ["mburucuya", 0.006, -0.015], category: "poaching", status: "Done", ago: [32, 9], by: "diego", photo: null, notes: "Trampas para carpinchos cerca del sendero Yatay." },
];

const HOUR = 3600_000;
const round5 = (n: number) => Math.round(n * 1e5) / 1e5;

/** Fixed ids, so the seed is the same after every reset (only the dates move, relative to now) */
const seedId = (prefix: string, n: number) => `${prefix}-0000-4000-8000-${String(n).padStart(12, "0")}`;

export function seedReports(now = Date.now()): StoredReport[] {
  return REPORTS.map((row, i) => {
    const [portalId, dLat, dLng] = row.near;
    const portal = getPortal(portalId)!;
    const captured = now - (row.ago[0] * 24 + row.ago[1]) * HOUR;
    return {
      id: seedId("5eed0000", i + 1),
      clientId: seedId("c11e0000", i + 1),
      latitude: round5(portal.lat + dLat),
      longitude: round5(portal.lng + dLng),
      notes: row.notes,
      captureDate: new Date(captured).toISOString(),
      // Rangers sync once they reach signal, a few hours later
      syncDate: new Date(Math.min(captured + 3 * HOUR, now)).toISOString(),
      status: row.status,
      photo: row.photo && `/img/${row.photo}.webp`,
      reportCategoryId: CATEGORY[row.category],
      reportedById: USER[row.by],
    };
  });
}
