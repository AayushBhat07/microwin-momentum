import { motion } from "framer-motion";
import { BarChart3, Star, Clipboard, Camera, Settings } from "lucide-react";
import { useNavigate } from "react-router";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", icon: BarChart3, label: "Dashboard", color: "bg-teal-500" },
  { id: "milestones", icon: Star, label: "Milestones", color: "bg-pink-500" },
  { id: "goals", icon: Clipboard, label: "Goals", color: "bg-yellow-500" },
  { id: "memories", icon: Camera, label: "Memories", color: "bg-orange-500" },
  { id: "settings", icon: Settings, label: "Settings", color: "bg-gray-500" },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="w-24 bg-black/60 backdrop-blur-sm border-r-2 border-blue-900/80 flex flex-col items-center py-6 space-y-4 font-pixel">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        const handleClick = () => {
          if (item.id === "dashboard") {
            navigate("/dashboard");
          } else if (item.id === "milestones") {
            navigate("/milestones");
          } else if (item.id === "goals") {
            navigate("/goals");
          } else if (item.id === "memories") {
            navigate("/memories");
          } else if (item.id === "settings") {
            navigate("/settings");
          }
          onTabChange(item.id);
        };
        
        return (
          <motion.button
            key={item.id}
            onClick={handleClick}
            className={`
              w-16 h-16 flex items-center justify-center border-2 border-blue-700
              transition-all duration-200 relative group
              ${isActive 
                ? `bg-blue-600 text-white shadow-[4px_4px_0px_#000] -translate-x-1 -translate-y-1` 
                : 'bg-blue-900/30 text-white hover:bg-blue-800/50'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="w-8 h-8" />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-2 py-1 bg-blue-900 text-white text-xs rounded-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-blue-700">
              {item.label}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}