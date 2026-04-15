import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, Trash2, Edit, Calendar, Mail, User as UserIcon } from "lucide-react";
import { AdminSidebar } from "@/components/ui/admin-sidebar";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  dateJoined: string;
  totalTrades: number;
  balance: string;
  lastActive: string;
}

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const mockUsers: User[] = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Premium", status: "Active", dateJoined: "2024-01-15", totalTrades: 234, balance: "$25,430", lastActive: "2 hours ago" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Basic", status: "Active", dateJoined: "2024-02-20", totalTrades: 128, balance: "$8,920", lastActive: "5 hours ago" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Premium", status: "Suspended", dateJoined: "2023-12-10", totalTrades: 567, balance: "$45,600", lastActive: "3 days ago" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", role: "Basic", status: "Active", dateJoined: "2024-03-05", totalTrades: 89, balance: "$12,340", lastActive: "1 hour ago" },
    { id: 5, name: "Charlie Wilson", email: "charlie@example.com", role: "Premium", status: "Active", dateJoined: "2023-11-18", totalTrades: 412, balance: "$67,890", lastActive: "30 mins ago" },
    { id: 6, name: "Diana Martinez", email: "diana@example.com", role: "Basic", status: "Active", dateJoined: "2024-01-28", totalTrades: 156, balance: "$9,230", lastActive: "8 hours ago" },
    { id: 7, name: "Edward Lee", email: "edward@example.com", role: "Premium", status: "Inactive", dateJoined: "2023-10-22", totalTrades: 289, balance: "$32,100", lastActive: "1 week ago" },
    { id: 8, name: "Fiona Taylor", email: "fiona@example.com", role: "Basic", status: "Active", dateJoined: "2024-02-12", totalTrades: 73, balance: "$5,670", lastActive: "4 hours ago" },
  ];

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleEdit = (userId: number) => {
    console.log("Edit user:", userId);
    // Add edit functionality
  };

  const handleDelete = (userId: number) => {
    console.log("Delete user:", userId);
    // Add delete functionality
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border/50 backdrop-blur-md bg-background/80 px-6 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            User Management
          </h1>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Search Bar */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filteredUsers.length} users
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleRowClick(user)}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-medium text-foreground">{user.role}</div>
                          <div className="text-xs text-muted-foreground">{user.status}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Joined</div>
                          <div className="text-sm font-medium">{user.dateJoined}</div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(user.id);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(user.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View detailed information about this user</DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-muted-foreground">Role</div>
                  <div className="font-medium">{selectedUser.role}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium">{selectedUser.status}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Date Joined</div>
                  <div className="font-medium">{selectedUser.dateJoined}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Trades</div>
                  <div className="font-medium">{selectedUser.totalTrades}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Balance</div>
                  <div className="font-medium text-primary">{selectedUser.balance}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Last Active</div>
                  <div className="font-medium">{selectedUser.lastActive}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
                <Button variant="destructive" className="flex-1">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
