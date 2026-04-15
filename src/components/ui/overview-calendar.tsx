import { useCallback, useEffect, useMemo, useState } from "react";
import { format, startOfMonth } from "date-fns";
import type { DayContentProps } from "react-day-picker";
import { CalendarDays, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { buttonVariants } from "@/components/ui/button";
import { getPastPositionsDailyPnl, getToken } from "@/lib/api";
import { cn } from "@/lib/utils";

type OverviewCalendarProps = {
  className?: string;
};

function formatCompactPnl(value: number): string {
  const abs = Math.abs(value);
  const sign = value >= 0 ? "+" : "−";
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}k`;
  if (abs >= 100) return `${sign}${abs.toFixed(0)}`;
  return `${sign}${abs.toFixed(1)}`;
}

export function OverviewCalendar({ className }: OverviewCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date | undefined>(() => new Date());
  const [pnlByDay, setPnlByDay] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (m: Date) => {
    if (!getToken()) {
      setPnlByDay({});
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getPastPositionsDailyPnl({
        year: m.getFullYear(),
        month: m.getMonth() + 1,
      });
      const next: Record<string, number> = {};
      for (const row of res.data) {
        next[row.date] = parseFloat(row.total_pnl);
      }
      setPnlByDay(next);
    } catch {
      setPnlByDay({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(month);
  }, [month, load]);

  const DayContent = useMemo(() => {
    function DayCell(props: DayContentProps) {
      const key = format(props.date, "yyyy-MM-dd");
      const pnl = pnlByDay[key];
      const outside = props.activeModifiers.outside;
      const hasPnl = pnl !== undefined && !Number.isNaN(pnl);

      return (
        <div
          className={cn(
            "flex h-full min-h-[4.5rem] w-full flex-col rounded-lg border p-2 text-left sm:min-h-[5.25rem] sm:p-2.5",
            outside &&
              "border-dashed border-border/50 bg-muted/5 opacity-70 dark:bg-muted/10",
            !outside && !hasPnl && "border-border/60 bg-background/60 dark:bg-background/40",
            hasPnl && pnl > 0 && "border-emerald-500/35 bg-emerald-500/[0.12] dark:bg-emerald-500/15",
            hasPnl && pnl < 0 && "border-red-500/35 bg-red-500/[0.12] dark:bg-red-500/15",
          )}
        >
          <span
            className={cn(
              "text-sm font-semibold tabular-nums sm:text-base",
              outside && "text-muted-foreground",
            )}
          >
            {props.date.getDate()}
          </span>
          <div className="mt-auto min-h-[1.1rem] pt-1">
            {hasPnl ? (
              <span
                className={cn(
                  "text-[11px] font-bold tabular-nums sm:text-xs",
                  pnl >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                ${formatCompactPnl(pnl)}
              </span>
            ) : (
              !outside && (
                <span className="text-[11px] text-muted-foreground sm:text-xs">—</span>
              )
            )}
          </div>
        </div>
      );
    }
    return DayCell;
  }, [pnlByDay]);

  return (
    <Card
      className={cn(
        "flex h-full min-h-[28rem] min-w-0 flex-1 flex-col border-border/50 bg-card/50 backdrop-blur-sm sm:min-h-[32rem] lg:min-h-0",
        className,
      )}
    >
      <CardHeader className="shrink-0 space-y-1 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
            <CalendarDays className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            Daily P&amp;L Calendar
          </CardTitle>
          {loading && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
          )}
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Recent performance snapshot by day · closed Binance positions (realized PnL)
        </p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-2 pb-4 pt-0 sm:px-4">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={(d) => setMonth(startOfMonth(d))}
          selected={selected}
          onSelect={setSelected}
          components={{ DayContent }}
          formatters={{
            formatCaption: (date) => format(date, "MMMM yyyy"),
          }}
          className="w-full max-w-none flex-1 p-0 sm:p-1"
          classNames={{
            months: "flex w-full max-w-none flex-1 flex-col",
            month: "w-full max-w-none flex-1 space-y-3",
            caption:
              "relative mb-3 flex min-h-12 w-full items-center justify-center px-1 py-2 sm:min-h-14",
            caption_label:
              "relative z-[1] w-full text-center text-base font-semibold sm:text-lg",
            nav: "pointer-events-none absolute inset-0 flex items-center justify-between gap-2",
            nav_button: cn(
              buttonVariants({ variant: "outline" }),
              "pointer-events-auto h-9 w-9 shrink-0 bg-transparent p-0 opacity-80 hover:opacity-100 sm:h-10 sm:w-10",
            ),
            nav_button_previous:
              "static left-auto top-auto z-[2] -translate-y-0 shadow-sm",
            nav_button_next:
              "static right-auto top-auto z-[2] -translate-y-0 shadow-sm",
            table: "w-full max-w-none border-collapse",
            head_row: "mb-1 flex w-full gap-1.5 sm:gap-2",
            head_cell:
              "text-muted-foreground flex min-w-0 flex-1 justify-center rounded-md py-2 text-center text-[0.65rem] font-semibold uppercase tracking-wide sm:text-xs",
            row: "mt-0 flex w-full gap-1.5 sm:gap-2",
            cell: cn(
              "relative flex min-h-0 min-w-0 flex-1 p-0 text-center",
              "[&:has([aria-selected])]:bg-transparent",
            ),
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "h-full min-h-0 w-full max-w-none rounded-lg p-0 font-normal shadow-none",
              "flex flex-col items-stretch justify-stretch",
              "hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring",
              "aria-selected:opacity-100 data-[selected=true]:bg-transparent data-[selected=true]:text-foreground",
            ),
            day_selected:
              "ring-2 ring-primary ring-offset-2 ring-offset-background data-[selected=true]:bg-transparent",
            day_today: "bg-transparent text-foreground",
            day_outside: "opacity-100",
          }}
        />
      </CardContent>
    </Card>
  );
}
