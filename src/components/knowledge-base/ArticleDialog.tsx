import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useArticles, type Article } from "@/hooks/useArticles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type ArticleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Article | null;
  isPlatformArticle?: boolean;
};

const CATEGORIES = [
  { id: "getting-started", label: "Getting Started" },
  { id: "features", label: "Features" },
  { id: "integrations", label: "Integrations" },
  { id: "billing", label: "Billing & Payments" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "api", label: "API & Developers" },
];

export function ArticleDialog({ open, onOpenChange, article, isPlatformArticle = false }: ArticleDialogProps) {
  const { toast } = useToast();
  const { createArticle, updateArticle } = useArticles();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    published: false,
    is_platform_article: isPlatformArticle,
  });

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        category: article.category || "",
        published: article.published || false,
        is_platform_article: isPlatformArticle,
      });
    } else {
      setFormData({
        title: "",
        content: "",
        category: "",
        published: false,
        is_platform_article: isPlatformArticle,
      });
    }
  }, [article, isPlatformArticle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get user's company_id if not a platform article
      let company_id = "";
      if (!isPlatformArticle) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user?.id)
          .single();

        if (!profile?.company_id) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Company not found"
          });
          return;
        }
        company_id = profile.company_id;
      } else {
        // For platform articles, use a placeholder company_id (will be managed by Super Admin)
        const { data: companies } = await supabase
          .from("companies")
          .select("id")
          .limit(1)
          .single();
        
        company_id = companies?.id || "";
      }

      const articleData = {
        ...formData,
        company_id,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        created_by: user?.id,
      };

      if (article) {
        await updateArticle.mutateAsync({ id: article.id, ...articleData });
      } else {
        await createArticle.mutateAsync(articleData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving article:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {article ? "Edit Article" : "Create Article"}
            {isPlatformArticle && " (Platform-wide)"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="How to get started with SaasHub"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your article content here..."
              className="min-h-[300px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Supports plain text. Markdown rendering coming soon.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
            />
            <Label htmlFor="published">Published (visible to users)</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createArticle.isPending || updateArticle.isPending}
            >
              {(createArticle.isPending || updateArticle.isPending) ? "Saving..." : "Save Article"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
