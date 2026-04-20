import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  getAdminPositionsClosed,
  getAdminPositionsOpen,
  type AdminClosedPositionRow,
  type AdminOpenPositionRow,
} from "@/lib/api";
import { fmt } from "@/components/trading/TradingDashboardWidgets";
import { cn } from "@/lib/utils";

const PER = 10;

const AdminPositions = () => {
  const { adminCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "open" ? "open" : "closed";

  const [closedPage, setClosedPage] = useState(1);
  const [openPage, setOpenPage] = useState(1);
  const [closed, setClosed] = useState<AdminClosedPositionRow[]>([]);
  const [openRows, setOpenRows] = useState<AdminOpenPositionRow[]>([]);
  const [closedLast, setClosedLast] = useState(1);
  const [openLast, setOpenLast] = useState(1);
  const [closedTotal, setClosedTotal] = useState(0);
  const [openTotal, setOpenTotal] = useState(0);
  const [loadingClosed, setLoadingClosed] = useState(true);
  const [loadingOpen, setLoadingOpen] = useState(true);

  const loadClosed = useCallback(async (page: number) => {
    setLoadingClosed(true);
    try {
      const res = await getAdminPositionsClosed({ page, per_page: PER });
      setClosed(res.data);
      setClosedLast(res.last_page);
      setClosedTotal(res.total);
    } catch {
      toast.error("Failed to load closed positions");
      setClosed([]);
    } finally {
      setLoadingClosed(false);
    }
  }, []);

  const loadOpen = useCallback(async (page: number) => {
    setLoadingOpen(true);
    try {
      const res = await getAdminPositionsOpen({ page, per_page: PER });
      setOpenRows(res.data);
      setOpenLast(res.last_page);
      setOpenTotal(res.total);
    } catch {
      toast.error("Failed to load open positions");
      setOpenRows([]);
    } finally {
      setLoadingOpen(false);
    }
  }, []);

  useEffect(() => {
    loadClosed(closedPage);
  }, [closedPage, loadClosed]);

  useEffect(() => {
    loadOpen(openPage);
  }, [openPage, loadOpen]);

  const setTab = (v: string) => {
    setSearchParams(v === "open" ? { tab: "open" } : {});
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Layers className="h-6 w-6 text-primary" />
              Positions
            </h1>
            <p className="text-sm text-muted-foreground">
              All closed trades and live positions across the platform ({PER} per page)
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/${adminCode}/dashboard`}>← Analytics dashboard</Link>
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl p-6">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="closed">Closed ({closedTotal})</TabsTrigger>
            <TabsTrigger value="open">Open ({openTotal})</TabsTrigger>
          </TabsList>

          <TabsContent value="closed">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Closed positions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingClosed ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-md border border-border/40">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Closed</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Side</TableHead>
                            <TableHead className="text-right">Realized</TableHead>
                            <TableHead className="hidden lg:table-cell">Strategy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {closed.map((r) => {
                            const pnl = parseFloat(r.realized_pnl) || 0;
                            return (
                              <TableRow key={r.id}>
                                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                                  {r.closed_at ? format(new Date(r.closed_at), "yyyy-MM-dd HH:mm") : "—"}
                                </TableCell>
                                <TableCell className="max-w-[140px] truncate">{r.user_name ?? "—"}</TableCell>
                                <TableCell className="max-w-[120px] truncate text-muted-foreground">
                                  {r.account_name ?? "—"}
                                </TableCell>
                                <TableCell className="font-mono text-sm">{r.symbol}</TableCell>
                                <TableCell>
                                  <span
                                    className={cn(
                                      "rounded-md px-2 py-0.5 text-xs font-medium",
                                      r.position_side?.toUpperCase() === "LONG"
                                        ? "bg-primary/15 text-primary"
                                        : "bg-orange-500/15 text-orange-400",
                                    )}
                                  >
                                    {r.position_side}
                                  </span>
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-right font-mono font-semibold",
                                    pnl >= 0 ? "text-emerald-500" : "text-red-400",
                                  )}
                                >
                                  ${fmt(r.realized_pnl)}
                                </TableCell>
                                <TableCell className="hidden max-w-[160px] truncate text-muted-foreground lg:table-cell">
                                  {r.strategy ?? "—"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <PageNav
                      page={closedPage}
                      lastPage={closedLast}
                      onPrev={() => setClosedPage((p) => Math.max(1, p - 1))}
                      onNext={() => setClosedPage((p) => Math.min(closedLast, p + 1))}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="open">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Open positions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingOpen ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-md border border-border/40">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Updated</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Side</TableHead>
                            <TableHead className="text-right">uPnL</TableHead>
                            <TableHead className="text-right hidden md:table-cell">Notional</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {openRows.map((r) => {
                            const upnl = parseFloat(r.unrealized_profit) || 0;
                            const amt = parseFloat(r.position_amt) || 0;
                            const long = amt >= 0;
                            return (
                              <TableRow key={r.id}>
                                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                                  {r.update_time
                                    ? format(
                                        new Date(r.update_time < 1e12 ? r.update_time * 1000 : r.update_time),
                                        "yyyy-MM-dd HH:mm",
                                      )
                                    : "—"}
                                </TableCell>
                                <TableCell className="max-w-[140px] truncate">{r.user_name ?? "—"}</TableCell>
                                <TableCell className="max-w-[120px] truncate text-muted-foreground">
                                  {r.account_name ?? "—"}
                                </TableCell>
                                <TableCell className="font-mono text-sm">{r.symbol}</TableCell>
                                <TableCell>
                                  <span
                                    className={cn(
                                      "rounded-md px-2 py-0.5 text-xs font-medium",
                                      long ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive",
                                    )}
                                  >
                                    {long ? "Long" : "Short"}
                                  </span>
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-right font-mono font-semibold",
                                    upnl >= 0 ? "text-emerald-500" : "text-red-400",
                                  )}
                                >
                                  ${fmt(r.unrealized_profit)}
                                </TableCell>
                                <TableCell className="hidden text-right font-mono text-muted-foreground md:table-cell">
                                  ${fmt(r.notional)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <PageNav
                      page={openPage}
                      lastPage={openLast}
                      onPrev={() => setOpenPage((p) => Math.max(1, p - 1))}
                      onNext={() => setOpenPage((p) => Math.min(openLast, p + 1))}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

function PageNav({
  page,
  lastPage,
  onPrev,
  onNext,
}: {
  page: number;
  lastPage: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {Math.max(1, lastPage)}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={onPrev}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Prev
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={page >= lastPage} onClick={onNext}>
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default AdminPositions;
