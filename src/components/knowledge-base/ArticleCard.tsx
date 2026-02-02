import { BookOpen, Eye, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/hooks/useArticles";

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  // Estimate read time (average 200 words per minute)
  const wordCount = article.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Card 
      className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </CardTitle>
          <BookOpen className="h-5 w-5 text-muted-foreground shrink-0" />
        </div>
        {article.category && (
          <Badge variant="secondary" className="w-fit">
            {article.category}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {article.content.substring(0, 150)}...
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{readTime} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{article.views || 0} views</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
