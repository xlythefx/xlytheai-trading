import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Calendar, Download, Search, TrendingUp, TrendingDown, User, Shield } from "lucide-react";
import { AdminSidebar } from "@/components/ui/admin-sidebar";

interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  user: string;
  type: string;
  details: string;
  status: string;
}

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const mockLogs: AuditLog[] = [
    { id: 1, timestamp: "2024-10-27 14:32:15", action: "Trade Opened", user: "John Doe", type: "trade", details: "BTC/USDT LONG opened at $43,250", status: "success" },
    { id: 2, timestamp: "2024-10-27 14:30:08", action: "Trade Closed", user: "Jane Smith", type: "trade", details: "ETH/USDT SHORT closed at $2,280, Profit: +$1,200", status: "success" },
    { id: 3, timestamp: "2024-10-27 14:28:45", action: "User Registered", user: "System", type: "user", details: "New user 'alice@example.com' registered", status: "info" },
    { id: 4, timestamp: "2024-10-27 14:25:12", action: "Trade Opened", user: "Bob Johnson", type: "trade", details: "SOL/USDT LONG opened at $98.50", status: "success" },
    { id: 5, timestamp: "2024-10-27 14:22:33", action: "Password Changed", user: "Admin", type: "security", details: "Admin password updated", status: "warning" },
    { id: 6, timestamp: "2024-10-27 14:20:10", action: "Trade Closed", user: "Alice Brown", type: "trade", details: "ADA/USDT LONG closed at $0.47, Profit: +$850", status: "success" },
    { id: 7, timestamp: "2024-10-27 14:18:05", action: "User Suspended", user: "Admin", type: "admin", details: "User 'charlie@example.com' suspended", status: "error" },
    { id: 8, timestamp: "2024-10-27 14:15:42", action: "Trade Opened", user: "Charlie Wilson", type: "trade", details: "DOT/USDT SHORT opened at $6.80", status: "success" },
    { id: 9, timestamp: "2024-10-27 14:12:28", action: "API Key Generated", user: "Admin", type: "admin", details: "New API key created for external access", status: "info" },
    { id: 10, timestamp: "2024-10-27 14:10:15", action: "Trade Closed", user: "Diana Martinez", type: "trade", details: "BTC/USDT LONG closed at $44,180, Profit: +$2,340", status: "success" },
    { id: 11, timestamp: "2024-10-27 14:08:50", action: "Maintenance Mode Toggled", user: "Admin", type: "admin", details: "Maintenance mode enabled", status: "warning" },
    { id: 12, timestamp: "2024-10-27 14:05:32", action: "Trade Opened", user: "Edward Lee", type: "trade", details: "ETH/USDT LONG opened at $2,250", status: "success" },
    { id: 13, timestamp: "2024-10-27 14:03:18", action: "Payment Processed", user: "Fiona Taylor", type: "payment", details: "Premium subscription payment received: $49.99", status: "success" },
    { id: 14, timestamp: "2024-10-27 14:00:45", action: "Trade Closed", user: "John Doe", type: "trade", details: "SOL/USDT LONG closed at $95.20, Loss: -$280", status: "error" },
    { id: 15, timestamp: "2024-10-27 13:58:22", action: "Backup Completed", user: "System", type: "system", details: "Daily backup completed successfully", status: "info" },
  ];

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || log.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "error":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "warning":
        return <Shield className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "warning":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "trade":
        return "text-primary";
      case "user":
        return "text-blue-500";
      case "security":
        return "text-yellow-500";
      case "admin":
        return "text-purple-500";
      case "payment":
        return "text-green-500";
      case "system":
        return "text-gray-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border/50 backdrop-blur-md bg-background/80 px-6 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            Audit Logs
          </h1>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Filters and Search */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex gap-4 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search logs..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="trade">Trades</option>
                    <option value="user">Users</option>
                    <option value="security">Security</option>
                    <option value="admin">Admin</option>
                    <option value="payment">Payments</option>
                    <option value="system">System</option>
                  </select>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Export Logs
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Audit Logs List */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>System Audit Logs</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {filteredLogs.length} logs
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          {getStatusIcon(log.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{log.action}</span>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full border border-border/50 ${getTypeColor(log.type)}`}>
                              {log.type}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">{log.user}</span>
                            {" • "}
                            {log.details}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                        {log.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
