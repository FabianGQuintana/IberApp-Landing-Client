"use client";

import { useEffect, useRef, useState } from "react";
import type { ReviewProps } from "@/lib/games/contract";
import { BINS, WASTE, type BinId, type WasteId } from "@/lib/games/clean-channels/meta";
import { SOUNDS } from "@/lib/games/clean-channels/sounds";
import { playEffect } from "@/lib/games/shared/sound";

// Phase 3 of clean-channels (specification, G1b): one group per waste type collected, four bins, immediate feedback
// that explains why, once per group. The groups follow the run's seeded order (buildRun().groupOrder). A right answer
// adds the type's points for every unit of the group; a wrong one adds nothing, never subtracts, and still shows the
// explanation. The result counts units: total = pieces collected, hits = pieces in groups classified right. A group of
// one looks exactly as before. Each group shows the waste's sprite from assetBase (DOM, never canvas) next to its name;
// a missing file leaves the name only. Answers sound right / wrong through the play's audio (nothing while muted).
// Loaded by GameStage after onRunEnd (its own chunk, no Phaser). Test interface (E1, per
// group in G1b): review-item (data-item-id = waste type, data-count, data-item-ids = debugRun().items ids),
// review-option-<bin>, review-feedback, review-next.

interface Collected {
  id: string;
  type: WasteId;
  bin: BinId;
  points: number;
}

interface Group {
  type: WasteId;
  bin: BinId;
  points: number;
  /** debugRun().items ids of the group's units, in the order they were collected. */
  ids: string[];
}

/** The collected units grouped by type, in the run's group order (types missing from it, if any, go last). */
function groupsOf(summary: unknown): Group[] {
  const s = (summary ?? {}) as { collected?: unknown; groupOrder?: unknown };
  const collected = Array.isArray(s.collected) ? (s.collected as Collected[]) : [];
  const order = Array.isArray(s.groupOrder) ? (s.groupOrder as WasteId[]) : [];
  const byType = new Map<WasteId, Group>();
  for (const unit of collected) {
    const group = byType.get(unit.type) ?? { type: unit.type, bin: unit.bin, points: unit.points, ids: [] };
    group.ids.push(unit.id);
    byType.set(unit.type, group);
  }
  const rank = (type: WasteId) => (order.includes(type) ? order.indexOf(type) : order.length);
  return [...byType.values()].sort((a, b) => rank(a.type) - rank(b.type));
}

const binLabel = (id: BinId) => BINS.find((b) => b.id === id)?.label ?? id;

