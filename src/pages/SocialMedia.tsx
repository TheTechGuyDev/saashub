import { useState } from "react";
import { Share2, Instagram, Twitter, Facebook, Linkedin, Plus, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface SocialAccount {
  id: string;
  platform: "instagram" | "twitter" | "facebook" | "linkedin";
  username: string;
  connected: boolean;
}

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledFor: Date;
  status: "scheduled" | "posted" | "failed";
}

const platformConfig = {
  instagram: { name: "Instagram", icon: Instagram, color: "text-pink-500", bgColor: "bg-pink-500/10" },
  twitter: { name: "Twitter / X", icon: Twitter, color: "text-sky-500", bgColor: "bg-sky-500/10" },
  facebook: { name: "Facebook", icon: Facebook, color: "text-blue-600", bgColor: "bg-blue-600/10" },
  linkedin: { name: "LinkedIn", icon: Linkedin, color: "text-blue-700", bgColor: "bg-blue-700/10" },
};

export default function SocialMedia() {
  const { toast } = useToast();
  const [showConnect, setShowConnect] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<keyof typeof platformConfig | null>(null);
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { id: "1", platform: "instagram", username: "", connected: false },
    { id: "2", platform: "twitter", username: "", connected: false },
    { id: "3", platform: "facebook", username: "", connected: false },
    { id: "4", platform: "linkedin", username: "", connected: false },
  ]);

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const connectedAccounts = accounts.filter(a => a.connected);

  const handleConnect = (platform: keyof typeof platformConfig) => {
    setSelectedPlatform(platform);
    setShowConnect(true);
  };

  const handleConnectSubmit = (username: string) => {
    if (!selectedPlatform || !username) return;
    setAccounts(prev => prev.map(acc =>
      acc.platform === selectedPlatform
        ? { ...acc, connected: true, username }
        : acc
    ));
    toast({
      title: "Account Connected!",
      description: `Your ${platformConfig[selectedPlatform].name} account has been connected.`,
    });
    setShowConnect(false);
    setSelectedPlatform(null);
  };

  const handleDisconnect = (platform: string) => {
    setAccounts(prev => prev.map(acc =>
      acc.platform === platform ? { ...acc, connected: false, username: "" } : acc
    ));
    toast({ title: "Account Disconnected" });
  };

  const handleCreatePost = () => {
    if (!postContent || selectedPlatforms.length === 0) {
      toast({ variant: "destructive", title: "Missing information", description: "Please add content and select platforms." });
      return;
    }
    setScheduledPosts(prev => [...prev, {
      id: crypto.randomUUID(),
      content: postContent,
      platforms: selectedPlatforms,
      scheduledFor: new Date(),
      status: "scheduled",
    }]);
    setPostContent("");
    setSelectedPlatforms([]);
    setShowCreatePost(false);
    toast({ title: "Post Scheduled" });
  };

  const togglePlatformSelection = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  return (
    <div>
      <PageHeader
        title="Social Media Management"
        description="Connect your social accounts and manage posts across platforms."
        icon={Share2}
        action={{ label: "Create Post", onClick: () => setShowCreatePost(true) }}
      />

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="posts">Scheduled Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {accounts.map((account) => {
              const config = platformConfig[account.platform];
              const Icon = config.icon;
              return (
                <Card key={account.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      {config.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {account.connected ? (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium">@{account.username}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <ExternalLink className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDisconnect(account.platform)}>
                            Disconnect
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Not Connected</span>
                        </div>
                        <Button size="sm" className="w-full" onClick={() => handleConnect(account.platform)}>
                          Connect Account
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {connectedAccounts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Connect your social media accounts to start managing posts.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          {scheduledPosts.length > 0 ? (
            <div className="grid gap-4">
              {scheduledPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="mb-2">{post.content}</p>
                        <div className="flex items-center gap-2">
                          {post.platforms.map((platform) => {
                            const config = platformConfig[platform as keyof typeof platformConfig];
                            const Icon = config.icon;
                            return (
                              <Badge key={platform} variant="outline" className="gap-1">
                                <Icon className={`h-3 w-3 ${config.color}`} />
                                {config.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <Badge variant={post.status === "posted" ? "default" : "secondary"}>{post.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No scheduled posts yet.</p>
                <Button className="mt-4" onClick={() => setShowCreatePost(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Post
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Connect Dialog */}
      <Dialog open={showConnect} onOpenChange={setShowConnect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedPlatform && platformConfig[selectedPlatform].name}</DialogTitle>
            <DialogDescription>Enter your account username to connect.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleConnectSubmit(new FormData(e.currentTarget).get("username") as string); }}>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" placeholder="@yourusername" />
              </div>
              <p className="text-sm text-muted-foreground">
                In production, this would use OAuth for secure authentication with {selectedPlatform && platformConfig[selectedPlatform].name}.
              </p>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowConnect(false)}>Cancel</Button>
                <Button type="submit">Connect</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>Share across your connected platforms.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Select Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {connectedAccounts.map((account) => {
                  const config = platformConfig[account.platform];
                  const Icon = config.icon;
                  const isSelected = selectedPlatforms.includes(account.platform);
                  return (
                    <Button key={account.id} type="button" variant={isSelected ? "default" : "outline"} size="sm" onClick={() => togglePlatformSelection(account.platform)}>
                      <Icon className={`h-4 w-4 mr-1 ${isSelected ? "" : config.color}`} /> {config.name}
                    </Button>
                  );
                })}
              </div>
              {connectedAccounts.length === 0 && <p className="text-sm text-muted-foreground">Connect at least one social account first.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Post Content</Label>
              <Textarea id="content" placeholder="What's on your mind?" value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={4} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreatePost(false)}>Cancel</Button>
              <Button onClick={handleCreatePost} disabled={connectedAccounts.length === 0 || !postContent || selectedPlatforms.length === 0}>Schedule Post</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
