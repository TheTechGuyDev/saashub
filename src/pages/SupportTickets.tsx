import { useState } from "react";
import { Ticket, Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTickets, Ticket as TicketType } from "@/hooks/useTickets";
import { TicketDialog } from "@/components/tickets/TicketDialog";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  open: "bg-info/10 text-info border-info/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  waiting: "bg-muted text-muted-foreground",
  resolved: "bg-success/10 text-success border-success/20",
  closed: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
};

export default function SupportTickets() {
  const [showDialog, setShowDialog] = useState(false);
  const [editTicket, setEditTicket] = useState<TicketType | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { tickets, isLoading, updateTicket, deleteTicket } = useTickets();

  const filteredTickets = statusFilter === "all" 
    ? tickets 
    : tickets.filter(t => t.status === statusFilter);

  const handleEdit = (ticket: TicketType) => {
    setEditTicket(ticket);
    setShowDialog(true);
  };

  const handleClose = () => {
    setEditTicket(null);
    setShowDialog(false);
  };

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        description="Manage customer support requests."
        icon={Ticket}
        action={{
          label: "New Ticket",
          onClick: () => setShowDialog(true),
        }}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Tickets ({filteredTickets.length})
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filteredTickets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">
                      {ticket.ticket_number}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {ticket.subject}
                    </TableCell>
                    <TableCell>{ticket.customers?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={priorityColors[ticket.priority]} variant="outline">
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[ticket.status]} variant="outline">
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(ticket)}>
                          View
                        </Button>
                        {ticket.status !== "resolved" && ticket.status !== "closed" && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => updateTicket.mutate({ id: ticket.id, status: "resolved" })}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tickets found.</p>
              <Button className="mt-4" onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TicketDialog
        open={showDialog}
        onOpenChange={handleClose}
        ticket={editTicket}
      />
    </div>
  );
}
