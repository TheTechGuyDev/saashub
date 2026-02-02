import { FileText, Upload, Folder, File } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Documents() {
  return (
    <div>
      <PageHeader
        title="Document Management"
        description="Upload, organize, and share documents."
        icon={FileText}
      />

      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Document storage requires file upload configuration.
            </p>
            <Badge variant="outline" className="mt-4">Storage Setup Required</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
