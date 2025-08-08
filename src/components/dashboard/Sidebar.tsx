import { motion } from "framer-motion";
import { BarChart3, Star, Clipboard, Camera, Settings } from "lucide-react";
import { useState } from "react";

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
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <motion.button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`
              w-16 h-16 rounded-xl flex items-center justify-center
              transition-all duration-200 relative group
              ${isActive 
                ? `${item.color} text-white shadow-lg` 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={item.label}
          >
            <Icon className="w-6 h-6" />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
