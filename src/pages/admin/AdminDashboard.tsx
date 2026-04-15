import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { AdminSidebar } from "@/components/ui/admin-sidebar";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Total Revenue",
      value: "$125,432",
      change: "+8.3%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      title: "Active Trades",
      value: "5,678",
      change: "+15.2%",
      trend: "up",
      icon: Activity,
      color: "text-purple-500"
    },
    {
      title: "Success Rate",
      value: "87.5%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-primary"
    }
  ];

  const recentTrades = [
    { id: 1, user: "John Doe", pair: "BTC/USDT", type: "LONG", amount: "$5,000", status: "success", time: "2 mins ago" },
    { id: 2, user: "Jane Smith", pair: "ETH/USDT", type: "SHORT", amount: "$3,200", status: "success", time: "5 mins ago" },
    { id: 3, user: "Bob Johnson", pair: "SOL/USDT", type: "LONG", amount: "$2,500", status: "success", time: "12 mins ago" },
    { id: 4, user: "Alice Brown", pair: "ADA/USDT", type: "SHORT", amount: "$1,800", status: "pending", time: "15 mins ago" },
    { id: 5, user: "Charlie Wilson", pair: "DOT/USDT", type: "LONG", amount: "$4,100", status: "success", time: "18 mins ago" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-border/50 backdrop-blur-md bg-background/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <LayoutDashboard className="w-6 h-6 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">System overview and analytics</p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center gap-1 text-xs mt-1">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-primary" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      )}
                      <span className={stat.trend === "up" ? "text-primary" : "text-destructive"}>
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Trades */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        trade.type === 'LONG' ? 'bg-primary/10' : 'bg-orange-500/10'
                      }`}>
                        {trade.type === 'LONG' ? (
                          <ArrowUpRight className="w-5 h-5 text-primary" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{trade.user}</div>
                        <div className="text-sm text-muted-foreground">{trade.pair} • {trade.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">{trade.amount}</div>
                      <div className="text-sm text-muted-foreground">{trade.time}</div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trade.status === 'success' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {trade.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
