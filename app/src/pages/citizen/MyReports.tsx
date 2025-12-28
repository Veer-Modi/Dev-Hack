import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function MyReports() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">My Reports</h1>
      <p className="text-muted-foreground">Your submitted incidents will appear here.</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link to="/report">Report Incident</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/feed">View Live Feed</Link>
        </Button>
      </div>
    </div>
  );
}
