import type { Species, Threat } from "@/types/content";

// Source: `FAUNA` and `FRAG` in Ibera Landing v6.

export const SPECIES: Species[] = [
  {
    category: "Fauna",
    name: "Yaguareté",
    scientificName: "Panthera onca",
    image: "jaguar",
    line: "Volvió después de setenta años de ausencia.",
    text: "Desapareció de Corrientes a mediados del siglo XX. Desde 2021 vuelve a vivir en libertad en el Iberá.",
    where: "San Nicolás",
  },
  {
    category: "Fauna",
    name: "Ciervo de los pantanos",
    scientificName: "Blastocerus dichotomus",
    image: "marsh-deer",
    line: "Camina donde el suelo es agua.",
    text: "El ciervo más grande de Sudamérica. Sus pezuñas se abren para no hundirse en los bañados.",
    where: "Mburucuyá",
  },
  {
    category: "Fauna",
    name: "Carpincho",
    scientificName: "Hydrochoerus hydrochaeris",
    image: "capybara",
    line: "El vecino más tranquilo del pueblo.",
    text: "El roedor más grande del mundo vive en grupos junto al agua; en Pellegrini cruza las calles de arena.",
    where: "Laguna Iberá",
  },
  {
    category: "Hábitat · Flora",
    name: "Embalsados",
    scientificName: "Camalotes, pirí y totoras",
    image: "water-hyacinth",
    line: "Islas flotantes que sostienen vida.",
    text: "La vegetación se acumula sobre el agua hasta formar suelo firme, donde crecen árboles y viven animales.",
    where: "Todo el estero",
  },
];

export const THREATS: Threat[] = [
  {
    title: "Residuos",
    image: "plastic-pollution",
    line: "Lo que se tira en el pueblo llega al canal.",
    text: "Plásticos y bolsas que no se recolectan viajan con la crecida hasta la laguna y los animales que viven en ella.",
    where: "Laguna Iberá y Uguay",
    game: "Canales limpios",
  },
  {
    title: "Lixiviados",
    image: "water-pollution",
    line: "Lo que no se ve también contamina.",
    text: "El líquido que se filtra de la basura acumulada viaja bajo tierra hasta el agua y cambia plantas y peces.",
    where: "San Nicolás y San Antonio",
    game: "Señales del agua",
  },
  {
    title: "Fuego",
    image: "grass-fire",
    line: "Hay daños que no se revierten.",
    text: "En 2022 los incendios afectaron una porción enorme de la reserva. Solo se pueden prevenir y mitigar.",
    where: "Galarza y Cambyretá",
    game: "Voces de la noche",
  },
  {
    title: "Luz artificial",
    image: "light-pollution",
    line: "Cada luz de más apaga una estrella.",
    text: "La luz de los pueblos borra el cielo nocturno y desorienta a aves e insectos.",
    where: "Carambola",
    game: "Cielo oscuro",
  },
];
