import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ResponderIncidentDetails() {
  const { id } = useParams();
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Responder: Incident Details</h1>
      <p className="text-muted-foreground">Incident ID: {id}</p>
      <div className="flex gap-3">
        <Button asChild>
          <a href="#">Verify Incident</a>
        </Button>
        <Button variant="secondary" asChild>
          <a href="#">Mark In Progress</a>
        </Button>
        <Button variant="destructive" asChild>
          <a href="#">Mark Resolved</a>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/responder/queue">Back to Queue</Link>
        </Button>
      </div>
    </div>
  );
}
