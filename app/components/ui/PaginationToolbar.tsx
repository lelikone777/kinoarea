import { Button } from "./Button";

type PaginationToolbarProps = {
  isLoading: boolean;
  page: number;
  totalPages: number;
  pageInput: string;
  leftPages: number;
  rightPages: number;
  onPageInputChange: (value: string) => void;
  onGoToPage: (targetPage: number) => void;
  onSubmitPage: () => void;
  label?: string;
  goToLabel?: string;
  pageInputAria?: string;
};

export function PaginationToolbar({
  isLoading,
  page,
  totalPages,
  pageInput,
  leftPages,
  rightPages,
  onPageInputChange,
  onGoToPage,
  onSubmitPage,
  label = "Страницы",
  goToLabel = "Перейти",
  pageInputAria = "Номер страницы",
}: PaginationToolbarProps) {
  return (
    <div className="ml-auto flex w-full max-w-2xl flex-wrap items-center justify-end gap-2 rounded-2xl border border-white/10 bg-slate-900/60 p-2 text-sm text-slate-200">
      <span className="px-2 text-xs uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <span className="rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-300">← {leftPages}</span>

      <Button variant="smallOutline" onClick={() => onGoToPage(page - 10)} disabled={isLoading || page <= 1}>
        -10
      </Button>
      <Button variant="smallOutline" onClick={() => onGoToPage(page - 1)} disabled={isLoading || page <= 1}>
        ←
      </Button>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmitPage();
        }}
        className="flex items-center gap-2"
      >
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={pageInput}
          onChange={(event) => onPageInputChange(event.target.value.replace(/[^\d]/g, ""))}
          className="w-20 rounded-lg border border-white/15 bg-slate-950/80 px-2 py-1.5 text-center text-sm text-white outline-none transition focus:border-sky-300/60"
          aria-label={pageInputAria}
        />
        <Button variant="smallSolid" type="submit" disabled={isLoading}>
          {goToLabel}
        </Button>
      </form>

      <span className="px-1 text-xs text-slate-400">/ {totalPages}</span>
      <Button variant="smallOutline" onClick={() => onGoToPage(page + 1)} disabled={isLoading || page >= totalPages}>
        →
      </Button>
      <Button variant="smallOutline" onClick={() => onGoToPage(page + 10)} disabled={isLoading || page >= totalPages}>
        +10
      </Button>
      <span className="rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-300">{rightPages} →</span>
    </div>
  );
}
