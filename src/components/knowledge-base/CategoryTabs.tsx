import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Rocket, 
  LayoutDashboard, 
  MessageSquare, 
  Briefcase, 
  DollarSign, 
  TrendingUp,
  FolderOpen,
  HelpCircle,
  Grid3X3
} from "lucide-react";

export const CATEGORIES = [
  { id: "all", label: "All", icon: Grid3X3 },
  { id: "Getting Started", label: "Getting Started", icon: Rocket },
  { id: "Features", label: "Features", icon: LayoutDashboard },
  { id: "Communications", label: "Communications", icon: MessageSquare },
  { id: "Operations", label: "Operations", icon: Briefcase },
  { id: "Finance", label: "Finance", icon: DollarSign },
  { id: "Growth", label: "Growth", icon: TrendingUp },
  { id: "Resources", label: "Resources", icon: FolderOpen },
  { id: "Troubleshooting", label: "Troubleshooting", icon: HelpCircle },
] as const;

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange} className="w-full">
      <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full border border-border data-[state=active]:border-primary"
            >
              <Icon className="h-4 w-4 mr-2" />
              {category.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
