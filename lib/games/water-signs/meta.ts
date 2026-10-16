import type { GameMeta } from "@/lib/games/contract";
import type { DistractorId, ElementId, SignalId } from "./rules";

// water-signs (Señales en el agua): a still lagoon where the player marks the signs of polluted water, then one
// closing question about where they come from (user specification, G2·0 decisions, interface texts of 13/10/2026).
// Pure data: no Phaser. Every text is the user's, copied literally.
//
// `completed` is always true when the closing question is answered (the game cannot be lost). `total` is ALWAYS 8,
// the signals in the scene (unlike clean-channels, where it is what was collected: deliberate, do not "fix" it).
// `hits` = signals found, `score` = their points. The closing question does not score (hitsFrom "game").

/** Shown when a signal is marked. */
export const SIGNAL_TEXTS: Record<SignalId, string> = {
  "dead-fish": "Si los peces no resisten, el agua perdió oxígeno o tiene algo tóxico disuelto. Es la señal más grave de todas.",
  "oil-sheen": "Esa irisación es una capa de aceite o combustible. Tapa la superficie y corta el intercambio de oxígeno con el aire.",
  "bottom-bubbling": "Burbujas que suben solas: hay materia orgánica pudriéndose en el fondo y consumiendo el oxígeno del agua.",
  "persistent-foam": "La espuma del oleaje se deshace sola. Esta no: queda porque hay detergentes o compuestos disueltos.",
  "dead-vegetation": "Los juncos filtran el agua y sostienen la orilla. Una franja seca marca hasta dónde llegó el daño.",
  "algae-bloom": "Ese verde intenso es exceso de nutrientes. Las algas tapan la luz y, al morir, dejan el agua sin oxígeno.",
  "buried-waste": "Acá está el origen. La barranca se fue lavando y dejó a la vista lo que alguien enterró.",
  "murky-patch": "Una mancha turbia en un punto, y no en toda la laguna, suele marcar un vertido reciente.",
};

/** Shown when a distractor (something healthy) is marked: why it is normal. */
export const DISTRACTOR_TEXTS: Record<DistractorId, string> = {
  "tannin-water": "El agua del Iberá es oscura por naturaleza: la vegetación en descomposición suelta taninos y la tiñen como un té. No está sucia, es así.",
  camalote: "Los camalotes son plantas flotantes nativas. El viento los junta y forman los embalsados: son parte del estero, no basura.",
  irupe: "El irupé es nativo. Sus hojas aguantan el peso de un pájaro parado encima.",
  caiman: "El yacaré pasa horas quieto al sol para regular su temperatura. Que no se mueva no significa nada malo.",
  capybara: "El carpincho entra y sale del agua todo el día. El barro removido en la orilla es su rastro.",
  "sunken-log": "Un tronco hundido no contamina: da sombra y refugio a los peces.",
  "stirred-mud": "El agua se enturbia sola cuando la fauna pasa por la orilla. Se asienta en un rato.",
};

/**
 * Two names per element. `label`: neutral, always visible over the scene while observing; it says what is being looked
 * at, never whether it is a sign or a healthy element. `revealedLabel`: the descriptive name with the verdict
 * (specification's "Señal" / "Elemento" columns); it shows only once marked, as the heading of the mark's text.
 * Never unify them: the neutral one keeps the game a matter of judgment.
 */
export const ELEMENT_LABELS: Record<ElementId, { label: string; revealedLabel: string }> = {
  "dead-fish": { label: "Peces", revealedLabel: "Peces muertos flotando" },
  "oil-sheen": { label: "Reflejos", revealedLabel: "Película aceitosa, irisada" },
  "bottom-bubbling": { label: "Burbujas", revealedLabel: "Burbujeo desde el fondo" },
  "persistent-foam": { label: "Espuma", revealedLabel: "Espuma que no se deshace" },
  "dead-vegetation": { label: "Juncos", revealedLabel: "Franja de juncos secos" },
  "algae-bloom": { label: "Agua verde", revealedLabel: "Verde intenso en la superficie" },
  "buried-waste": { label: "Barranca", revealedLabel: "Residuos asomando en la barranca" },
  "murky-patch": { label: "Mancha", revealedLabel: "Mancha turbia junto a la orilla" },
  "tannin-water": { label: "Agua", revealedLabel: "Agua oscura, color té" },
  camalote: { label: "Camalotes", revealedLabel: "Camalotes flotando" },
  irupe: { label: "Irupé", revealedLabel: "Irupé" },
  caiman: { label: "Yacaré", revealedLabel: "Yacaré asoleándose" },
  capybara: { label: "Carpincho", revealedLabel: "Carpincho en la barranca" },
  "sunken-log": { label: "Tronco", revealedLabel: "Tronco sumergido" },
  "stirred-mud": { label: "Barro", revealedLabel: "Barro removido" },
};

