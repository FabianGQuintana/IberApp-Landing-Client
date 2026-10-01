import type { ImageId } from "./portal";

/** "El estero respira" cards (v6: `FAUNA`) */
export interface Species {
  category: string;
  name: string;
  scientificName: string;
  image: ImageId;
  line: string;
  text: string;
  where: string;
}

/** "Fragilidad" cards (v6: `FRAG`) */
export interface Threat {
  title: string;
  image: ImageId;
  line: string;
  text: string;
  where: string;
  game: string;
}
