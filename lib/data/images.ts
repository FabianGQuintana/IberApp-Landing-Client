import type { ImageId } from "@/types/portal";

// Photos from Wikimedia Commons, downloaded to public/img as WebP (up to 2200 px wide).
// Same files the prototype hotlinks (`static I` in Ibera Landing v6). Attribution goes in the footer.
export const IMAGES: Record<ImageId, { src: string; alt: string; file: string }> = {
  laguna: { src: "/img/laguna.webp", alt: "Laguna Iberá al atardecer", file: "Esteros_del_Ibera_Laguna.JPG" },
  wetlands: { src: "/img/wetlands.webp", alt: "Esteros abiertos del Iberá al atardecer", file: "Esteros Del Ibera, Corrientes, Argentina, 2nd. Jan 2011 - Flickr - PhillipC (4).jpg" },
  urupe: { src: "/img/urupe.webp", alt: "Bañados cubiertos de urupé", file: "Urupe, Esteros Del Ibera, Corrientes, Argentina, 2nd. Jan 2011 - Flickr - PhillipC.jpg" },
  cormorants: { src: "/img/cormorants.webp", alt: "Cormoranes sobre los camalotes", file: "Avifauna_en_los_esteros_del_Iberá,_cormoranes.JPG" },
  caiman: { src: "/img/caiman.webp", alt: "Yacaré en la laguna", file: "Yacaré_-_Esteros_del_Iberá_-_Argentina_02.jpg" },
  cardinal: { src: "/img/cardinal.webp", alt: "Cardenal amarillo", file: "Gubernatrix cristata - Yellow cardinal (male); Iberá marshes, Corrientes, Argentina.jpg" },
  "caiman-flower": { src: "/img/caiman-flower.webp", alt: "Yacaré entre camalotes en flor", file: "Yacare con flor (26389548324).jpg" },
  "caiman-shore": { src: "/img/caiman-shore.webp", alt: "Yacaré en la orilla", file: "Esteros_Ibera_Caiman_Yacare.jpg" },
  satellite: { src: "/img/satellite.webp", alt: "Imagen satelital de los Esteros del Iberá", file: "Esteros del Iberá, Argentina.jpg" },
  jaguar: { src: "/img/jaguar.webp", alt: "Yaguareté", file: "Jaguar (Panthera onca palustris) male Three Brothers River 2.jpg" },
  "jaguar-standing": { src: "/img/jaguar-standing.webp", alt: "Yaguareté de pie", file: "Standing jaguar.jpg" },
  capybara: { src: "/img/capybara.webp", alt: "Carpincho junto al agua", file: "Capybara (Hydrochoerus hydrochaeris).JPG" },
  "marsh-deer": { src: "/img/marsh-deer.webp", alt: "Ciervo de los pantanos", file: "Blastocerus dichotomus.jpg" },
  "water-hyacinth": { src: "/img/water-hyacinth.webp", alt: "Camalotes en flor", file: "Pontederia crassipes.jpg" },
  "night-sky": { src: "/img/night-sky.webp", alt: "Cielo nocturno sin contaminación lumínica", file: "Milky Way Night Sky Black Rock Desert Nevada.jpg" },
  "plastic-pollution": { src: "/img/plastic-pollution.webp", alt: "Residuos plásticos junto al agua", file: "Plastic Pollution.jpg" },
  "water-pollution": { src: "/img/water-pollution.webp", alt: "Agua contaminada", file: "Water pollution.jpg" },
  "grass-fire": { src: "/img/grass-fire.webp", alt: "Fuego en un pastizal", file: "Grass fire.jpg" },
  "light-pollution": { src: "/img/light-pollution.webp", alt: "Contaminación lumínica sobre una ciudad", file: "Light pollution.jpg" },
};

export const commonsUrl = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;
