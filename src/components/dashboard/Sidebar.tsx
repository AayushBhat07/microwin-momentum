import { Link, useLocation } from "react-router";
import { BrainCircuit } from "lucide-react";
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
    { id: "dashboard", label: "Dashboard", path: "/dashboard" },
    { id: "goals", label: "Goals", path: "/goals" },
    { id: "memories", label: "Memories", path: "/memories" },
    { id: "milestones", label: "Milestones", path: "/milestones" },
    { id: "settings", label: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen sticky top-0 w-64 bg-black/40 backdrop-blur-md border-r-2 border-blue-900/80 flex flex-col justify-between p-4 font-pixel text-white">
      <div>
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link to="/dashboard" className="flex items-center justify-center gap-2">
            <BrainCircuit className="w-10 h-10 text-blue-400" />
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
                flex items-center justify-center px-4 py-3 transition-all duration-200
                ${isActive(item.path)
                  ? 'bg-blue-600/80 border-2 border-blue-500 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
                  : 'bg-black/30 border-2 border-transparent hover:bg-blue-900/60 hover:border-blue-700'
                }
              `}
            >
              <span className="text-lg">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 p-2 bg-black/30 border-2 border-blue-900/80">
        <UserButton />
        <div className="flex-grow overflow-hidden">
          <p className="text-sm font-bold truncate">{user?.name}</p>
          <p className="text-xs text-blue-300 truncate">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}