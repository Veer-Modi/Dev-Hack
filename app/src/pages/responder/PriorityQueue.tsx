import { useState } from 'react';
import { CheckCircle, Clock, Eye, MoreVertical } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockIncidents } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function PriorityQueue() {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState(
    mockIncidents
      .filter((i) => i.status !== 'resolved')
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
  );

  const handleVerify = (id: string) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'verified' as const } : i))
    );
    toast({
      title: 'Incident Verified',
      description: 'The incident has been marked as verified.',
    });
  };

  const handleAssign = (id: string) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'in-progress' as const, assignedTo: 'responder-1' } : i))
    );
    toast({
      title: 'Incident Assigned',
      description: 'You have been assigned to this incident.',
    });
  };

  return (
    <DashboardLayout role="responder" userName="Sarah Johnson">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Priority Incident Queue</h1>
          <p className="text-muted-foreground">
            Sorted by severity and time. {incidents.length} incidents pending.
          </p>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">Severity</TableHead>
                <TableHead>Incident</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Reported</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident, index) => (
                <TableRow
                  key={incident.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <TableCell>
                    <SeverityBadge severity={incident.severity} />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {incident.type}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {incident.location.address}
                    </p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusBadge status={incident.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {incident.status === 'unverified' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerify(incident.id)}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          <span className="hidden sm:inline">Verify</span>
                        </Button>
                      )}
                      {(incident.status === 'verified' || incident.status === 'partially-verified') && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAssign(incident.id)}
                        >
                          <Clock className="mr-1 h-4 w-4" />
                          <span className="hidden sm:inline">Assign</span>
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuItem>Add Note</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
