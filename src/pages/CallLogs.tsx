import { useState } from "react";
import { PhoneCall, Plus, Phone, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallLogs } from "@/hooks/useCallLogs";
import { CallLogDialog } from "@/components/calls/CallLogDialog";
import { formatDistanceToNow } from "date-fns";

const outcomeColors: Record<string, string> = {
  answered: "bg-success/10 text-success",
  no_answer: "bg-muted text-muted-foreground",
  busy: "bg-warning/10 text-warning",
  voicemail: "bg-info/10 text-info",
  callback: "bg-accent/10 text-accent",
};

export default function CallLogs() {
  const [showDialog, setShowDialog] = useState(false);
  const { callLogs, isLoading, deleteCallLog } = useCallLogs();

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <PageHeader
        title="Call Logs"
        description="View and search call history."
        icon={PhoneCall}
        action={{
          label: "Log Call",
          onClick: () => setShowDialog(true),
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            Call History ({callLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : callLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Direction</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {log.direction === 'inbound' ? (
                        <PhoneIncoming className="h-4 w-4 text-success" />
                      ) : (
                        <PhoneOutgoing className="h-4 w-4 text-primary" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{log.contact_name}</TableCell>
                    <TableCell className="font-mono text-sm">{log.phone_number}</TableCell>
                    <TableCell>{formatDuration(log.duration)}</TableCell>
                    <TableCell>
                      {log.outcome && (
                        <Badge className={outcomeColors[log.outcome]} variant="outline">
                          {log.outcome.replace('_', ' ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{log.employees?.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(log.called_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteCallLog.mutate(log.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <PhoneCall className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No call logs yet.</p>
              <Button className="mt-4" onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Call
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CallLogDialog
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </div>
  );
}
