import { useState } from "react";
import { Phone, Headphones, Users, Clock, PhoneIncoming, PhoneOutgoing, PhoneMissed, Plus, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCallLogs } from "@/hooks/useCallLogs";
import { useEmployees } from "@/hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  id: string;
  name: string;
  status: "available" | "on_call" | "break" | "offline";
  currentCall?: string;
  callsHandled: number;
}

interface QueuedCall {
  id: string;
  callerName: string;
  callerPhone: string;
  waitTime: number;
  priority: "normal" | "high";
}

export default function CallCentre() {
  const { callLogs } = useCallLogs();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  
  // Mock agents data (in production, would be stored in database)
  const [agents, setAgents] = useState<Agent[]>(() => 
    employees.slice(0, 4).map((emp, idx) => ({
      id: emp.id,
      name: emp.full_name,
      status: idx === 0 ? "on_call" : idx === 1 ? "available" : "offline",
      currentCall: idx === 0 ? "Customer Support Call" : undefined,
      callsHandled: Math.floor(Math.random() * 20) + 5,
    }))
  );

  // Mock queued calls
  const [queuedCalls] = useState<QueuedCall[]>([
    { id: "1", callerName: "John Smith", callerPhone: "+1234567890", waitTime: 45, priority: "normal" },
    { id: "2", callerName: "Jane Doe", callerPhone: "+0987654321", waitTime: 120, priority: "high" },
    { id: "3", callerName: "Bob Wilson", callerPhone: "+1122334455", waitTime: 30, priority: "normal" },
  ]);

  // Calculate stats
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

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <PageHeader
        title="Call Centre"
        description="Manage call queues, agents, and monitor live calls."
        icon={Phone}
        action={{
          label: "Add Agent",
          onClick: () => setShowAddAgent(true),
        }}
      />

      <div className="grid gap-4 md:grid-cols-6 mb-6">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{queuedCalls.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agents Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{availableAgents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On Calls
            </CardTitle>
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Call Centre Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agents.length > 0 ? (
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.currentCall || `${agent.callsHandled} calls handled`}
                        </p>
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
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No agents added yet</p>
                <Button className="mt-4" onClick={() => setShowAddAgent(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Agent
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {queuedCalls.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caller</TableHead>
                    <TableHead>Wait Time</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queuedCalls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{call.callerName}</p>
                          <p className="text-sm text-muted-foreground">{call.callerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatWaitTime(call.waitTime)}</TableCell>
                      <TableCell>
                        <Badge variant={call.priority === "high" ? "destructive" : "secondary"}>
                          {call.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" disabled={availableAgents === 0}>
                          <Phone className="h-4 w-4 mr-1" />
                          Pick Up
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No calls in queue</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Incoming calls will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddAgent(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAgent} disabled={!selectedEmployee}>
                Add Agent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
