import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Layers, Loader2, RefreshCcw, Search } from "lucide-react";
import { getAssets, type Asset } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TYPE_STYLES: Record<string, string> = {
  Cryptocurrency: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Stocks: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Forex: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Commodity: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const SupportedAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAssets(search ? { search } : undefined);
      setAssets(res.assets ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load assets";
      toast.error(msg);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = assets.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.ticker.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.broker.toLowerCase().includes(q)
    );
  });

  const enabledCount = filtered.filter((a) => a.enabled === 1).length;

  return (
    <div className="flex min-h-min flex-col">
      <nav className="shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Supported Assets</h1>
              <p className="text-muted-foreground">
                Instruments available for signals and automation
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </nav>

      <main className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ticker, type, or broker…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {enabledCount} enabled · {filtered.length} shown
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Asset list</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">No assets match your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead className="text-right">Max increments</TableHead>
                      <TableHead className="text-right">Base size</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.ticker}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={TYPE_STYLES[a.type] ?? "border-border/60"}
                          >
                            {a.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{a.broker}</TableCell>
                        <TableCell className="text-right tabular-nums">{a.max_increments}</TableCell>
                        <TableCell className="text-right tabular-nums">{a.base_size}</TableCell>
                        <TableCell>
                          {a.enabled === 1 ? (
                            <Badge className="bg-primary/15 text-primary">Enabled</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SupportedAssets;
