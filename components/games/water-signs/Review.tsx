"use client";

import { useEffect, useRef, useState } from "react";
import type { ReviewProps } from "@/lib/games/contract";
import { TOTAL, type ObservationSummary } from "@/lib/games/water-signs/rules";
import { QUESTION } from "@/lib/games/water-signs/meta";

// Phase 3 of water-signs, "El rastro" (specification): one question about where all of it came from. It cannot be
// skipped, it does not score (meta.hitsFrom "game"), and the explanation is always shown, with a heading that never
// says right or wrong. The result is exactly what the observation found. Loaded by GameStage after onRunEnd (its own
// chunk, no Phaser). Test interface (E1): review-item (data-item-id = QUESTION.id), review-option-<id>,
// review-feedback, review-next ("Ver resultado").

const resultOf = (summary: unknown) => {
  const s = (summary ?? {}) as Partial<ObservationSummary>;
  const count = (n: unknown) => (typeof n === "number" && Number.isInteger(n) && n >= 0 ? n : 0);
  return { completed: true, hits: count(s.hits), total: TOTAL, score: count(s.score) };
};

const feedbackOf = (option: string) => ({
  heading: option === QUESTION.answer ? QUESTION.heading.right : QUESTION.heading.wrong,
  explanation: QUESTION.explanation,
});

export function Review({ summary, onAnswer, onDone }: ReviewProps) {
  const [result] = useState(() => resultOf(summary));
  const [answer, setAnswer] = useState<string | null>(null);
  const next = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (answer !== null) next.current?.focus();
  }, [answer]);

  const choose = (option: string) => {
    if (answer !== null) return;
    setAnswer(option);
    const { heading, explanation } = feedbackOf(option);
    onAnswer({ hit: option === QUESTION.answer, announcement: `${heading}. ${explanation}` });
  };

  const feedback = answer === null ? null : feedbackOf(answer);

  return (
    <div className="flex flex-col items-start gap-5">
      <span className="eyebrow text-mute">El rastro</span>
      <div data-testid="review-item" data-item-id={QUESTION.id}>
        <h4 className="title-display m-0 text-[clamp(24px,3vw,34px)] leading-none text-head">{QUESTION.title}</h4>
      </div>
      <div className="flex w-full max-w-[640px] flex-col gap-3">
        {QUESTION.options.map((option) => (
          <button
            key={option.id}
            type="button"
            data-testid={`review-option-${option.id}`}
            disabled={answer !== null}
            onClick={() => choose(option.id)}
            className={`flex min-h-12 items-center rounded-[10px] border bg-transparent px-4 py-3 text-left text-[15px] font-medium transition-colors disabled:cursor-default ${
              answer === option.id ? "border-head text-head" : "border-rule text-fg"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {feedback && (
        <>
          <p data-testid="review-feedback" className="m-0 max-w-[60ch] text-[17px] leading-snug">
            <strong className="text-head">{feedback.heading}.</strong> {feedback.explanation}
          </p>
          <button
            ref={next}
            type="button"
            data-testid="review-next"
            onClick={() => onDone(result)}
            className="flex h-11 items-center rounded-[10px] border-0 bg-btn px-5 text-[15px] font-medium text-btn-fg"
          >
            Ver resultado
          </button>
        </>
      )}
    </div>
  );
}
