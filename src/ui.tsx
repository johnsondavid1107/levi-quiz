import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';

/** A sign framed in light bulbs. The lit rect steps along the dim one to make the chase. */
export function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="marquee">
      <svg className="marquee-bulbs" aria-hidden="true">
        <rect className="bulbs-dim" width="100%" height="100%" rx="16" pathLength={120} />
        <rect className="bulbs-lit" width="100%" height="100%" rx="16" pathLength={120} />
      </svg>
      <div className="marquee-inner">{children}</div>
    </div>
  );
}

/** Native modal dialog: the browser supplies the focus trap, Escape, and focus return. */
export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-body">
        <h2 id={titleId} className="dialog-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

export function QuestionGrid({
  answers,
  current,
  onPick,
}: {
  answers: (number | null)[];
  current?: number;
  onPick: (index: number) => void;
}) {
  return (
    <div className="grid">
      {answers.map((answer, i) => {
        const answered = answer !== null;
        return (
          <button
            key={i}
            type="button"
            className={`grid-cell${answered ? ' is-answered' : ''}${i === current ? ' is-current' : ''}`}
            aria-label={`Question ${i + 1}, ${answered ? 'answered' : 'not answered'}`}
            aria-current={i === current ? 'true' : undefined}
            onClick={() => onPick(i)}
          >
            {i + 1}
            {answered && <span className="grid-check" aria-hidden="true">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

export function StorageNotice() {
  return (
    <p className="notice" role="status">
      This browser isn’t saving your progress. Keep this page open until you finish, because a
      refresh could lose your answers.
    </p>
  );
}
