import {
  LayoutDashboard,
  Users,
  BarChart3,
  Phone,
  PhoneCall,
  UserPlus,
  UsersRound,
  FolderKanban,
  Building2,
  Wallet,
  MessageCircle,
  Share2,
  Mail,
  Ticket,
  Package,
  FileText,
  Calendar,
  BookOpen,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
  group: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigationItems: NavItem[] = [
  // Core
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, group: "Core" },
  { title: "CRM", url: "/crm", icon: Users, group: "Core" },
  { title: "Data Analysis", url: "/analytics", icon: BarChart3, group: "Core" },
  
  // Communications
  { title: "Call Centre", url: "/call-centre", icon: Phone, group: "Communications" },
  { title: "Call Logs", url: "/call-logs", icon: PhoneCall, group: "Communications" },
  { title: "WhatsApp", url: "/whatsapp", icon: MessageCircle, group: "Communications" },
  { title: "Email Marketing", url: "/email-marketing", icon: Mail, group: "Communications" },
  { title: "Support Tickets", url: "/tickets", icon: Ticket, group: "Communications" },
  
  // Operations
  { title: "Staff Management", url: "/staff", icon: UsersRound, group: "Operations" },
  { title: "Projects", url: "/projects", icon: FolderKanban, group: "Operations" },
  { title: "Branches", url: "/branches", icon: Building2, group: "Operations" },
  
  // Finance
  { title: "Finance", url: "/finance", icon: Wallet, group: "Finance" },
  { title: "Inventory", url: "/inventory", icon: Package, group: "Finance" },
  
  // Growth
  { title: "Customer Acquisition", url: "/acquisition", icon: UserPlus, group: "Growth" },
  { title: "Social Media", url: "/social-media", icon: Share2, group: "Growth" },
  
  // Resources
  { title: "Documents", url: "/documents", icon: FileText, group: "Resources" },
  { title: "Calendar", url: "/calendar", icon: Calendar, group: "Resources" },
  { title: "Knowledge Base", url: "/knowledge-base", icon: BookOpen, group: "Resources" },
  
  // Admin
  { title: "Settings", url: "/settings", icon: Settings, group: "Admin" },
];

export const getGroupedNavigation = (): NavGroup[] => {
  const groups: { [key: string]: NavItem[] } = {};
  
  navigationItems.forEach((item) => {
    if (!groups[item.group]) {
      groups[item.group] = [];
    }
    groups[item.group].push(item);
  });
  
  const groupOrder = ["Core", "Communications", "Operations", "Finance", "Growth", "Resources", "Admin"];
  
  return groupOrder
    .filter((group) => groups[group])
    .map((group) => ({
      label: group,
      items: groups[group],
    }));
};
