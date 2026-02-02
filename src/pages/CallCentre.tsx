import { Phone, Headphones, Users, Clock } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCallLogs } from "@/hooks/useCallLogs";

export default function CallCentre() {
  const { callLogs } = useCallLogs();

  // Calculate stats from call logs
  const todayLogs = callLogs.filter(log => {
    const today = new Date();
    const logDate = new Date(log.called_at);
    return logDate.toDateString() === today.toDateString();
  });

  const inboundToday = todayLogs.filter(log => log.direction === 'inbound').length;
  const outboundToday = todayLogs.filter(log => log.direction === 'outbound').length;
  const totalDuration = todayLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const avgDuration = todayLogs.length > 0 ? Math.round(totalDuration / todayLogs.length) : 0;

  return (
    <div>
      <PageHeader
        title="Call Centre"
        description="Manage call queues and agent assignments."
        icon={Phone}
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inbound Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">{inboundToday}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outbound Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{outboundToday}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Calls Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold">{todayLogs.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-info" />
              <span className="text-2xl font-bold">
                {Math.floor(avgDuration / 60)}:{(avgDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Agent status tracking will be available with VoIP integration.
              </p>
              <Badge variant="outline" className="mt-4">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Real-time call queue will be available with VoIP integration.
              </p>
              <Badge variant="outline" className="mt-4">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
