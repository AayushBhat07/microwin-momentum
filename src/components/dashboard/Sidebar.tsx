import { motion } from "framer-motion";
import { BarChart3, Star, Clipboard, Camera, Settings } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", icon: BarChart3, label: "Dashboard", color: "bg-teal-500" },
  { id: "milestones", icon: Star, label: "Milestones", color: "bg-pink-500" },
  { id: "habits", icon: Clipboard, label: "Habits", color: "bg-yellow-500" },
  { id: "memories", icon: Camera, label: "Memories", color: "bg-orange-500" },
  { id: "settings", icon: Settings, label: "Settings", color: "bg-gray-500" },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-24 bg-background/80 backdrop-blur-sm border-r-4 border-primary flex flex-col items-center py-6 space-y-4 font-pixel">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <motion.button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`
              w-16 h-16 flex items-center justify-center border-2 border-foreground
              transition-all duration-200 relative group
              ${isActive 
                ? `bg-primary text-white shadow-[4px_4px_0px_var(--foreground)] -translate-x-1 -translate-y-1` 
                : 'bg-background text-foreground hover:bg-accent'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={item.label}
          >
            <Icon className="w-8 h-8" />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-[2px_2px_0px_var(--primary)]">
              {item.label}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}