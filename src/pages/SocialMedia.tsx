import { Share2, Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SocialMedia() {
  return (
    <div>
      <PageHeader
        title="Social Media Management"
        description="Manage social accounts and schedule posts."
        icon={Share2}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { name: "Instagram", icon: Instagram, color: "text-pink-500" },
          { name: "Twitter", icon: Twitter, color: "text-sky-500" },
          { name: "Facebook", icon: Facebook, color: "text-blue-600" },
          { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
        ].map((platform) => (
          <Card key={platform.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <platform.icon className={`h-5 w-5 ${platform.color}`} />
                {platform.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Not Connected</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Connect your social media accounts to start managing posts and analytics.
            </p>
            <Badge variant="outline" className="mt-4">API Integration Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
