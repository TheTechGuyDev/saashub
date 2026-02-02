import { ArrowLeft, Clock, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Article } from "@/hooks/useArticles";
import { format } from "date-fns";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  relatedArticles?: Article[];
  onSelectRelated?: (article: Article) => void;
}

export function ArticleDetail({ article, onBack, relatedArticles = [], onSelectRelated }: ArticleDetailProps) {
  const wordCount = article.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Increment view count when article is opened
  useEffect(() => {
    const incrementViews = async () => {
      await supabase
        .from("articles")
        .update({ views: (article.views || 0) + 1 })
        .eq("id", article.id);
    };
    incrementViews();
  }, [article.id]);

  // Parse content for better display (simple markdown-like formatting)
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Check for headers (## or ###)
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-semibold mt-6 mb-3">
            {paragraph.replace('### ', '')}
          </h3>
        );
      }
      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-semibold mt-8 mb-4">
            {paragraph.replace('## ', '')}
          </h2>
        );
      }
      // Check for bullet points
      if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(line => line.startsWith('- '));
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-4 text-muted-foreground">
            {items.map((item, i) => (
              <li key={i}>{item.replace('- ', '')}</li>
            ))}
          </ul>
        );
      }
      // Check for numbered lists
      if (/^\d+\.\s/.test(paragraph)) {
        const items = paragraph.split('\n').filter(line => /^\d+\.\s/.test(line));
        return (
          <ol key={index} className="list-decimal list-inside space-y-2 my-4 text-muted-foreground">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^\d+\.\s/, '')}</li>
            ))}
          </ol>
        );
      }
      // Regular paragraph
      return (
        <p key={index} className="text-muted-foreground leading-relaxed my-4">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Articles
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main article content */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 md:p-8">
              {/* Article header */}
              <div className="mb-6">
                {article.category && (
                  <Badge variant="secondary" className="mb-3">
                    {article.category}
                  </Badge>
                )}
                <h1 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{readTime} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{(article.views || 0) + 1} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(article.updated_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Article content */}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {formatContent(article.content)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related articles sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Related Articles</h3>
              {relatedArticles.length > 0 ? (
                <div className="space-y-3">
                  {relatedArticles.slice(0, 5).map((related) => (
                    <button
                      key={related.id}
                      onClick={() => onSelectRelated?.(related)}
                      className="block w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <p className="font-medium text-sm line-clamp-2">{related.title}</p>
                      {related.category && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {related.category}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No related articles found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
