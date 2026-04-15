import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Wrench, AlertCircle, Settings, Server, Shield } from "lucide-react";
import { AdminSidebar } from "@/components/ui/admin-sidebar";

const ConfigManagement = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [apiEnabled, setApiEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [riskLimits, setRiskLimits] = useState(true);

  const handleMaintenanceToggle = (value: boolean) => {
    // Show confirmation dialog
    if (value) {
      const confirmed = window.confirm("Are you sure you want to enable maintenance mode? This will make the system unavailable to users.");
      if (confirmed) {
        setMaintenanceMode(value);
      }
    } else {
      setMaintenanceMode(value);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border/50 backdrop-blur-md bg-background/80 px-6 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Wrench className="w-6 h-6 text-primary" />
            Configuration Management
          </h1>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Maintenance Mode */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>Manage system-wide settings and maintenance mode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">Maintenance Mode</div>
                      <div className="text-sm text-muted-foreground">
                        Temporarily disable system access for all users
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={handleMaintenanceToggle}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">API Access</div>
                      <div className="text-sm text-muted-foreground">
                        Enable/disable external API access
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={apiEnabled}
                    onCheckedChange={setApiEnabled}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Auto Backup</div>
                      <div className="text-sm text-muted-foreground">
                        Automatic daily backups
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        System alert emails
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="font-medium">Risk Limits</div>
                      <div className="text-sm text-muted-foreground">
                        Enforce trading risk limits
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={riskLimits}
                    onCheckedChange={setRiskLimits}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Backup</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Server Status</span>
                  <span className="font-medium text-green-500">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-medium">99.9%</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigManagement;