export function Review({ summary, assetBase, audio, onAnswer, onDone }: ReviewProps) {
  const [groups] = useState(() => groupsOf(summary));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<BinId | null>(null);
  const [missing, setMissing] = useState<ReadonlySet<WasteId>>(() => new Set());
  const tally = useRef({ hits: 0, score: 0 });
  const next = useRef<HTMLButtonElement>(null);
  const units = groups.reduce((sum, g) => sum + g.ids.length, 0);

  // Nothing collected: the classification is skipped (specification); GameStage shows meta.emptyResult.
  useEffect(() => {
    if (groups.length === 0) onDone({ completed: true, hits: 0, total: 0, score: 0 });
  }, [groups, onDone]);

  useEffect(() => {
    if (answer !== null) next.current?.focus();
  }, [answer]);

  if (groups.length === 0) return null;
  const group = groups[index];
  const info = WASTE[group.type];
  const count = group.ids.length;
  const many = count > 1;
  const last = index === groups.length - 1;
  const hit = answer === info.bin;
  const title = many ? `${info.name} ×${count}` : info.name;

  const choose = (bin: BinId) => {
    if (answer !== null) return;
    const right = bin === info.bin;
    if (right) {
      tally.current.hits += count;
      tally.current.score += info.points * count;
    }
    setAnswer(bin);
    playEffect(audio, right ? SOUNDS.right : SOUNDS.wrong);
    const where = binLabel(info.bin);
    onAnswer({
      hit: right,
      count,
      announcement: right
        ? many
          ? `Correcto: ${title} van en ${where}. Suman ${info.points * count} puntos.`
          : `Correcto: ${info.name} va en ${where}. Suma ${info.points} puntos.`
        : `No: ${title} ${many ? "van" : "va"} en ${where}.`,
    });
  };

  const advance = () => {
    if (last) {
      onDone({ completed: true, hits: tally.current.hits, total: units, score: tally.current.score });
      return;
    }
    setIndex(index + 1);
    setAnswer(null);
  };

  return (
    <div className="flex flex-col items-start gap-5">
      <span className="eyebrow text-mute">
        Clasificación · {index + 1} de {groups.length}
      </span>
      <div data-testid="review-item" data-item-id={group.type} data-count={count} data-item-ids={group.ids.join(" ")} className="flex items-center gap-4">
        {!missing.has(group.type) && (
          // A small sprite from the game's assetBase, as is: next/image would add its optimizer route for nothing.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={group.type}
            data-testid="review-sprite"
            src={`${assetBase}trash-${group.type}.webp`}
            width={72}
            height={72}
            alt=""
            className="block h-[72px] w-[72px] flex-none"
            onError={() => setMissing((prev) => new Set(prev).add(group.type))}
          />
        )}
        <div className="flex flex-col gap-1">
          <h4 className="title-display m-0 text-[clamp(24px,3vw,34px)] leading-none text-head">{title}</h4>
          <p className="m-0 text-[17px] leading-snug text-mute">{many ? "¿En qué contenedor van?" : "¿En qué contenedor va?"}</p>
        </div>
      </div>
      <div className="grid w-full max-w-[640px] grid-cols-2 gap-3">
        {BINS.map((bin) => {
          const chosen = answer === bin.id;
          const correct = answer !== null && bin.id === info.bin;
          return (
            <button
              key={bin.id}
              type="button"
              data-testid={`review-option-${bin.id}`}
              disabled={answer !== null}
              onClick={() => choose(bin.id)}
              className={`flex min-h-14 items-center gap-3 rounded-[10px] border px-4 py-3 text-left text-[15px] font-medium transition-colors ${
                correct ? "border-mint text-head" : chosen ? "border-orange text-head" : "border-rule text-fg"
              } bg-transparent disabled:cursor-default`}
            >
              <BinIcon bin={bin.id} />
              {bin.label}
            </button>
          );
        })}
      </div>
      {answer !== null && (
        <>
          <p data-testid="review-feedback" className="m-0 max-w-[60ch] text-[17px] leading-snug">
            <strong className={hit ? "text-mint" : "text-orange"}>{hit ? `¡Bien! +${info.points * count} puntos.` : `${many ? "Van" : "Va"} en ${binLabel(info.bin)}.`}</strong> {hit ? info.correct : info.wrong}
          </p>
          <button
            ref={next}
            type="button"
            data-testid="review-next"
            onClick={advance}
            className="flex h-11 items-center rounded-[10px] border-0 bg-btn px-5 text-[15px] font-medium text-btn-fg"
          >
            {last ? "Ver resultado" : "Siguiente"}
          </button>
        </>
      )}
    </div>
  );
}

// The four bins, drawn like the landing's Icon.tsx: 24 grid, 1.7 stroke, round joins.
function BinIcon({ bin }: { bin: BinId }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="block flex-none">
      {bin === "recyclable" && (
        <>
          <path {...common} d="M7.5 9.5 10 5.2a2.3 2.3 0 0 1 4 0l1.6 2.8" />
          <path {...common} d="m13.4 7.9 2.2.1 1.1-1.9" />
          <path {...common} d="M18.2 12.2 20.6 16.5a2.3 2.3 0 0 1-2 3.5h-3.1" />
          <path {...common} d="m16.6 18.2-1.1 1.8 1.2 1.9" />
          <path {...common} d="M9 20H5.4a2.3 2.3 0 0 1-2-3.5L5 13.7" />
          <path {...common} d="m3.9 14.6 1.1-1.9 2.2.1" />
        </>
      )}
      {bin === "organic" && (
        <>
          <path {...common} d="M5 19C5 10.5 11 5 19.5 4.5 19.5 13 14 19 5 19Z" />
          <path {...common} d="M5 19 13 11" />
        </>
      )}
      {bin === "general" && (
        <>
          <path {...common} d="M4 6.5h16" />
          <path {...common} d="M9.5 6.5V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.7" />
          <path {...common} d="M6 6.5h12l-1 13a1.5 1.5 0 0 1-1.5 1.4h-7A1.5 1.5 0 0 1 7 19.5Z" />
        </>
      )}
      {bin === "special" && (
        <>
          <rect {...common} x="7" y="5.5" width="10" height="15" rx="1.8" />
          <path {...common} d="M10 3.5h4" />
          <path {...common} d="M12.8 9.5 10.8 13h2.6l-2 3.5" />
        </>
      )}
    </svg>
  );
}
