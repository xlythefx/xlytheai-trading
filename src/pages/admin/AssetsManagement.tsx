import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Search, RefreshCcw } from "lucide-react";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { getAssets, type Asset } from "@/lib/api";
import { toast } from "sonner";

const TYPE_COLORS: Record<string, string> = {
  Cryptocurrency: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Stocks:         "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Forex:          "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Commodity:      "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const AssetsManagement = () => {
  const [assets, setAssets]           = useState<Asset[]>([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState("");
  const [typeFilter, setTypeFilter]   = useState("all");

  const load = async (s = search, t = typeFilter) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (s)           params.search = s;
      if (t !== "all") params.type   = t;
      const res = await getAssets(params);
      setAssets(res.assets);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    load(val, typeFilter);
  };

  const handleType = (val: string) => {
    setTypeFilter(val);
    load(search, val);
  };

  const types = Array.from(new Set(assets.map((a) => a.type))).sort();

  const enabledCount  = assets.filter((a) => a.enabled === 1).length;
  const disabledCount = assets.length - enabledCount;

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="border-b border-border/50 backdrop-blur-md bg-background/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Assets</h1>
                <p className="text-xs text-muted-foreground">Trading instruments across all brokers</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
              <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{assets.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Assets</div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-400">{enabledCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Enabled</div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-muted-foreground">{disabledCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Disabled</div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-base">All Assets</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search ticker, type, broker…"
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-8 h-9 w-56"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={handleType}>
                    <SelectTrigger className="h-9 w-40">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {types.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-16 text-center text-muted-foreground text-sm">Loading…</div>
              ) : assets.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm">No assets found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead className="text-right">Base Size</TableHead>
                      <TableHead className="text-right">Max Increments</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-mono font-semibold">{asset.ticker}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={TYPE_COLORS[asset.type] ?? "bg-muted/30 text-muted-foreground"}
                          >
                            {asset.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{asset.broker}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {parseFloat(asset.base_size).toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 8,
                          })}
                        </TableCell>
                        <TableCell className="text-right">{asset.max_increments}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              asset.enabled === 1
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-muted/30 text-muted-foreground"
                            }
                          >
                            {asset.enabled === 1 ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AssetsManagement;