/** Appended to a mark's text (one announcement per mark). */
export const NOTICES = {
  marksLeft: (n: number) => (n === 1 ? "Te queda 1 marca." : `Te quedan ${n} marcas.`),
  allFound: "Encontraste las 8 señales.",
  noMarks: "Se te terminaron las marcas.",
};

/** Phase 3, "El rastro": one question that does not score. The explanation is always shown. */
export const QUESTION = {
  id: "origin",
  title: "¿De dónde salió todo esto?",
  options: [
    { id: "landfill", label: "De un basural a cielo abierto, a varios kilómetros de acá" },
    { id: "animals", label: "De los animales que viven en el estero" },
    { id: "rain", label: "Del agua de lluvia que arrastra tierra de la costa" },
  ],
  answer: "landfill",
  /** Headings before the explanation: neither says "right" or "wrong" (the question does not score). */
  heading: { right: "Era el basural", wrong: "Venía del basural" },
  explanation:
    "La lluvia atraviesa la basura acumulada, disuelve lo que puede —metales de las pilas, restos de todo lo demás— y se filtra en el suelo. Ese líquido se llama lixiviado, viaja bajo tierra y aparece acá, lejos del basural y mucho después. Por eso cuesta tanto encontrar al responsable: entre la causa y la señal hay kilómetros y meses.",
} as const;

export const meta: GameMeta = {
  instructions: [
    "Mirá la laguna y marcá lo que te parezca una señal de que el agua está contaminada. No hay tiempo ni apuro: lo único limitado son las marcas.",
    "Ojo, no todo lo raro es contaminación. En el estero hay cosas que parecen sospechosas y son perfectamente normales.",
  ],
  controls: {
    pointer: "Tocá o hacé clic sobre lo que quieras marcar. Tocar el agua vacía no gasta nada.",
    keyboard: "Con el escenario enfocado, movés la mira con las flechas y marcás con Enter o Espacio. En la pregunta final, Tab y Enter.",
  },
  // Phase 4 closing text (two paragraphs).
  learning:
    "Las señales no aparecen todas juntas. Un lixiviado trabaja despacio: primero cambia el agua, después la vegetación de la orilla, al final los peces. Cuando se ven peces muertos, el problema lleva mucho tiempo andando.\nPor eso sirve que alguien mire y avise. Si ves algo así en el estero, reportalo.",
  total: 8,
  scoreLabel: "señales encontradas",
  // The 16:9 side bands and the 4:5 frame are bg2 (camera background): this point is in both.
  backgroundProbe: { x: 8, y: 450 },
  // A still scene: the only motion is a marker's 150 ms entrance after an input, which reducedMotion removes.
  essentialMotion: false,
  stillWithoutInput: true,
  difficulties: [
    { id: "calm", label: "Tranquilo", total: 8 },
    { id: "normal", label: "Normal", total: 8 },
    { id: "fast", label: "Atento", total: 8 },
  ],
  defaultDifficulty: "calm",
  // Unreachable by arithmetic (7 distractors, at least 8 marks): kept as a safeguard (G2·0, B4).
  emptyResult: {
    title: "Esta vez no marcaste ninguna señal",
    text: "Mirá el borde del agua, la superficie y la vegetación de la orilla: ahí está casi todo. En Tranquilo tenés 12 marcas para probar.",
    when: "hits",
  },
  pointsLabel: "puntos de gravedad detectada",
  hitsFrom: "game",
  textPanel: true,
  counterLabel: "marcas restantes",
};
