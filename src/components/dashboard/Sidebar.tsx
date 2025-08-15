import { Link, useLocation } from "react-router";
import { Home, Target, Trophy, Settings, BrainCircuit, MemoryStick } from "lucide-react";
import { UserButton } from "@/components/auth/UserButton";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", path: "/dashboard" },
    { id: "goals", icon: Target, label: "Goals", path: "/goals" },
    { id: "memories", icon: MemoryStick, label: "Memories", path: "/memories" },
    { id: "milestones", icon: Trophy, label: "Milestones", path: "/milestones" },
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen sticky top-0 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col justify-between p-4 font-pixel">
      <div>
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link to="/dashboard" className="flex items-center justify-center gap-2">
            <BrainCircuit className="w-10 h-10 text-sidebar-primary" />
            <span className="text-2xl font-bold tracking-widest text-shadow-pixel">LevelUp</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onTabChange(item.id)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive(item.path)
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }
              `}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-lg">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 p-2 bg-sidebar-accent rounded-lg">
        <UserButton />
        <div className="flex-grow overflow-hidden">
          <p className="text-sm font-bold truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}