export type RoadStatus = "open" | "caution" | "4x4";
export type Issue = "waste" | "leachate" | "fire" | "light";
export type GameId = "clean-channels" | "water-signs" | "dark-sky" | "night-voices";
export type ImageId =
  | "laguna"
  | "wetlands"
  | "urupe"
  | "cormorants"
  | "caiman"
  | "cardinal"
  | "caiman-flower"
  | "caiman-shore"
  | "satellite"
  | "jaguar"
  | "jaguar-standing"
  | "capybara"
  | "marsh-deer"
  | "water-hyacinth"
  | "night-sky"
  | "plastic-pollution"
  | "water-pollution"
  | "grass-fire"
  | "light-pollution";

export interface Portal {
  id: string;
  name: string;
  locality: string;
  kind: "portal" | "national-park";
  lat: number;
  lng: number;
  /** Territory map label placement (v6: labelOffsetX / labelOffsetY / labelAlign) */
  label: { offsetX: number; offsetY: number; align: "left" | "right" };
  route: string;
  tagline: string;
  description: string;
  history: string;
  activities: string[];
  pointsOfInterest: string[];
  lodging: { name: string; where: string }[];
  signal: string;
  fuel: string;
  phone: string;
  issue: Issue;
  issueText: string;
  game: GameId;
  image: ImageId;
  gallery: { image: ImageId; caption: string }[];
  /** Three-photo collage below the portal sheet (v6: `col`) */
  collage: [ImageId, ImageId, ImageId];
}
