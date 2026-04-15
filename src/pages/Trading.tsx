import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  X,
  Zap,
  BarChart3,
  Clock,
  Target,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Trading = () => {
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  
  const activeSignals = [
    {
      id: 1,
      pair: "BTC/USDT",
      type: "LONG",
      entryPrice: "$43,250.00",
      currentPrice: "$44,180.35",
      quantity: "0.5 BTC",
      invested: "$21,625",
      currentValue: "$22,090",
      pnl: "+$465.18",
      pnlPercent: "+2.15%",
      stopLoss: "$42,000",
      takeProfit: "$45,000",
      openedAt: "2 hours ago",
      broker: "Interactive Brokers",
      leverage: "5x",
      status: "active",
      color: "bg-primary/10 text-primary"
    },
    {
      id: 2,
      pair: "ETH/USDT",
      type: "SHORT",
      entryPrice: "$2,280.00",
      currentPrice: "$2,250.40",
      quantity: "2 ETH",
      invested: "$4,560",
      currentValue: "$4,500.80",
      pnl: "+$59.20",
      pnlPercent: "+1.32%",
      stopLoss: "$2,350",
      takeProfit: "$2,100",
      openedAt: "4 hours ago",
      broker: "Capital.com",
      leverage: "3x",
      status: "active",
      color: "bg-orange-500/10 text-orange-500"
    },
    {
      id: 3,
      pair: "SOL/USDT",
      type: "LONG",
      entryPrice: "$98.50",
      currentPrice: "$95.20",
      quantity: "10 SOL",
      invested: "$985",
      currentValue: "$952",
      pnl: "-$33.00",
      pnlPercent: "-3.35%",
      stopLoss: "$92",
      takeProfit: "$110",
      openedAt: "6 hours ago",
      broker: "Trading212",
      leverage: "2x",
      status: "active",
      color: "bg-primary/10 text-primary"
    },
    {
      id: 4,
      pair: "ADA/USDT",
      type: "LONG",
      entryPrice: "$0.45",
      currentPrice: "$0.47",
      quantity: "5,000 ADA",
      invested: "$2,250",
      currentValue: "$2,350",
      pnl: "+$100.00",
      pnlPercent: "+4.44%",
      stopLoss: "$0.42",
      takeProfit: "$0.52",
      openedAt: "8 hours ago",
      broker: "Interactive Brokers",
      leverage: "4x",
      status: "active",
      color: "bg-primary/10 text-primary"
    },
    {
      id: 5,
      pair: "DOT/USDT",
      type: "SHORT",
      entryPrice: "$6.80",
      currentPrice: "$6.50",
      quantity: "100 DOT",
      invested: "$680",
      currentValue: "$650",
      pnl: "+$30.00",
      pnlPercent: "+4.41%",
      stopLoss: "$7.20",
      takeProfit: "$6.00",
      openedAt: "12 hours ago",
      broker: "Capital.com",
      leverage: "3x",
      status: "active",
      color: "bg-orange-500/10 text-orange-500"
    }
  ];

  const totalPnL = activeSignals.reduce((sum, signal) => {
    const pnl = parseFloat(signal.pnl.replace(/[+$,]/g, ''));
    return sum + pnl;
  }, 0);

  const totalInvested = activeSignals.reduce((sum, signal) => {
    return sum + parseFloat(signal.invested.replace(/[$,]/g, ''));
  }, 0);

  const handleAddPosition = () => {
    // This would normally open a modal or form
    setIsAddingPosition(true);
  };

  const handleCancelPosition = (id: number) => {
    // This would normally handle cancellation
    console.log(`Cancel position ${id}`);
  };

  return (
    <div className="flex min-h-min flex-col">
        {/* Top Navigation */}
        <nav className="border-b border-border/50 backdrop-blur-md bg-background/80">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Trading</h1>
                <p className="text-muted-foreground">Active positions and signals</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Activity className="w-4 h-4 mr-2" />
                  View Signals
                </Button>
                <Button size="sm" onClick={handleAddPosition}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Position
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Trading Content */}
        <main className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activeSignals.length} active positions</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">${totalInvested.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all positions</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Positions</CardTitle>
                <Activity className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{activeSignals.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently trading</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
                <Target className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round((activeSignals.filter(s => parseFloat(s.pnl.replace(/[+$,]/g, '')) > 0).length / activeSignals.length) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Winning positions</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Positions */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Active Positions ({activeSignals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="p-4 sm:p-6 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors overflow-x-auto"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-4 items-center min-w-0">
                      {/* Pair & Type */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${signal.color}`}>
                            {signal.type === 'LONG' ? (
                              <ArrowUpRight className="w-6 h-6" />
                            ) : (
                              <ArrowDownRight className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-lg">{signal.pair}</div>
                            <div className="text-sm text-muted-foreground">{signal.type}</div>
                          </div>
                        </div>
                      </div>

                      {/* Entry & Current */}
                      <div className="lg:col-span-2">
                        <div className="text-sm text-muted-foreground mb-1">Entry Price</div>
                        <div className="font-medium">{signal.entryPrice}</div>
                        <div className="text-sm text-muted-foreground mt-1">Current: {signal.currentPrice}</div>
                      </div>

                      {/* Quantity & Value */}
                      <div className="lg:col-span-2">
                        <div className="text-sm text-muted-foreground mb-1">Quantity</div>
                        <div className="font-medium">{signal.quantity}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Value: ${(parseFloat(signal.currentValue.replace(/[$,]/g, '')) / 1000).toFixed(1)}k
                        </div>
                      </div>

                      {/* P&L */}
                      <div className="lg:col-span-2">
                        <div className="text-sm text-muted-foreground mb-1">Profit/Loss</div>
                        <div className={`font-bold text-lg ${parseFloat(signal.pnl.replace(/[+$,]/g, '')) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {signal.pnl}
                        </div>
                        <div className={`text-sm ${parseFloat(signal.pnlPercent.replace(/[+%]/g, '')) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {signal.pnlPercent}
                        </div>
                      </div>

                      {/* Stop Loss & Take Profit */}
                      <div className="lg:col-span-2">
                        <div className="flex flex-col gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Stop Loss</div>
                            <div className="font-medium text-red-500">{signal.stopLoss}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Take Profit</div>
                            <div className="font-medium text-green-500">{signal.takeProfit}</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-2 flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground mb-2">
                          <div>{signal.broker}</div>
                          <div>{signal.leverage} • {signal.openedAt}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                            onClick={() => handleCancelPosition(signal.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
    </div>
  );
};

export default Trading;
