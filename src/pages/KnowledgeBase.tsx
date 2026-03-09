import { useState } from "react";
import { BookOpen, Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useArticles, type Article } from "@/hooks/useArticles";
import { useAuth } from "@/contexts/AuthContext";
import { ArticleCard, ArticleDetail, CategoryTabs } from "@/components/knowledge-base";
import { ArticleDialog } from "@/components/knowledge-base/ArticleDialog";

export default function KnowledgeBase() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { articles, isLoading } = useArticles();
  const { isSuperAdmin } = useAuth();

  // Filter articles by search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase()) ||
      article.category?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = 
      activeCategory === "all" || 
      article.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get related articles (same category, excluding current)
  const getRelatedArticles = (article: Article) => {
    return articles.filter(a => 
      a.id !== article.id && 
      a.category === article.category
    );
  };

  // Count articles per category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return articles.length;
    return articles.filter(a => a.category === categoryId).length;
  };

  if (selectedArticle) {
    return (
      <div>
        <ArticleDetail
          article={selectedArticle}
          onBack={() => setSelectedArticle(null)}
          relatedArticles={getRelatedArticles(selectedArticle)}
          onSelectRelated={(article) => setSelectedArticle(article)}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        description="Find answers, guides, and documentation to help you use SaasHub effectively."
        icon={BookOpen}
        action={isSuperAdmin() ? {
          label: "Add Article",
          onClick: () => setDialogOpen(true),
        } : undefined}
      />

      {/* Search and filters */}
      <div className="space-y-6 mb-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles, guides, and documentation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <CategoryTabs 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
        <span>{filteredArticles.length} articles found</span>
        {activeCategory !== "all" && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveCategory("all")}
          >
            Clear filter
          </Button>
        )}
      </div>

      {/* Articles grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => setSelectedArticle(article)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                {search 
                  ? `No articles match "${search}". Try a different search term.`
                  : "There are no articles in this category yet."}
              </p>
              {search && (
                <Button variant="outline" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
