import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign, LineChart, TrendingDown, Target, AlertCircle } from "lucide-react";
import { AdminSidebar } from "@/components/ui/admin-sidebar";

const AdminAnalytics = () => {
  // Mock data for monthly profit ratios - Full year Jan to Dec
  const monthlyProfits = [
    { month: "Jan", net: 5300 },
    { month: "Feb", net: 6400 },
    { month: "Mar", net: -2800 },
    { month: "Apr", net: 8400 },
    { month: "May", net: 11000 },
    { month: "Jun", net: 9300 },
    { month: "Jul", net: -1200 },
    { month: "Aug", net: 7600 },
    { month: "Sep", net: 10200 },
    { month: "Oct", net: 5800 },
    { month: "Nov", net: 9100 },
    { month: "Dec", net: 12800 }
  ];

  // Trading performance metrics
  const tradingMetrics = [
    { label: "Sharpe Ratio", value: "2.85", trend: "+0.32", color: "text-green-500" },
    { label: "Sortino Ratio", value: "3.12", trend: "+0.18", color: "text-green-500" },
    { label: "Win Rate", value: "68.5%", trend: "+5.2%", color: "text-primary" },
    { label: "Risk/Reward", value: "1:2.4", trend: "+0.3", color: "text-green-500" },
    { label: "Max Drawdown", value: "-8.3%", trend: "-2.1%", color: "text-red-500" },
    { label: "Profit Factor", value: "2.18", trend: "+0.24", color: "text-green-500" }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border/50 backdrop-blur-md bg-background/80 px-6 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            Admin Analytics
          </h1>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Trading Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tradingMetrics.map((metric, index) => (
                <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${metric.color}`}>
                      {metric.value}
                    </div>
                    <div className={`text-xs mt-2 ${metric.color.includes('green') ? 'text-primary' : metric.color.includes('red') ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {metric.trend}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Monthly Profit/Loss Bar Chart */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Monthly Profit/Loss Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 relative flex items-center justify-between gap-2">
                  {/* Center baseline */}
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-border"></div>
                  
                  {monthlyProfits.map((month, index) => {
                    const maxValue = Math.max(...monthlyProfits.map(m => Math.abs(m.net)));
                    const isPositive = month.net >= 0;
                    const heightPercent = (Math.abs(month.net) / maxValue) * 50; // Max 50% on either side
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center h-full">
                        {/* Bars grow from center */}
                        <div className="flex flex-col items-center justify-end flex-1 w-full" style={{ paddingTop: `${50 - heightPercent}%` }}>
                          <div 
                            className={`w-full transition-all cursor-pointer ${
                              isPositive 
                                ? 'bg-green-500 hover:bg-green-600 rounded-t' 
                                : 'bg-red-500 hover:bg-red-600 rounded-b'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          >
                            <div className="flex items-center justify-center h-full text-white text-xs font-medium px-1">
                              {isPositive ? '+' : ''}{month.net.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-foreground mt-2">
                          {month.month}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Additional Trading Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Trading Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Hold Time</span>
                    <span className="font-medium">2.5 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Trade Size</span>
                    <span className="font-medium">$4,200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Trades</span>
                    <span className="font-medium">1,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Largest Win</span>
                    <span className="font-medium text-primary">+$12,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Largest Loss</span>
                    <span className="font-medium text-destructive">-$3,200</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Risk Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Volatility</span>
                    <span className="font-medium">12.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Beta</span>
                    <span className="font-medium">0.85</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">VaR (95%)</span>
                    <span className="font-medium">2.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Calmar Ratio</span>
                    <span className="font-medium">3.42</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Expectancy</span>
                    <span className="font-medium text-primary">+$450/trade</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total P&L</div>
                    <div className="text-2xl font-bold text-primary">$48,200</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Average Win</div>
                    <div className="text-2xl font-bold text-green-500">$1,845</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Average Loss</div>
                    <div className="text-2xl font-bold text-red-500">-$842</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">ROI</div>
                    <div className="text-2xl font-bold text-primary">+142.3%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
