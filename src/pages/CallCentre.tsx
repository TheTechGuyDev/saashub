import { useState } from "react";
import { Phone, Users, Clock, PhoneIncoming, PhoneOutgoing, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCallLogs } from "@/hooks/useCallLogs";
import { useEmployees } from "@/hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  id: string;
  name: string;
  status: "available" | "on_call" | "break" | "offline";
  callsHandled: number;
}

export default function CallCentre() {
  const { callLogs } = useCallLogs();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);

  // Calculate real stats from call logs
  const todayLogs = callLogs.filter(log => {
    const today = new Date();
    const logDate = new Date(log.called_at);
    return logDate.toDateString() === today.toDateString();
  });

  const inboundToday = todayLogs.filter(log => log.direction === 'inbound').length;
  const outboundToday = todayLogs.filter(log => log.direction === 'outbound').length;
  const totalDuration = todayLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const avgDuration = todayLogs.length > 0 ? Math.round(totalDuration / todayLogs.length) : 0;

  const availableAgents = agents.filter(a => a.status === "available").length;
  const onCallAgents = agents.filter(a => a.status === "on_call").length;

  const getStatusBadge = (status: Agent["status"]) => {
    switch (status) {
      case "available":
        return <Badge className="bg-success/10 text-success">Available</Badge>;
      case "on_call":
        return <Badge className="bg-warning/10 text-warning">On Call</Badge>;
      case "break":
        return <Badge className="bg-info/10 text-info">On Break</Badge>;
      case "offline":
        return <Badge variant="secondary">Offline</Badge>;
    }
  };

  const handleAddAgent = () => {
    if (!selectedEmployee) return;
    const employee = employees.find(e => e.id === selectedEmployee);
    if (!employee) return;
    if (agents.find(a => a.id === employee.id)) {
      toast({ variant: "destructive", title: "Agent already exists" });
      return;
    }
    setAgents(prev => [...prev, {
      id: employee.id,
      name: employee.full_name,
      status: "available",
      callsHandled: 0,
    }]);
    toast({ title: "Agent added successfully" });
    setShowAddAgent(false);
    setSelectedEmployee("");
  };

  const toggleAgentStatus = (agentId: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a;
      const newStatus = a.status === "available" ? "break" :
                       a.status === "break" ? "offline" :
                       a.status === "offline" ? "available" : a.status;
      return { ...a, status: newStatus };
    }));
  };

  return (
    <div>
      <PageHeader
        title="Call Centre"
        description="Manage call agents and monitor call activity."
        icon={Phone}
        action={{
          label: "Add Agent",
          onClick: () => setShowAddAgent(true),
        }}
      />

      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <PhoneIncoming className="h-4 w-4 inline mr-1" />
              Inbound Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{inboundToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <PhoneOutgoing className="h-4 w-4 inline mr-1" />
              Outbound Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{outboundToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agents Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{availableAgents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{onCallAgents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(avgDuration / 60)}:{(avgDuration % 60).toString().padStart(2, '0')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Call Centre Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{agent.callsHandled} calls handled</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(agent.status)}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleAgentStatus(agent.id)}
                      disabled={agent.status === "on_call"}
                    >
                      Toggle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No agents added yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add employees as call centre agents to start managing calls.
              </p>
              <Button className="mt-4" onClick={() => setShowAddAgent(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Agent Dialog */}
      <Dialog open={showAddAgent} onOpenChange={setShowAddAgent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Call Centre Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Select Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(e => !agents.find(a => a.id === e.id))
                    .map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.position || 'Staff'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {employees.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No employees found. Add employees in Staff Management first.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddAgent(false)}>Cancel</Button>
              <Button onClick={handleAddAgent} disabled={!selectedEmployee}>Add Agent</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
