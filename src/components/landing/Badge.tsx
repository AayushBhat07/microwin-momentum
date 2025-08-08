import { motion } from "framer-motion";
import { Award } from "lucide-react";

export const Badge = ({ icon: Icon = Award, name, color, delay = 0 }: { icon?: React.ElementType, name: string, color: string, delay?: number }) => (
  <motion.div
    className="flex flex-col items-center text-center gap-2 group"
    initial={{ opacity: 0, scale: 0.5 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 100, delay }}
    viewport={{ once: true }}
  >
    <motion.div
      className="w-24 h-24 rounded-full flex items-center justify-center shadow-inner transition-all duration-300"
      style={{ backgroundColor: color }}
      whileHover={{ 
        scale: 1.1, 
        boxShadow: `0 0 25px ${color}`,
      }}
    >
      <Icon className="w-12 h-12 text-foreground transition-transform duration-300 group-hover:scale-110" />
    </motion.div>
    <p className="font-bold text-sm mt-2">{name}</p>
  </motion.div>
);