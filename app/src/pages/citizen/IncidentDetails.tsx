import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function IncidentDetails() {
  const { id } = useParams();
  const { incidents, confirmIncident } = useStore();
  const incident = useMemo(() => incidents.find(i => i.id === id), [incidents, id]);
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Incident Details</h1>
      <p className="text-muted-foreground">Incident ID: {id}</p>
      {incident && (
        <p className="text-sm">{incident.title}</p>
      )}
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link to="/my-reports">Back to My Reports</Link>
        </Button>
        <Button onClick={() => id && confirmIncident(id)}>Confirm Incident</Button>
      </div>
    </div>
  );
}
