import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavLink } from "@/components/NavLink";
import { getGroupedNavigation } from "@/config/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const groups = getGroupedNavigation();
  const [openGroups, setOpenGroups] = useState<string[]>(
    groups.map((g) => g.label)
  );

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label)
        ? prev.filter((g) => g !== label)
        : [...prev, label]
    );
  };

  const isActive = (url: string) => location.pathname === url;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-xl font-bold text-sidebar-foreground">
            SaaS<span className="text-primary">Hub</span>
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-muted"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem)] scrollbar-thin">
        <nav className="p-2 space-y-2">
          {groups.map((group) => (
            <Collapsible
              key={group.label}
              open={!collapsed && openGroups.includes(group.label)}
              onOpenChange={() => !collapsed && toggleGroup(group.label)}
            >
              {!collapsed && (
                <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted-foreground hover:text-sidebar-foreground">
                  {group.label}
                </CollapsibleTrigger>
              )}
              <CollapsibleContent className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      "text-sidebar-muted-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground",
                      collapsed && "justify-center px-2"
                    )}
                    activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                ))}
              </CollapsibleContent>
              {collapsed && (
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      className={cn(
                        "flex items-center justify-center rounded-lg p-2 text-sm transition-colors",
                        "text-sidebar-muted-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground"
                      )}
                      activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      title={item.title}
                    >
                      <item.icon className="h-5 w-5" />
                    </NavLink>
                  ))}
                </div>
              )}
            </Collapsible>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
